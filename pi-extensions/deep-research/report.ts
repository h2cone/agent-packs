// Report assembly: deterministic fallback body, Sources merging, Coverage, file write (plan §5.4).

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CONFIG_DIR_NAME } from "@earendil-works/pi-coding-agent";
import type { RunStatus, VerifiedClaim } from "./types.ts";

export function buildFallbackBody(claims: VerifiedClaim[]): string {
	return ["## Findings", ...claims.map((c, i) => `- ${JSON.stringify(c.claim)} [S${i + 1}]`)].join("\n");
}

interface SourceRow {
	citations: string[];
	title: string;
	locator: string;
	vTitle: string;
	vLocator: string;
}

export function buildFullReport(status: RunStatus, body: string, claims: VerifiedClaim[], coverageNotes: string[]): string {
	const statusLabel = status === "verified" ? "Verified" : "Partial";
	let report = `# Research result\n\n**Status: ${statusLabel}**\n\n${body}\n`;

	// Sources: merge rows with the same original+verifier title/locator tuple.
	report += "\n## Sources\n";
	const rows: SourceRow[] = [];
	const keys: string[] = [];
	claims.forEach((c, i) => {
		const key = [c.originalSourceTitle, c.originalSourceLocator, c.verifierSourceTitle, c.verifierSourceLocator].join("\n|\n");
		const idx = keys.indexOf(key);
		if (idx < 0) {
			keys.push(key);
			rows.push({ citations: [`S${i + 1}`], title: c.originalSourceTitle, locator: c.originalSourceLocator, vTitle: c.verifierSourceTitle, vLocator: c.verifierSourceLocator });
		} else {
			rows[idx].citations.push(`S${i + 1}`);
		}
	});
	for (const row of rows) {
		const ids = row.citations.map((c) => `[${c}]`).join(" ");
		let line = `- ${ids} ${JSON.stringify(row.title)} — ${JSON.stringify(row.locator)}`;
		if (row.vLocator !== row.locator || row.vTitle !== row.title) {
			line += ` (independently checked against ${JSON.stringify(row.vTitle)} — ${JSON.stringify(row.vLocator)})`;
		}
		report += line + "\n";
	}

	report += "\n## Coverage and uncertainty\n";
	if (coverageNotes.length === 0) {
		report += "- All planned questions returned usable structured research, and every retained claim passed its assigned verifier shard.\n";
	} else {
		for (const note of coverageNotes) report += `- ${JSON.stringify(note)}\n`;
	}
	return report;
}

export async function writeReport(cwd: string, fullReport: string): Promise<string> {
	const dir = join(cwd, CONFIG_DIR_NAME, "deep-research");
	await mkdir(dir, { recursive: true });
	const ts = new Date().toISOString().replace(/[:.]/g, "-");
	const path = join(dir, `${ts}-report.md`);
	await writeFile(path, fullReport, "utf8");
	return path;
}
