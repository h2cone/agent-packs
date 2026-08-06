// Extract structured data from model output. Structured output is prompt-driven
// (no provider output_schema): models reply with JSON (possibly fenced) or a
// <report-body> block; failures surface as undefined and are handled fail-closed.

export function extractJson(text: string): unknown {
	const trimmed = text.trim();
	if (!trimmed) return undefined;
	try {
		return JSON.parse(trimmed);
	} catch {
		// fall through to fenced / brace scanning
	}
	const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (fence) {
		try {
			return JSON.parse(fence[1].trim());
		} catch {
			// fall through to brace scanning
		}
	}
	const start = trimmed.indexOf("{");
	if (start < 0) return undefined;
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < trimmed.length; i++) {
		const ch = trimmed[i];
		if (inString) {
			if (escaped) escaped = false;
			else if (ch === "\\") escaped = true;
			else if (ch === '"') inString = false;
			continue;
		}
		if (ch === '"') inString = true;
		else if (ch === "{") depth++;
		else if (ch === "}" && --depth === 0) {
			try {
				return JSON.parse(trimmed.slice(start, i + 1));
			} catch {
				return undefined;
			}
		}
	}
	return undefined;
}

export function extractReportBody(text: string): string | undefined {
	const open = text.indexOf("<report-body>");
	if (open < 0) return undefined;
	const close = text.indexOf("</report-body>", open);
	if (close < 0) return undefined;
	const body = text.slice(open + "<report-body>".length, close).trim();
	return body || undefined;
}
