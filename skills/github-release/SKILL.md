---
name: github-release
description: Generates a GitHub Actions workflow for cross-platform builds and GitHub Releases with changelog-based notes, and updates the README with download links. Triggers on "set up releases", "add release workflow", "create release pipeline", or configuring CI/CD for releases.
---

Detect the project's language and build system, generate a cross-platform release workflow, ensure a changelog exists, and update the README with download instructions.

## Detect build system

Identify the language by checking for:

- **Rust** — `Cargo.toml` (use `cargo build --release --target <triple>`)
- **Go** — `go.mod` (use `GOOS`/`GOARCH` env vars with `go build`)
- **Node.js** — `package.json` with a build script (use `pkg`, `nexe`, or platform-specific bundling)
- **Python** — `pyproject.toml` or `setup.py` (use `pyinstaller` or `nuitka`)
- **C/C++** — `CMakeLists.txt` or `Makefile` (use cross-compilation toolchains)

Read the project name and current version from the manifest file. If none is found, ask the user.

## Generate the workflow

Create `.github/workflows/release.yml` triggered on version tags:

```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

Use a matrix strategy for cross-platform builds. Default targets:

| Target | Runner | Archive |
|--------|--------|---------|
| x86_64 Linux | `ubuntu-latest` | `.tar.gz` |
| aarch64 Linux | `ubuntu-latest` | `.tar.gz` |
| x86_64 macOS | `macos-latest` | `.tar.gz` |
| aarch64 macOS | `macos-latest` | `.tar.gz` |
| x86_64 Windows | `windows-latest` | `.zip` |

Use target triples matching the detected language (e.g., `x86_64-unknown-linux-gnu` for Rust, `GOOS=linux GOARCH=amd64` for Go).

The workflow needs three jobs:

1. **build** — Matrix job. Compile for each target, archive the binary as `<project>-<tag>-<target>.<ext>`, upload as artifact.
   - Use `tar -czf` for `.tar.gz` and `Compress-Archive` (Windows) or `zip` for `.zip`.
   - For Linux aarch64 cross-compilation, include appropriate setup (e.g., `cross` for Rust, cross-compile packages for C/C++).
2. **release-notes** — Extract the tagged version's section from `CHANGELOG.md`. Fall back to `git log --oneline` between the previous and current tag if `CHANGELOG.md` is missing.
3. **release** — Depends on build and release-notes. Create a GitHub Release with `softprops/action-gh-release` or `gh release create`, attach all artifacts, use extracted notes as body.

Set `permissions: contents: write` on the workflow.

Name archives: `<project>-v<version>-<target>.tar.gz` (or `.zip` for Windows).

## Ensure CHANGELOG.md

If absent, create `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [Unreleased]

## [0.1.0] - YYYY-MM-DD

### Added
- Initial release.
```

Ask the user to confirm the version number.

## Update README.md

Add or update an **Installation** section with a download table:

```markdown
## Installation

Download the latest release for your platform from
[GitHub Releases](https://github.com/<owner>/<repo>/releases/latest).

| Platform | Architecture | Download |
|----------|-------------|----------|
| Linux | x86_64 | `<project>-<tag>-x86_64-linux.tar.gz` |
| Linux | arm64 | `<project>-<tag>-aarch64-linux.tar.gz` |
| macOS | Apple Silicon | `<project>-<tag>-aarch64-darwin.tar.gz` |
| macOS | Intel | `<project>-<tag>-x86_64-darwin.tar.gz` |
| Windows | x86_64 | `<project>-<tag>-x86_64-windows.zip` |
```

Use the `/releases/latest/download/` URL pattern so links always point to the most recent release. Adapt archive names to the detected language's target naming conventions.

## Edge cases

- If `.github/workflows/release.yml` already exists, show a diff preview and ask before overwriting.
- If no tags exist, instruct the user: `git tag v0.1.0 && git push origin v0.1.0`.
- For Rust, suggest `rustup target add <triple>` or using `cross`. For Go, use `GOOS`/`GOARCH` directly — no extra tooling needed.
- If the build system is unsupported or ambiguous, ask the user for the build commands.
- Ensure the workflow uses `permissions: contents: write` so the release job can create releases and upload assets.
