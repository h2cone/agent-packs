// Fail-closed field and shard validation (plan §5.2 / §5.3, aligned with deep_research.rhai).

import type { Confidence, SourceType } from "./types.ts";

const SOURCE_TYPES = new Set(["primary", "secondary", "repository", "other"]);
const CONFIDENCES = new Set(["high", "medium", "low"]);

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export interface CleanedClaim {
	claim: string;
	evidence: string;
	sourceTitle: string;
	sourceLocator: string;
	sourceType: SourceType;
	confidence: Confidence;
}

/** A claim is usable only when the four core fields are non-empty and enums are valid. */
export function cleanClaim(raw: unknown): CleanedClaim | undefined {
	if (typeof raw !== "object" || raw === null) return undefined;
	const r = raw as Record<string, unknown>;
	const claim = str(r.claim);
	const evidence = str(r.evidence);
	const sourceTitle = str(r.source_title);
	const sourceLocator = str(r.source_locator);
	const sourceType = str(r.source_type);
	const confidence = str(r.confidence);
	if (!claim || !evidence || !sourceTitle || !sourceLocator) return undefined;
	if (!SOURCE_TYPES.has(sourceType) || !CONFIDENCES.has(confidence)) return undefined;
	return { claim, evidence, sourceTitle, sourceLocator, sourceType: sourceType as SourceType, confidence: confidence as Confidence };
}

export interface Verdict {
	claimId: string;
	supported: boolean;
	reason: string;
	evidence: string;
	sourceTitle: string;
	sourceLocator: string;
}

export function parseVerdicts(raw: unknown): Verdict[] | undefined {
	if (typeof raw !== "object" || raw === null) return undefined;
	const list = (raw as Record<string, unknown>).verdicts;
	if (!Array.isArray(list)) return undefined;
	const out: Verdict[] = [];
	for (const v of list) {
		if (typeof v !== "object" || v === null) return undefined;
		const vr = v as Record<string, unknown>;
		if (typeof vr.claim_id !== "string") return undefined;
		out.push({
			claimId: vr.claim_id,
			supported: vr.supported === true,
			reason: str(vr.reason),
			evidence: str(vr.evidence),
			sourceTitle: str(vr.source_title),
			sourceLocator: str(vr.source_locator),
		});
	}
	return out;
}

/** A shard is valid only when it has exactly one verdict per expected claim id, no extras. */
export function shardIsValid(verdicts: Verdict[], expectedIds: string[]): boolean {
	if (verdicts.length !== expectedIds.length) return false;
	const counts = new Map<string, number>();
	for (const v of verdicts) counts.set(v.claimId, (counts.get(v.claimId) ?? 0) + 1);
	for (const id of expectedIds) if (counts.get(id) !== 1) return false;
	return true;
}

/** A claim passes only when the verifier explicitly supports it with independent evidence fields. */
export function verdictAcceptsClaim(v: Verdict | undefined): v is Verdict & { evidence: string; sourceTitle: string; sourceLocator: string } {
	return !!v && v.supported && !!v.evidence && !!v.sourceTitle && !!v.sourceLocator;
}

/** Citation gate: every [S1..Sn] appears at least once, no out-of-range [Sdigits], no Sources/References section. */
export function citationsValid(body: string, n: number): boolean {
	if (!body) return false;
	for (let k = 1; k <= n; k++) {
		if (!body.includes(`[S${k}]`)) return false;
	}
	const re = /\[S(\d+)\]/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(body))) {
		const num = Number(m[1]);
		if (num < 1 || num > n) return false;
	}
	if (body.includes("## Sources") || body.includes("## References")) return false;
	return true;
}
