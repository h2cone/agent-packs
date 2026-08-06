# deep-research (pi extension)

A pi slash command that runs a bounded four-stage research pipeline entirely on the host:

`/deep-research <query>` → **Plan** → **Research** → **Verify** → **Report** → `report.md`

It mirrors the semantics of Grok Build's `/deep-research` (see `docs/deep-research-plan.md` in this
repo) without Rhai, sub-agents, workflow engines, or budgets: plain TypeScript calling the current
session model via `complete`, with host-side schema/shard/citation validation and a fail-closed
`Verified` / `Partial` status.

## Install

```bash
# global (all projects)
ln -s /path/to/agent-packs/pi-extensions/deep-research ~/.pi/agent/extensions/deep-research
```

or add to `settings.json`:

```json
{ "extensions": ["/path/to/agent-packs/pi-extensions/deep-research"] }
```

Then `/reload` in pi. The extension has no npm dependencies and no build step.

## Usage

```
/deep-research What is the default HTTP port for Redis?
/deep-research How does pnpm link workspaces? --breadth=3
```

- `--breadth=N` (2–6, default 4) caps the number of plan questions.
- Progress phases appear in a cancellable loader (Esc aborts cleanly).
- The full report is written to `<cwd>/.pi/deep-research/<timestamp>-report.md`; the chat gets a
  short summary and the path.

## Report contract

| Section | Content |
|---|---|
| Status | `Verified` (no drops/uncertainties, all claims passed) or `Partial` (any gap) |
| Body | Synthesized from verified claims only; deterministic `## Findings` bullets if synthesis/citations fail |
| Sources | `[Sn]`-tagged, merged per source tuple, with independent verifier locator when it differs |
| Coverage | Failed questions, uncertainties, dropped/excluded claims, synthesis fallback notes |

## Limitations (first version)

- **No web fetching.** Research/Verify rely on model knowledge; prompts demand verifiable
  `source_locator`s and the verify stage independently re-checks every claim (fail-closed:
  unsupported or unsourced ⇒ excluded ⇒ `Partial`). URL hallucination shows up as `Partial`
  coverage notes, never as verified facts.
- Foreground run: the loader blocks the TUI until done; Esc cancels (no partial file written).
- Sequential per-question research (parallelism is a possible later phase).
- Reports are written under `<cwd>/.pi/`; make sure `.pi/` is gitignored in your projects (this repo already does).

## Manual acceptance checklist

1. `/deep-research` (no args) → usage hint, no model call.
2. `/deep-research <real query>` → report file with Status + Sources/Coverage; no second `pi`
   process spawned.
3. Esc during the loader → clean exit, session still usable.
4. A deliberately empty/vague query → `Partial` report with coverage notes, no crash.
5. Broken synthesis (if ever tweaked) → bullet fallback body; status still decided by Verify.
