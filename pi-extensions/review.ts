import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { AssistantMessage, TextContent } from "@mariozechner/pi-ai";
import {
	isToolCallEventType,
	type ExtensionAPI,
	type ExtensionCommandContext,
} from "@mariozechner/pi-coding-agent";
import { Text } from "@mariozechner/pi-tui";

type ReviewTarget =
	| { type: "uncommittedChanges" }
	| { type: "baseBranch"; branch: string }
	| { type: "commit"; sha: string; title?: string }
	| { type: "custom"; instructions: string };

interface ReviewRequestState {
	target: ReviewTarget;
	prompt: string;
	hint: string;
}

interface CommitOption {
	sha: string;
	subject: string;
}

interface ReviewLineRange {
	start: number;
	end: number;
}

interface ReviewCodeLocation {
	absolute_file_path: string;
	line_range: ReviewLineRange;
}

interface ReviewFinding {
	title: string;
	body: string;
	confidence_score?: number;
	priority?: number;
	code_location?: ReviewCodeLocation;
}

interface ReviewOutputEvent {
	findings: ReviewFinding[];
	overall_correctness?: string;
	overall_explanation?: string;
	overall_confidence_score?: number;
}

interface ParsedReviewOutput {
	output: ReviewOutputEvent;
	parseMode: "json" | "fallback";
}

interface ReviewSummaryDetails {
	hint: string;
	output: ReviewOutputEvent;
	parseMode: "json" | "fallback";
}

const REVIEW_STATUS_KEY = "codex-review";
const REVIEW_SUMMARY_CUSTOM_TYPE = "codex-review-summary";

const REVIEW_SYSTEM_PROMPT = `# Review guidelines:

You are acting as a reviewer for a proposed code change made by another engineer.

Below are some default guidelines for determining whether the original author would appreciate the issue being flagged.

These are not the final word in determining whether an issue is a bug. In many cases, you will encounter other, more specific guidelines. These may be present elsewhere in a developer message, a user message, a file, or even elsewhere in this system message.
Those guidelines should be considered to override these general instructions.

Here are the general guidelines for determining whether something is a bug and should be flagged.

1. It meaningfully impacts the accuracy, performance, security, or maintainability of the code.
2. The bug is discrete and actionable (i.e. not a general issue with the codebase or a combination of multiple issues).
3. Fixing the bug does not demand a level of rigor that is not present in the rest of the codebase.
4. The bug was introduced in the commit or diff under review (pre-existing bugs should not be flagged).
5. The author of the original PR would likely fix the issue if they were made aware of it.
6. The bug does not rely on unstated assumptions about the codebase or author's intent.
7. It is not enough to speculate that a change may disrupt another part of the codebase; identify what is provably affected.
8. The bug is clearly not just an intentional change by the original author.

When flagging a bug, provide an accompanying comment:

1. Be clear about why the issue is a bug.
2. Communicate the severity accurately.
3. Keep it brief (at most 1 paragraph).
4. Do not include code chunks longer than 3 lines.
5. Explain scenarios/inputs required for the bug to arise.
6. Use a matter-of-fact tone.
7. Make it immediately understandable.
8. Avoid flattery and non-actionable comments.

HOW MANY FINDINGS TO RETURN:

Output all findings that the original author would fix if they knew about them. If there is no finding that is clearly worth fixing, output no findings.

GUIDELINES:

- Ignore trivial style unless it obscures meaning or violates documented standards.
- Use one comment per distinct issue (or a multi-line range if necessary).
- In every suggestion block, preserve exact leading whitespace.
- Keep line ranges short (prefer 5–10 lines max).
- The code_location should overlap with the diff.
- At the beginning of each finding title, tag priority as [P0], [P1], [P2], or [P3].
- Also include numeric priority field: 0 for P0, 1 for P1, 2 for P2, 3 for P3.

Also output an overall correctness verdict:
- "patch is correct" or "patch is incorrect".
- Correct means existing behavior/tests should not break and there are no blocking issues.
- Ignore non-blocking nits (style, formatting, typos, docs).

FORMATTING GUIDELINES:
- The finding body should be one paragraph.
- Do not output markdown fences or any extra prose.
- Output JSON only, matching this schema exactly:

{
  "findings": [
    {
      "title": "<≤ 80 chars, imperative>",
      "body": "<valid Markdown explaining why this is a problem>",
      "confidence_score": <float 0.0-1.0>,
      "priority": <int 0-3, optional>,
      "code_location": {
        "absolute_file_path": "<file path>",
        "line_range": {"start": <int>, "end": <int>}
      }
    }
  ],
  "overall_correctness": "patch is correct" | "patch is incorrect",
  "overall_explanation": "<1-3 sentence explanation>",
  "overall_confidence_score": <float 0.0-1.0>
}

Additional constraints for /review mode:
- Stay read-only. Never edit files.
- Do not run destructive shell commands.
- Do not propose or apply patches; only report findings.`;

const UNCOMMITTED_PROMPT =
	"Review the current code changes (staged, unstaged, and untracked files) and provide prioritized findings.";

const BASE_BRANCH_PROMPT_BACKUP =
	"Review the code changes against the base branch '{branch}'. Start by finding the merge diff between the current branch and {branch}'s upstream e.g. (`git merge-base HEAD \"$(git rev-parse --abbrev-ref \"{branch}@{upstream}\")\"`), then run `git diff` against that SHA to see what changes we would merge into the {branch} branch. Provide prioritized, actionable findings.";

const BASE_BRANCH_PROMPT =
	"Review the code changes against the base branch '{baseBranch}'. The merge base commit for this comparison is {mergeBaseSha}. Run `git diff {mergeBaseSha}` to inspect the changes relative to {baseBranch}. Provide prioritized, actionable findings.";

const COMMIT_PROMPT_WITH_TITLE =
	"Review the code changes introduced by commit {sha} (\"{title}\"). Provide prioritized, actionable findings.";

const COMMIT_PROMPT =
	"Review the code changes introduced by commit {sha}. Provide prioritized, actionable findings.";

const REVIEW_USAGE = [
	"Usage:",
	"  /review                      # pick target from menu (or default to uncommitted in non-UI)",
	"  /review <instructions>       # custom review instructions",
	"  /review --base <branch>      # review changes against base branch",
	"  /review --commit <sha>       # review a specific commit",
	"  /review --uncommitted        # review current staged/unstaged/untracked changes",
].join("\n");

export default function reviewExtension(pi: ExtensionAPI) {
	let pendingReview: ReviewRequestState | undefined;
	let activeReview: ReviewRequestState | undefined;

	const clearReviewState = (ctx?: { hasUI: boolean; ui: { setStatus: (key: string, text: string | undefined) => void } }) => {
		pendingReview = undefined;
		activeReview = undefined;
		if (ctx?.hasUI) {
			ctx.ui.setStatus(REVIEW_STATUS_KEY, undefined);
		}
	};

	pi.registerMessageRenderer<ReviewSummaryDetails>(REVIEW_SUMMARY_CUSTOM_TYPE, (message, { expanded }, theme) => {
		const details = message.details as ReviewSummaryDetails | undefined;
		if (!details) {
			return new Text(contentToText(message.content), 0, 0);
		}

		const lines: string[] = [];
		lines.push(theme.fg("accent", theme.bold(`Code review summary — ${details.hint}`)));

		const verdict = details.output.overall_correctness ?? "unknown";
		const verdictColor =
			verdict === "patch is correct" ? "success" : verdict === "patch is incorrect" ? "warning" : "muted";
		let verdictLine = `Verdict: ${theme.fg(verdictColor, verdict)}`;
		if (typeof details.output.overall_confidence_score === "number") {
			verdictLine += theme.fg("dim", ` (${toPercent(details.output.overall_confidence_score)})`);
		}
		lines.push(verdictLine);

		const findings = details.output.findings;
		if (findings.length === 0) {
			lines.push(theme.fg("success", "No findings reported."));
		} else {
			lines.push(theme.fg("warning", `${findings.length} finding${findings.length === 1 ? "" : "s"} reported.`));
			const visible = expanded ? findings : findings.slice(0, 3);
			for (let i = 0; i < visible.length; i++) {
				const finding = visible[i];
				lines.push(`${i + 1}. ${theme.bold(formatFindingTitle(finding))}`);

				const location = formatCodeLocation(finding.code_location);
				if (location) {
					lines.push(`   ${theme.fg("dim", location)}`);
				}

				const body = finding.body.trim();
				if (body) {
					if (expanded) {
						lines.push(`   ${body}`);
					} else {
						lines.push(`   ${theme.fg("dim", truncate(body.replace(/\s+/g, " "), 160))}`);
					}
				}
			}

			if (!expanded && findings.length > visible.length) {
				lines.push(theme.fg("dim", `…${findings.length - visible.length} more finding(s); expand to view all.`));
			}
		}

		const explanation = details.output.overall_explanation?.trim();
		if (explanation) {
			lines.push("");
			lines.push(theme.fg("muted", "Overall explanation:"));
			lines.push(expanded ? explanation : truncate(explanation.replace(/\s+/g, " "), 260));
		}

		if (details.parseMode === "fallback") {
			lines.push("");
			lines.push(theme.fg("dim", "(Reviewer output was not strict JSON; summary generated from plain text.)"));
		}

		return new Text(lines.join("\n"), 0, 0);
	});

	pi.registerCommand("review", {
		description: "Codex-style code review with prioritized findings",
		handler: async (args, ctx) => {
			if (pendingReview || activeReview) {
				ctx.ui.notify("A /review task is already running.", "warning");
				return;
			}

			if (!ctx.isIdle()) {
				ctx.ui.notify("/review is disabled while a task is in progress.", "warning");
				return;
			}

			const target = await resolveReviewTarget(args, ctx, pi);
			if (!target) return;

			let prompt: string;
			try {
				prompt = await buildReviewPrompt(target, ctx.cwd, pi);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to prepare /review: ${message}`, "error");
				return;
			}

			const hint = userFacingHint(target);
			const request: ReviewRequestState = {
				target,
				hint,
				prompt,
			};

			pendingReview = request;
			if (ctx.hasUI) {
				ctx.ui.notify(`Code review queued: ${hint}`, "info");
			}

			try {
				pi.sendUserMessage(prompt);
			} catch (error) {
				pendingReview = undefined;
				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to start /review: ${message}`, "error");
			}
		},
	});

	pi.on("before_agent_start", (event, ctx) => {
		if (!pendingReview) return;
		activeReview = pendingReview;
		pendingReview = undefined;

		if (ctx.hasUI) {
			ctx.ui.setStatus(REVIEW_STATUS_KEY, `Reviewing ${activeReview.hint}...`);
		}

		const systemPrompt = [
			event.systemPrompt,
			"",
			"You are entering dedicated /review mode for this turn.",
			REVIEW_SYSTEM_PROMPT,
		].join("\n");

		return { systemPrompt };
	});

	pi.on("tool_call", (event) => {
		if (!activeReview) return;

		if (event.toolName === "write" || event.toolName === "edit") {
			return {
				block: true,
				reason: "/review mode is read-only. Do not modify files.",
			};
		}

		if (isToolCallEventType("bash", event) && looksDestructive(event.input.command)) {
			return {
				block: true,
				reason: "/review mode blocks destructive shell commands.",
			};
		}
	});

	pi.on("agent_end", (event, ctx) => {
		if (!activeReview) return;

		const finishedReview = activeReview;
		const parsed = extractReviewOutputFromMessages(event.messages);

		if (parsed) {
			pi.sendMessage(
				{
					customType: REVIEW_SUMMARY_CUSTOM_TYPE,
					content: buildReviewContextSummary(finishedReview.hint, parsed.output),
					display: true,
					details: {
						hint: finishedReview.hint,
						output: parsed.output,
						parseMode: parsed.parseMode,
					} satisfies ReviewSummaryDetails,
				},
				{ triggerTurn: false },
			);
		} else if (ctx.hasUI) {
			ctx.ui.notify("Review finished, but no assistant output was found to summarize.", "warning");
		}

		if (ctx.hasUI) {
			ctx.ui.setStatus(REVIEW_STATUS_KEY, undefined);
			ctx.ui.notify(`Code review finished: ${finishedReview.hint}`, "info");
		}
		activeReview = undefined;
	});

	pi.on("session_start", async (_event, ctx) => {
		clearReviewState(ctx);
	});

	pi.on("session_switch", async (_event, ctx) => {
		clearReviewState(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		clearReviewState(ctx);
	});
}

async function resolveReviewTarget(
	rawArgs: string,
	ctx: ExtensionCommandContext,
	pi: ExtensionAPI,
): Promise<ReviewTarget | undefined> {
	const args = rawArgs.trim();
	if (args.length > 0) {
		if (args === "--help" || args === "-h") {
			ctx.ui.notify(REVIEW_USAGE, "info");
			return;
		}

		if (args === "--uncommitted") {
			return { type: "uncommittedChanges" };
		}

		if (args.startsWith("--base")) {
			const branch = args.slice("--base".length).trim();
			if (!branch) {
				ctx.ui.notify("Missing branch. Example: /review --base main", "warning");
				return;
			}
			return { type: "baseBranch", branch };
		}

		if (args.startsWith("--commit")) {
			const sha = args.slice("--commit".length).trim();
			if (!sha) {
				ctx.ui.notify("Missing SHA. Example: /review --commit abc1234", "warning");
				return;
			}
			const title = await resolveCommitTitle(sha, ctx.cwd, pi);
			return title ? { type: "commit", sha, title } : { type: "commit", sha };
		}

		// Codex behavior: inline args are treated as custom instructions.
		return { type: "custom", instructions: args };
	}

	if (!ctx.hasUI) {
		return { type: "uncommittedChanges" };
	}

	const preset = await ctx.ui.select("Select a review preset", [
		"Review against a base branch (PR style)",
		"Review uncommitted changes",
		"Review a commit",
		"Custom review instructions",
	]);

	if (!preset) return;

	if (preset === "Review uncommitted changes") {
		return { type: "uncommittedChanges" };
	}

	if (preset === "Review against a base branch (PR style)") {
		return pickBaseBranchTarget(ctx, pi);
	}

	if (preset === "Review a commit") {
		return pickCommitTarget(ctx, pi);
	}

	const instructions = await ctx.ui.editor("Custom review instructions", "");
	if (!instructions || !instructions.trim()) return;
	return { type: "custom", instructions: instructions.trim() };
}

async function pickBaseBranchTarget(
	ctx: ExtensionCommandContext,
	pi: ExtensionAPI,
): Promise<ReviewTarget | undefined> {
	const currentBranch = (await gitOutput(pi, ctx.cwd, ["branch", "--show-current"])) || "(detached HEAD)";
	const branchesRaw = await gitOutput(pi, ctx.cwd, ["for-each-ref", "--format=%(refname:short)", "refs/heads"]);

	if (!branchesRaw) {
		const typed = await ctx.ui.input("Base branch", "main");
		if (!typed?.trim()) return;
		return { type: "baseBranch", branch: typed.trim() };
	}

	const branches = branchesRaw
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (branches.length === 0) {
		ctx.ui.notify("No local branches found.", "warning");
		return;
	}

	const labels = branches.map((branch) => `${currentBranch} -> ${branch}`);
	const selected = await ctx.ui.select("Select a base branch", labels);
	if (!selected) return;

	const index = labels.indexOf(selected);
	if (index < 0) return;
	return { type: "baseBranch", branch: branches[index] };
}

async function pickCommitTarget(ctx: ExtensionCommandContext, pi: ExtensionAPI): Promise<ReviewTarget | undefined> {
	const raw = await gitOutput(pi, ctx.cwd, ["log", "--pretty=format:%H%x09%s", "-n", "100"]);
	if (!raw) {
		const typed = await ctx.ui.input("Commit SHA", "HEAD");
		if (!typed?.trim()) return;
		const sha = typed.trim();
		const title = await resolveCommitTitle(sha, ctx.cwd, pi);
		return title ? { type: "commit", sha, title } : { type: "commit", sha };
	}

	const commits = parseCommitOptions(raw);
	if (commits.length === 0) {
		ctx.ui.notify("No commits found.", "warning");
		return;
	}

	const labels = commits.map((c) => `${c.sha.slice(0, 7)} ${c.subject}`);
	const selected = await ctx.ui.select("Select a commit to review", labels);
	if (!selected) return;

	const index = labels.indexOf(selected);
	if (index < 0) return;

	const picked = commits[index];
	return { type: "commit", sha: picked.sha, title: picked.subject };
}

function parseCommitOptions(raw: string): CommitOption[] {
	return raw
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0)
		.map((line) => {
			const [sha, ...subjectParts] = line.split("\t");
			return {
				sha: sha.trim(),
				subject: subjectParts.join("\t").trim() || "(no subject)",
			};
		})
		.filter((entry) => entry.sha.length > 0);
}

async function buildReviewPrompt(target: ReviewTarget, cwd: string, pi: ExtensionAPI): Promise<string> {
	switch (target.type) {
		case "uncommittedChanges":
			return UNCOMMITTED_PROMPT;
		case "baseBranch": {
			const mergeBaseSha = await gitOutput(pi, cwd, ["merge-base", "HEAD", target.branch]);
			if (mergeBaseSha) {
				return BASE_BRANCH_PROMPT.replaceAll("{baseBranch}", target.branch).replace("{mergeBaseSha}", mergeBaseSha);
			}
			return BASE_BRANCH_PROMPT_BACKUP.replaceAll("{branch}", target.branch);
		}
		case "commit": {
			if (target.title) {
				return COMMIT_PROMPT_WITH_TITLE.replace("{sha}", target.sha).replace("{title}", target.title);
			}
			return COMMIT_PROMPT.replace("{sha}", target.sha);
		}
		case "custom": {
			const trimmed = target.instructions.trim();
			if (!trimmed) {
				throw new Error("Review prompt cannot be empty");
			}
			return trimmed;
		}
	}
}

function userFacingHint(target: ReviewTarget): string {
	switch (target.type) {
		case "uncommittedChanges":
			return "current changes";
		case "baseBranch":
			return `changes against '${target.branch}'`;
		case "commit": {
			const shortSha = target.sha.slice(0, 7);
			if (target.title) {
				return `commit ${shortSha}: ${target.title}`;
			}
			return `commit ${shortSha}`;
		}
		case "custom":
			return target.instructions.trim();
	}
}

async function resolveCommitTitle(sha: string, cwd: string, pi: ExtensionAPI): Promise<string | undefined> {
	const title = await gitOutput(pi, cwd, ["show", "-s", "--format=%s", sha]);
	return title || undefined;
}

async function gitOutput(pi: ExtensionAPI, cwd: string, args: string[]): Promise<string | undefined> {
	try {
		const result = await pi.exec("git", args, { cwd });
		if (result.code !== 0) return;
		const output = result.stdout.trim();
		return output.length > 0 ? output : undefined;
	} catch {
		return;
	}
}

function looksDestructive(command: string): boolean {
	const patterns = [
		/\brm\b/i,
		/\bmv\b/i,
		/\bcp\b/i,
		/\bchmod\b/i,
		/\bchown\b/i,
		/\bsed\s+-i\b/i,
		/\bperl\s+-i\b/i,
		/\btee\b/i,
		/\btruncate\b/i,
		/\bgit\s+(commit|push|rebase|reset|clean|checkout|switch|restore|apply|am|cherry-pick|merge)\b/i,
	];
	return patterns.some((regex) => regex.test(command));
}

function extractReviewOutputFromMessages(messages: AgentMessage[]): ParsedReviewOutput | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		if (!isAssistantMessage(message)) continue;
		const text = assistantText(message);
		if (!text) continue;
		return parseReviewOutput(text);
	}
	return undefined;
}

function isAssistantMessage(message: AgentMessage): message is AssistantMessage {
	return message.role === "assistant";
}

function assistantText(message: AssistantMessage): string {
	return message.content
		.filter((block): block is TextContent => block.type === "text")
		.map((block) => block.text)
		.join("\n")
		.trim();
}

function parseReviewOutput(rawText: string): ParsedReviewOutput | undefined {
	const direct = coerceReviewOutput(tryParseJson(rawText));
	if (direct) {
		return { output: direct, parseMode: "json" };
	}

	const start = rawText.indexOf("{");
	const end = rawText.lastIndexOf("}");
	if (start >= 0 && end > start) {
		const extracted = rawText.slice(start, end + 1);
		const extractedParsed = coerceReviewOutput(tryParseJson(extracted));
		if (extractedParsed) {
			return { output: extractedParsed, parseMode: "json" };
		}
	}

	const fallback = rawText.trim();
	if (!fallback) return undefined;
	return {
		parseMode: "fallback",
		output: {
			findings: [],
			overall_explanation: fallback,
		},
	};
}

function tryParseJson(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}

function coerceReviewOutput(value: unknown): ReviewOutputEvent | undefined {
	if (!isRecord(value)) return undefined;

	const findingsRaw = Array.isArray(value.findings) ? value.findings : [];
	const findings = findingsRaw.map(coerceFinding).filter((finding): finding is ReviewFinding => Boolean(finding));

	const overall_correctness = readString(value.overall_correctness);
	const overall_explanation = readString(value.overall_explanation);
	const overall_confidence_score = readNumber(value.overall_confidence_score);

	if (!overall_correctness && !overall_explanation && overall_confidence_score === undefined && findings.length === 0) {
		return undefined;
	}

	return {
		findings,
		...(overall_correctness ? { overall_correctness } : {}),
		...(overall_explanation ? { overall_explanation } : {}),
		...(overall_confidence_score !== undefined ? { overall_confidence_score } : {}),
	};
}

function coerceFinding(value: unknown): ReviewFinding | undefined {
	if (!isRecord(value)) return undefined;

	const title = readString(value.title);
	const body = readString(value.body);
	if (!title && !body) return undefined;

	const confidence_score = readNumber(value.confidence_score);
	const priority = normalizePriority(readNumber(value.priority));
	const code_location = coerceCodeLocation(value.code_location);

	return {
		title: title ?? "(untitled finding)",
		body: body ?? "",
		...(confidence_score !== undefined ? { confidence_score } : {}),
		...(priority !== undefined ? { priority } : {}),
		...(code_location ? { code_location } : {}),
	};
}

function coerceCodeLocation(value: unknown): ReviewCodeLocation | undefined {
	if (!isRecord(value)) return undefined;

	const absolute_file_path = readString(value.absolute_file_path);
	if (!absolute_file_path) return undefined;

	const line_range = coerceLineRange(value.line_range);
	if (!line_range) return undefined;

	return { absolute_file_path, line_range };
}

function coerceLineRange(value: unknown): ReviewLineRange | undefined {
	if (!isRecord(value)) return undefined;

	const start = readNumber(value.start);
	const end = readNumber(value.end);
	if (start === undefined || end === undefined) return undefined;

	return {
		start: Math.max(1, Math.trunc(start)),
		end: Math.max(1, Math.trunc(end)),
	};
}

function buildReviewContextSummary(hint: string, output: ReviewOutputEvent): string {
	const findingCount = output.findings.length;
	const verdict = output.overall_correctness ?? (findingCount > 0 ? "patch is incorrect" : "patch is correct");
	const topTitles = output.findings
		.slice(0, 2)
		.map((finding) => finding.title)
		.filter((title) => title.trim().length > 0)
		.join("; ");

	let summary = `Review summary for ${hint}: ${findingCount} finding${findingCount === 1 ? "" : "s"}, verdict: ${verdict}.`;
	if (topTitles) {
		summary += ` Top findings: ${topTitles}.`;
	}
	return summary;
}

function formatCodeLocation(location: ReviewCodeLocation | undefined): string | undefined {
	if (!location) return undefined;
	return `${location.absolute_file_path}:${location.line_range.start}-${location.line_range.end}`;
}

function formatPriorityTag(priority: number | undefined): string {
	return priority === undefined ? "" : `[P${priority}] `;
}

function formatFindingTitle(finding: ReviewFinding): string {
	const title = finding.title.trim();
	if (title.length === 0) {
		return "(untitled finding)";
	}

	// Reviewer often includes "[P1]" in title already; avoid double prefixing.
	if (/^\[P[0-3]\]\s+/i.test(title)) {
		return title;
	}

	return `${formatPriorityTag(finding.priority)}${title}`.trim();
}

function toPercent(value: number): string {
	const clamped = Math.min(1, Math.max(0, value));
	return `${Math.round(clamped * 100)}%`;
}

function truncate(text: string, maxChars: number): string {
	if (text.length <= maxChars) return text;
	return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function contentToText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "Review summary";

	const parts = content
		.map((item) => {
			if (!isRecord(item)) return undefined;
			if (item.type !== "text") return undefined;
			return readString(item.text);
		})
		.filter((part): part is string => typeof part === "string" && part.length > 0);

	return parts.length > 0 ? parts.join("\n") : "Review summary";
}

function normalizePriority(value: number | undefined): number | undefined {
	if (value === undefined) return undefined;
	const normalized = Math.trunc(value);
	if (normalized < 0 || normalized > 3) return undefined;
	return normalized;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function readNumber(value: unknown): number | undefined {
	if (typeof value !== "number" || Number.isNaN(value)) return undefined;
	return value;
}
