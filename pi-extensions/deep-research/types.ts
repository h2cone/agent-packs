// Data contracts aligned with the Grok deep-research pipeline (docs/deep-research-plan.md §6).

export type SourceType = "primary" | "secondary" | "repository" | "other";
export type Confidence = "high" | "medium" | "low";
export type RunStatus = "verified" | "partial";

export interface CandidateClaim {
	id: string; // claim-0..
	questionIndex: number;
	claim: string;
	evidence: string;
	sourceTitle: string;
	sourceLocator: string;
	sourceType: SourceType;
	confidence: Confidence;
}

export interface VerifiedClaim {
	id: string;
	claim: string;
	originalEvidence: string;
	originalSourceTitle: string;
	originalSourceLocator: string;
	verifierEvidence: string;
	verifierSourceTitle: string;
	verifierSourceLocator: string;
	verifierNote: string;
}

export interface RunResult {
	status: RunStatus;
	reportPath: string;
	chatSummary: string;
	verifiedClaimIds: string[];
}

export const DEFAULT_BREADTH = 4;
export const MIN_BREADTH = 2;
export const MAX_BREADTH = 6;
export const MAX_CLAIMS_PER_QUESTION = 6;
export const MAX_UNCERTAINTIES_PER_QUESTION = 6;
export const CANDIDATE_CAP = 24;
export const MAX_VERIFIERS = 2;
