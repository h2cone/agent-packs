// Four-stage host orchestration: Plan → Research → Verify → Report (plan §5).
// Single-threaded TypeScript; each stage is one `complete` call; all schema and
// shard validation happens here, fail-closed.

import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { complete } from "@earendil-works/pi-ai/compat";
import { uuidv7 } from "@earendil-works/pi-ai";
import { extractJson, extractReportBody } from "./parse.ts";
import { cleanClaim, citationsValid, parseVerdicts, shardIsValid, verdictAcceptsClaim, type Verdict } from "./validate.ts";
import { planPrompt, researchPrompt, synthesisPrompt, verifyPrompt, PLAN_SYSTEM, RESEARCH_SYSTEM, VERIFY_SYSTEM, SYNTHESIS_SYSTEM, type CandidateForVerify, type CitationPacketEntry } from "./prompts.ts";
import { buildFallbackBody, buildFullReport, writeReport } from "./report.ts";
import {
	CANDIDATE_CAP,
	MAX_CLAIMS_PER_QUESTION,
	MAX_UNCERTAINTIES_PER_QUESTION,
	MAX_VERIFIERS,
	type CandidateClaim,
	type RunResult,
	type RunStatus,
	type VerifiedClaim,
} from "./types.ts";

export type PhaseCallback = (phase: string) => void;

export async function runDeepResearch(
	ctx: ExtensionCommandContext,
	query: string,
	breadth: number,
	signal: AbortSignal | undefined,
	onPhase: PhaseCallback,
): Promise<RunResult> {
	const coverageNotes: string[] = [];
	let partial = false;
	let droppedClaims = 0;
	let successfulQuestions = 0;

	// One complete wrapper for every stage: current session model, isolated cache/session.
	const completeText = async (system: string, user: string): Promise<string> => {
		const auth = await ctx.modelRegistry.getApiKeyAndHeaders(ctx.model!);
		if (!auth.ok) throw new Error(auth.error);
		if (!auth.apiKey) throw new Error(`No API key for ${ctx.model!.provider}`);
		const response = await complete(
			ctx.model!,
			{
				systemPrompt: system,
				messages: [{ role: "user", content: [{ type: "text", text: user }], timestamp: Date.now() }],
			},
			{ apiKey: auth.apiKey, headers: auth.headers, env: auth.env, signal, cacheRetention: "none", sessionId: uuidv7() },
		);
		if (response.stopReason === "aborted") throw new Error("aborted");
		return response.content
			.filter((c): c is { type: "text"; text: string } => c.type === "text")
			.map((c) => c.text)
			.join("\n");
	};

	// ── Phase: Plan ─────────────────────────────────────────────────────────────
	onPhase("Plan…");
	let questions: string[] = [];
	try {
		const parsed = extractJson(await completeText(PLAN_SYSTEM, planPrompt(query, breadth))) as { questions?: unknown } | null;
		questions = Array.isArray(parsed?.questions)
			? parsed!.questions.filter((q): q is string => typeof q === "string" && q.trim() !== "").slice(0, breadth).map((q) => q.trim())
			: [];
	} catch (err) {
		console.error("deep-research: planner failed, researching the original query as one question:", err);
	}
	if (questions.length === 0) questions = [query];

	// ── Phase: Research ─────────────────────────────────────────────────────────
	const candidates: CandidateClaim[] = [];
	for (let i = 0; i < questions.length; i++) {
		onPhase(`Research ${i + 1}/${questions.length}…`);
		let parsed: { claims?: unknown; uncertainties?: unknown } | null = null;
		try {
			parsed = extractJson(await completeText(RESEARCH_SYSTEM, researchPrompt(questions[i]))) as { claims?: unknown; uncertainties?: unknown } | null;
		} catch (err) {
			console.error("deep-research: researcher failed:", err);
		}
		if (!parsed || !Array.isArray(parsed.claims) || !Array.isArray(parsed.uncertainties)) {
			partial = true;
			coverageNotes.push(`Question ${i + 1} failed or returned unusable structured research: ${questions[i]}`);
			continue;
		}
		successfulQuestions++;
		for (const u of parsed.uncertainties.slice(0, MAX_UNCERTAINTIES_PER_QUESTION)) {
			if (typeof u === "string" && u.trim() !== "") {
				partial = true;
				coverageNotes.push(`Question ${i + 1} uncertainty: ${u.trim()}`);
			}
		}
		for (const raw of parsed.claims.slice(0, MAX_CLAIMS_PER_QUESTION)) {
			const cleaned = cleanClaim(raw);
			if (cleaned && candidates.length < CANDIDATE_CAP) {
				candidates.push({ id: `claim-${candidates.length}`, questionIndex: i, ...cleaned });
			} else {
				droppedClaims++;
			}
		}
	}
	if (droppedClaims > 0) {
		partial = true;
		coverageNotes.push(`${droppedClaims} malformed or over-cap candidate claim(s) were excluded before verification.`);
	}
	if (successfulQuestions < questions.length) partial = true;
	if (candidates.length === 0) {
		partial = true;
		coverageNotes.push("No factual claim had both traceable evidence and a precise source locator.");
		return earlyPartial(ctx, coverageNotes, "No supported factual answer could be produced.", onPhase);
	}

	// ── Phase: Verify (fail-closed) ─────────────────────────────────────────────
	const verifierCount = Math.min(MAX_VERIFIERS, candidates.length);
	const shards: CandidateClaim[][] = Array.from({ length: verifierCount }, () => []);
	candidates.forEach((c, i) => shards[i % verifierCount].push(c));
	const shardResults: Verdict[][] = [];
	const shardValid: boolean[] = [];
	for (let s = 0; s < verifierCount; s++) {
		onPhase(`Verify ${s + 1}/${verifierCount}…`);
		let verdicts: Verdict[] | undefined;
		try {
			const packet: CandidateForVerify[] = shards[s].map((c) => ({
				id: c.id,
				claim: c.claim,
				evidence: c.evidence,
				source_title: c.sourceTitle,
				source_locator: c.sourceLocator,
			}));
			verdicts = parseVerdicts(extractJson(await completeText(VERIFY_SYSTEM, verifyPrompt(packet))));
		} catch (err) {
			console.error("deep-research: verifier failed:", err);
		}
		const valid = !!verdicts && shardIsValid(verdicts, shards[s].map((c) => c.id));
		if (!valid) {
			partial = true;
			coverageNotes.push(`Verifier shard ${s + 1} failed exact claim-ID validation; all assigned claims were excluded.`);
		}
		shardValid.push(valid);
		shardResults.push(verdicts ?? []);
	}

	const verified: VerifiedClaim[] = [];
	candidates.forEach((c, i) => {
		const verdict = shardValid[i % verifierCount] ? shardResults[i % verifierCount].find((v) => v.claimId === c.id) : undefined;
		if (verdictAcceptsClaim(verdict)) {
			verified.push({
				id: c.id,
				claim: c.claim,
				originalEvidence: c.evidence,
				originalSourceTitle: c.sourceTitle,
				originalSourceLocator: c.sourceLocator,
				verifierEvidence: verdict.evidence,
				verifierSourceTitle: verdict.sourceTitle,
				verifierSourceLocator: verdict.sourceLocator,
				verifierNote: verdict.reason,
			});
		} else {
			partial = true;
			coverageNotes.push(`Claim ${c.id} was excluded by verification${verdict?.reason ? `: ${verdict.reason}` : ""}.`);
		}
	});
	if (verified.length === 0) {
		partial = true;
		coverageNotes.push("No candidate claim survived its assigned verifier shard.");
		return earlyPartial(ctx, coverageNotes, "None of the candidate claims survived independent source verification.", onPhase);
	}

	// ── Phase: Report ───────────────────────────────────────────────────────────
	onPhase("Report…");
	const status: RunStatus = partial ? "partial" : "verified";
	let body = buildFallbackBody(verified);
	try {
		const packet: CitationPacketEntry[] = verified.map((v, i) => ({
			citation: `S${i + 1}`,
			claim: v.claim,
			evidence: v.originalEvidence,
			source_title: v.originalSourceTitle,
			confidence_note: v.verifierNote,
		}));
		const draft = extractReportBody(await completeText(SYNTHESIS_SYSTEM, synthesisPrompt(query, packet)));
		if (draft && citationsValid(draft, verified.length)) {
			body = draft;
		} else {
			// Fallback keeps the status decided by Verify; only Coverage records the gap.
			coverageNotes.push("The synthesized report body failed citation validation; the deterministic finding list is shown instead.");
		}
	} catch (err) {
		console.error("deep-research: report synthesis failed, using deterministic body:", err);
		coverageNotes.push("Report synthesis failed; the deterministic finding list is shown instead.");
	}

	const fullReport = buildFullReport(status, body, verified, coverageNotes);
	const reportPath = await writeReport(ctx.cwd, fullReport);
	const chatSummary = status === "partial" ? `**Status: Partial** — see the full report for coverage gaps.\n\n${body}` : body;
	onPhase(`Done (${status === "verified" ? "Verified" : "Partial"})`);
	return { status, reportPath, chatSummary, verifiedClaimIds: verified.map((v) => v.id) };
}

async function earlyPartial(
	ctx: ExtensionCommandContext,
	coverageNotes: string[],
	body: string,
	onPhase: PhaseCallback,
): Promise<RunResult> {
	onPhase("Report…");
	const reportPath = await writeReport(ctx.cwd, buildFullReport("partial", body, [], coverageNotes));
	onPhase("Done (Partial)");
	return { status: "partial", reportPath, chatSummary: `**Status: Partial** — see the full report for coverage gaps.\n\n${body}`, verifiedClaimIds: [] };
}
