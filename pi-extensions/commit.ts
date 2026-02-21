import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { AssistantMessage, TextContent } from "@mariozechner/pi-ai";
import type { ExecResult, ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

interface CommitRequestState {
	cwd: string;
	prompt: string;
	changedFiles: string[];
}

interface ParsedCommitArgs {
	extraInstructions?: string;
}

const COMMIT_STATUS_KEY = "codex-commit";

const COMMIT_USAGE = [
	"Usage:",
	"  /commit                    # stage all changes, generate message, commit",
	"  /commit <instructions>     # add extra commit-message instructions",
].join("\n");

const COMMIT_SYSTEM_PROMPT = `You are in dedicated /commit mode for this turn.
Generate a git commit message for the provided staged changes.

Rules:
- Output plain text commit message only.
- Do not use markdown, code fences, quotes, numbering, or explanations.
- A one-line subject is acceptable.
- A multi-line message with body is also acceptable when helpful.
- Keep the subject concise and imperative.
- Conventional Commit format is optional, not required.`;

const MAX_DIFF_CHARS = 12_000;

export default function commitExtension(pi: ExtensionAPI) {
	let pendingCommit: CommitRequestState | undefined;
	let activeCommit: CommitRequestState | undefined;

	const clearCommitState = (ctx?: Pick<ExtensionContext, "hasUI" | "ui">) => {
		pendingCommit = undefined;
		activeCommit = undefined;
		if (ctx?.hasUI) {
			ctx.ui.setStatus(COMMIT_STATUS_KEY, undefined);
		}
	};

	pi.registerCommand("commit", {
		description: "generate a commit message and commit current git changes",
		handler: async (rawArgs, ctx) => {
			if (pendingCommit || activeCommit) {
				ctx.ui.notify("A /commit task is already running.", "warning");
				return;
			}

			if (!ctx.isIdle()) {
				ctx.ui.notify("/commit is disabled while a task is in progress.", "warning");
				return;
			}

			const parsed = parseCommitArgs(rawArgs, ctx);
			if (!parsed) return;

			let request: CommitRequestState;
			try {
				request = await prepareCommitRequest(pi, ctx.cwd, parsed);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to prepare /commit: ${message}`, "error");
				return;
			}

			pendingCommit = request;
			if (ctx.hasUI) {
				ctx.ui.setStatus(COMMIT_STATUS_KEY, "Generating commit message...");
				ctx.ui.notify("/commit: staged changes and queued commit message generation.", "info");
			}

			try {
				pi.sendUserMessage(request.prompt);
			} catch (error) {
				clearCommitState(ctx);
				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to start /commit: ${message}`, "error");
			}
		},
	});

	pi.on("before_agent_start", (event, ctx) => {
		if (!pendingCommit) return;
		activeCommit = pendingCommit;
		pendingCommit = undefined;

		if (ctx.hasUI) {
			ctx.ui.setStatus(COMMIT_STATUS_KEY, "Generating commit message...");
		}

		return {
			systemPrompt: [event.systemPrompt, "", COMMIT_SYSTEM_PROMPT].join("\n"),
		};
	});

	pi.on("tool_call", () => {
		if (!activeCommit) return;
		return {
			block: true,
			reason: "/commit message generation does not require tool calls.",
		};
	});

	pi.on("agent_end", async (event, ctx) => {
		if (!activeCommit) return;
		const finishedCommit = activeCommit;
		activeCommit = undefined;

		const generatedMessage =
			extractGeneratedCommitMessage(event.messages) ?? fallbackCommitMessage(finishedCommit.changedFiles);

		if (!generatedMessage) {
			if (ctx.hasUI) {
				ctx.ui.notify("Failed to generate a commit message.", "error");
				ctx.ui.setStatus(COMMIT_STATUS_KEY, undefined);
			}
			return;
		}

		const commitResult = await pi.exec("git", ["commit", "-m", generatedMessage], { cwd: finishedCommit.cwd });
		if (commitResult.code !== 0) {
			if (ctx.hasUI) {
				ctx.ui.notify(`git commit failed: ${formatExecError(commitResult)}`, "error");
				ctx.ui.setStatus(COMMIT_STATUS_KEY, undefined);
			}
			return;
		}

		if (ctx.hasUI) {
			ctx.ui.setStatus(COMMIT_STATUS_KEY, undefined);
			ctx.ui.notify(`Committed: ${generatedMessage}`, "info");
		}
	});

	pi.on("session_start", async (_event, ctx) => {
		clearCommitState(ctx);
	});

	pi.on("session_switch", async (_event, ctx) => {
		clearCommitState(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		clearCommitState(ctx);
	});
}

function parseCommitArgs(rawArgs: string, ctx: Pick<ExtensionContext, "ui">): ParsedCommitArgs | undefined {
	const args = rawArgs.trim();
	if (args.length === 0) return {};

	if (args === "--help" || args === "-h") {
		ctx.ui.notify(COMMIT_USAGE, "info");
		return;
	}

	return { extraInstructions: args };
}

async function prepareCommitRequest(pi: ExtensionAPI, cwd: string, args: ParsedCommitArgs): Promise<CommitRequestState> {
	const repoCheck = await pi.exec("git", ["rev-parse", "--is-inside-work-tree"], { cwd });
	if (repoCheck.code !== 0) {
		throw new Error("Current directory is not a git repository.");
	}

	const status = await pi.exec("git", ["status", "--porcelain"], { cwd });
	if (status.code !== 0) {
		throw new Error(`Failed to read git status: ${formatExecError(status)}`);
	}
	if (status.stdout.trim().length === 0) {
		throw new Error("No changes found to commit.");
	}

	const addResult = await pi.exec("git", ["add", "-A"], { cwd });
	if (addResult.code !== 0) {
		throw new Error(`Failed to stage changes: ${formatExecError(addResult)}`);
	}

	const filesResult = await pi.exec("git", ["diff", "--cached", "--name-only"], { cwd });
	if (filesResult.code !== 0) {
		throw new Error(`Failed to list staged files: ${formatExecError(filesResult)}`);
	}

	const changedFiles = filesResult.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (changedFiles.length === 0) {
		throw new Error("No staged changes found after staging.");
	}

	const statResult = await pi.exec("git", ["diff", "--cached", "--stat"], { cwd });
	if (statResult.code !== 0) {
		throw new Error(`Failed to read staged diff stat: ${formatExecError(statResult)}`);
	}

	const diffResult = await pi.exec("git", ["diff", "--cached", "--no-color"], { cwd });
	if (diffResult.code !== 0) {
		throw new Error(`Failed to read staged diff: ${formatExecError(diffResult)}`);
	}

	return {
		cwd,
		changedFiles,
		prompt: buildCommitPrompt(changedFiles, statResult.stdout.trim(), diffResult.stdout, args.extraInstructions),
	};
}

function buildCommitPrompt(
	changedFiles: string[],
	diffStat: string,
	diff: string,
	extraInstructions?: string,
): string {
	const listedFiles = changedFiles.slice(0, 200);
	const fileSection = listedFiles.map((file) => `- ${file}`).join("\n");
	const omittedCount = changedFiles.length - listedFiles.length;
	const omitted = omittedCount > 0 ? `\n- ... (${omittedCount} more files)` : "";

	const lines: string[] = [];
	lines.push("Generate a git commit message for the staged changes.");
	lines.push("Output commit message text only (subject, optional body).");
	if (extraInstructions?.trim()) {
		lines.push("");
		lines.push("Additional instructions:");
		lines.push(extraInstructions.trim());
	}

	lines.push("");
	lines.push("Staged files:");
	lines.push(fileSection + omitted);

	if (diffStat.trim()) {
		lines.push("");
		lines.push("Diff stat:");
		lines.push(diffStat.trim());
	}

	lines.push("");
	lines.push(`Patch excerpt (truncated to ${MAX_DIFF_CHARS} chars):`);
	lines.push(truncate(diff.trim(), MAX_DIFF_CHARS));

	return lines.join("\n");
}

function fallbackCommitMessage(changedFiles: string[]): string {
	if (changedFiles.length === 0) {
		return "Update project files";
	}

	const docsOnly = changedFiles.every((file) => file.endsWith(".md") || file.startsWith("docs/"));
	if (docsOnly) {
		return changedFiles.length === 1 ? "Update documentation" : "Update documentation files";
	}

	const testsOnly = changedFiles.every((file) => /(^|\/)(test|tests|__tests__)\//.test(file) || file.endsWith(".test.ts"));
	if (testsOnly) {
		return changedFiles.length === 1 ? "Update test coverage" : "Update tests";
	}

	return changedFiles.length === 1 ? "Update project file" : `Update ${changedFiles.length} files`;
}

function extractGeneratedCommitMessage(messages: AgentMessage[]): string | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		const message = messages[i];
		if (!isAssistantMessage(message)) continue;
		const text = assistantText(message);
		if (!text) continue;
		return normalizeCommitMessage(text);
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

function normalizeCommitMessage(raw: string): string | undefined {
	const text = stripCodeFence(raw.trim());
	if (!text) return undefined;

	let lines = text.split(/\r?\n/).map((line) => line.replace(/\s+$/g, ""));

	while (lines.length > 0 && lines[0].trim().length === 0) {
		lines = lines.slice(1);
	}
	while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
		lines = lines.slice(0, -1);
	}
	if (lines.length === 0) return undefined;

	const firstLine = lines[0].trim();
	if (/^here(?:'s| is)\s+(?:a\s+)?commit message[:：]?$/i.test(firstLine)) {
		lines = lines.slice(1);
	} else {
		lines[0] = lines[0]
			.replace(/^\s*commit\s+message\s*[:：]\s*/i, "")
			.replace(/^\s*message\s*[:：]\s*/i, "")
			.replace(/^\s*\d+[.)]\s+/, "")
			.replace(/^\s*[-*]\s+/, "");
	}

	while (lines.length > 0 && lines[0].trim().length === 0) {
		lines = lines.slice(1);
	}
	while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
		lines = lines.slice(0, -1);
	}
	if (lines.length === 0) return undefined;

	let cleaned = lines.join("\n").trim();
	if (isWrappedInQuotes(cleaned)) {
		cleaned = cleaned.slice(1, -1).trim();
	}

	return cleaned.length > 0 ? cleaned : undefined;
}

function stripCodeFence(text: string): string {
	const fenceMatch = text.match(/^```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)\n```$/);
	if (fenceMatch?.[1]) {
		return fenceMatch[1].trim();
	}
	return text;
}

function isWrappedInQuotes(text: string): boolean {
	if (text.length < 2) return false;
	return (
		(text.startsWith('"') && text.endsWith('"')) ||
		(text.startsWith("'") && text.endsWith("'")) ||
		(text.startsWith("`") && text.endsWith("`"))
	);
}

function truncate(text: string, maxChars: number): string {
	if (text.length <= maxChars) return text;
	return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

function formatExecError(result: ExecResult): string {
	const stderr = result.stderr.trim();
	const stdout = result.stdout.trim();
	if (stderr.length > 0) return stderr;
	if (stdout.length > 0) return stdout;
	if (result.killed) return "process killed";
	return `exit code ${result.code}`;
}
