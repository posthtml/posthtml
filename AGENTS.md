# Working on the PostHTML packages

## Repository boundaries

These are three independent Git repositories, normally checked out as siblings:

```text
<workspace>/posthtml
<workspace>/posthtml-parser
<workspace>/posthtml-render
```

| Repository | Responsibility | Main files |
| --- | --- | --- |
| `posthtml` | Plugin pipeline, tree helpers and lazy processing results | `lib/index.js`, `lib/api.js`, `types/posthtml.d.ts` |
| `posthtml-parser` | Adapt htmlparser2 events to the PostHTML tree | `src/index.ts`, `src/location-tracker.ts` |
| `posthtml-render` | Serialize the tree, attributes and single tags | `src/index.ts` |

Read the target repository's `AGENTS.md`, contributor instructions, `package.json` and Git status before changing it. Discover the actual checkout paths; a sibling may be absent. Keep changes, branches, commits and release artifacts scoped to their owning repository. Preserve pre-existing work.

This file is the cross-package guide. The sibling guides also contain standalone package-specific instructions. A standalone clone can consult this guide at `https://github.com/posthtml/posthtml/blob/master/AGENTS.md`.

## Dependency direction and compatibility

```text
htmlparser2 -> posthtml-parser -> posthtml
                    types -> posthtml-render -> posthtml
                              is-json -> posthtml-render
```

The renderer has its own runtime dependencies; its parser dependency is currently for development and AST declarations. Do not turn a type-only relationship into a runtime dependency.

- Derive runtime Node.js requirements from actual runtime dependencies and synchronous CommonJS/ESM loading. Development tools do not determine the public runtime minimum.
- The current integration uses published `posthtml-parser ^0.13.0` and `posthtml-render ^3.0.0`; manifests and npm metadata are authoritative when updating this baseline.
- Use Node.js 24, selected by `.nvmrc`, for PostHTML and parser development. Renderer still has a legacy toolchain and a Node.js 12/14/16 CI matrix; follow its own guide rather than assuming identical scripts.
- A parser AST or declaration change must be checked against both renderer consumption and the core pipeline. A renderer change must be checked against parser output and core rendering options.
- Publish changed leaf packages before updating/publishing the core dependency ranges. A leaf with only contributor documentation changes needs no npm release.

## Commands in this repository

Run commands from the repository root, or set the tool's working directory explicitly:

```sh
nvm use
npm ci
npm run check
```

`check` runs lint, current/minimum TypeScript consumer checks, the Mocha/Chai suite with coverage, and native Node.js consumer tests. `npm test` runs the core suite; `npm run test:package` checks processing modes and CJS/ESM loading. Keep `.mocharc.json` restricted to `test/*.js` so separate `.cjs` helpers are not accidentally loaded as Mocha tests.

Coverage must satisfy `.c8rc`: 100% statements/functions/lines and at least 95% branches. Keep meaningful assertions; do not weaken thresholds to hide a regression.

The public declarations are maintained by hand. The CJS/ESM fixtures in `test/types` cover existing entrypoints and backend integration; extend them for any type behavior being changed. Avoid unrelated AST-type rewrites during a dependency update.

`docs/api.md` and `docs/core.md` are generated from JSDoc with `npm run docs:api` and `npm run docs:core`. Regenerate them when changing public JSDoc, and review the resulting diff.

## Test installed packages

After checking a package, pack its built output. For core changes:

```sh
mkdir -p artifacts
npm pack --ignore-scripts --pack-destination artifacts
npm run test:packed -- artifacts/posthtml-<version>.tgz
```

For local parser/renderer changes, build and check those repositories first, then pass their actual tarballs:

```sh
npm run test:packed -- artifacts/posthtml-<version>.tgz --parser /path/to/posthtml-parser-<version>.tgz --render /path/to/posthtml-render-<version>.tgz
```

Pass exactly one core tarball; avoid a wildcard that also matches old versions. Omit a leaf flag to use the core's published dependency range. Use tarballs and isolated consumers rather than `npm link`, which can hide missing files or incorrect dependency ranges.

`test/packed.cjs` installs the production package separately from the exact Mocha/Chai versions recorded in the core lockfile, copies the test fixtures, then runs the complete existing suite and native consumer checks against the installed code. Failed fixtures are preserved for debugging; successful ones are removed. `POSTHTML_TEST_TMP` can select the temporary parent directory.

CI checks on Node.js 24, then runs these packed tests on both minimum runtimes and the supported runtime matrix. Changes to this protocol must keep the full suite, not just an import smoke test.

## Contracts to preserve

- Keep the default CommonJS factory and native ESM default-import interop. Preserve existing deep JS imports such as `posthtml/lib/api`; adding an `exports` map can restrict them.
- Keep synchronous, Promise and callback plugins, variadic `.use()`, `skipParse`, replacement roots, error propagation, messages and original source behavior.
- Callback dispatch depends on function arity. Do not wrap callback plugins in a way that changes their effective signature.
- `.html` is a lazy getter. Later tree changes must remain visible when it is read again.
- Tree helpers are synchronous and are attached to the root. Traversal callbacks can see text as well as elements; nested nodes are not automatically processor instances.
- Parser defaults preserve case and entities. Comments/directives are strings; attribute and source-location behavior is part of the public contract.
- Renderer options control quoting, JSON attributes, boolean attributes, void tags and `tag: false` unwrapping. Test exact HTML rather than only checking that rendering succeeds.
- Use a fresh processor for independent tests. Options/source/messages are instance state, and custom parser/render selection also currently has module-level state. Isolate override tests; fix state/reuse bugs as focused, reproduced changes rather than incidental dependency cleanup.

## Commits and releases

Follow `.github/contributing.md`. Commit prefixes are optional guidance; checks run in CI and before npm publication. Commit lockfiles with dependency changes. Keep generated `dist`, coverage, packed archives and temporary consumer installs out of commits.

Keep changelog history and maintain `Unreleased` notes by hand. Runtime minimum changes and other breaking changes in a 0.x package require the next minor release, not a patch release.

Release in dependency order: changed parser/renderer packages, then core. Verify leaf versions exist in npm before using their ranges in a core release. Prepare a release PR, merge its successful checks, then tag the tested master commit and publish that checkout only when explicitly requested.

For publication, use the official npm CLI and user-completed authentication/2FA. Do not put credentials or temporary authentication URLs in commits or PRs. Report authentication failures clearly. After publication, verify npm's version/dist-tag, Git head/checksum and a fresh registry install before claiming success.
