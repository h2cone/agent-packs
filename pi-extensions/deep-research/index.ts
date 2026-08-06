// /deep-research entry point: argument parsing, prechecks, loader UI, notifications.
// See docs/deep-research-plan.md for the full design.

import type { ExtensionAPI, ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { BorderedLoader } from "@earendil-works/pi-coding-agent";
import { runDeepResearch, type PhaseCallback } from "./pipeline.ts";
import type { RunResult } from "./types.ts";
import { DEFAULT_BREADTH, MAX_BREADTH, MIN_BREADTH } from "./types.ts";

type Outcome = { ok: true; result: RunResult } | { ok: false; error: string };

function parseArgs(args: string): { query: string; breadth: number } {
	const match = args.match(/--breadth=(\d+)/);
	const breadth = match ? Number(match[1]) : DEFAULT_BREADTH;
	return {
		query: args.replace(/--breadth=\d+\s*/, "").trim(),
		breadth: breadth >= MIN_BREADTH && breadth <= MAX_BREADTH ? breadth : DEFAULT_BREADTH,
	};
}

// BorderedLoader keeps its message setter private; expose it for per-phase updates.
function setLoaderMessage(loader: BorderedLoader, message: string): void {
	(loader as unknown as { loader: { setMessage(m: string): void } }).loader.setMessage(message);
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("deep-research", {
		description: "Bounded research: plan → claims → verify → cited report",
		handler: async (args, ctx) => {
			const { query, breadth } = parseArgs(args.trim());
			if (!query) {
				ctx.ui.notify("Usage: /deep-research <query> [--breadth=2..6]", "error");
				return;
			}
			if (!ctx.model) {
				ctx.ui.notify("No model selected", "error");
				return;
			}
			if (!ctx.modelRegistry.hasConfiguredAuth(ctx.model)) {
				ctx.ui.notify(`No credentials configured for ${ctx.model.provider}`, "error");
				return;
			}
			await ctx.waitForIdle();

			const finish = (result: RunResult) =>
				ctx.ui.notify(`${result.status === "verified" ? "Done (Verified)" : "Done (Partial)"}: ${result.reportPath}`, "info");

			if (ctx.mode === "tui") {
				const outcome = await ctx.ui.custom<Outcome | null>((tui, theme, _kb, done) => {
					const loader = new BorderedLoader(tui, theme, "Plan…");
					loader.onAbort = () => done(null);
					runDeepResearch(ctx, query, breadth, loader.signal, (phase) => setLoaderMessage(loader, phase))
						.then((result) => done({ ok: true, result }))
						.catch((err) => {
							console.error("deep-research failed:", err);
							done({ ok: false, error: err instanceof Error ? err.message : String(err) });
						});
					return loader;
				});
				if (outcome === null) {
					ctx.ui.notify("Deep research cancelled", "info");
					return;
				}
				if (!outcome.ok) {
					ctx.ui.notify(`Deep research failed: ${outcome.error}`, "error");
					return;
				}
				finish(outcome.result);
				return;
			}

			// Non-TUI: foreground run with notify progress.
			const onPhase: PhaseCallback = (phase) => ctx.ui.notify(`deep-research: ${phase}`, "info");
			try {
				finish(await runDeepResearch(ctx, query, breadth, undefined, onPhase));
			} catch (err) {
				ctx.ui.notify(`Deep research failed: ${err instanceof Error ? err.message : String(err)}`, "error");
			}
		},
	});
}
