# Contributing

## Development

Use Node.js 24 from `.nvmrc`:

```sh
nvm install
nvm use
npm ci
npm run check
```

`npm run check` runs ESLint, current/minimum TypeScript consumer checks, the Mocha/Chai suite with coverage, and native Node.js package checks. Tests must return their Promise, use `async`/`await`, or call Mocha's `done` callback so asynchronous assertions are awaited.

Coverage must remain at 100% statements/functions/lines and at least 95% branches. `npm test` runs the core suite; `npm run test:package` checks public processing modes and CommonJS/ESM loading.

The public declarations in `types/posthtml.d.ts` are maintained by hand. Add consumer fixtures in `test/types` when changing type behavior. Public JSDoc changes require reviewing generated `docs/api.md` and `docs/core.md` using `npm run docs:api` and `npm run docs:core`.

## Parser and renderer work

Read [AGENTS.md](../AGENTS.md) for the three-repository map and cross-package protocol. Inspect each repository's own instructions and Git status before editing it.

The Node.js runtime minimum follows `posthtml-parser`, its `htmlparser2` backend, and `posthtml-render`, including synchronous module-loading requirements. New development tools do not by themselves raise the version required by users.

Check and pack local parser/renderer candidates first. Then test the core tarball with the relevant leaf flags:

```sh
npm run test:packed -- /path/to/posthtml.tgz --parser /path/to/posthtml-parser.tgz --render /path/to/posthtml-render.tgz
```

Omit a leaf flag to use the published core dependency range. The helper installs the production package and test tooling separately, then runs the complete existing suite and package checks against installed code. CI repeats this on the supported runtime matrix.

## Commits and pull requests

- Keep commits focused and use short, imperative subjects. Prefixes such as `fix:`, `docs:`, and `build:` are optional guidance.
- Add regression assertions for behavior changes, including intentional parser/render output differences.
- Commit `package-lock.json` with dependency changes and maintain `Unreleased` notes in `changelog.md` by hand.
- Run `npm run check`; for packaging/dependency changes, also run `npm run test:packed` with an actual tarball.
- Keep generated files, archives, coverage and consumer installs out of commits.

Checks run in CI and before npm publication. Reports and npm test artifacts are stored by GitHub Actions.

## Releases

Publish changed parser/renderer versions before updating or publishing core ranges that need them. Verify those versions exist in npm. Runtime minimum changes and other breaking changes in a 0.x package require the next minor release.

Prepare a release PR with the package/lockfile version and dated release notes. Use `npm version <version> --no-git-tag-version` to update version files without creating a commit or tag. Run checks and commit those files together. After the release PR is merged and checked, tag the tested master commit, push the tag, and publish that checkout. The `prepublishOnly` script runs `npm run check` again.

For bug reports, include a reduced reproducible example and expected/actual HTML or tree output.
