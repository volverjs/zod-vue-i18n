# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.9] - 2026-06-17

### Added

- `makeZodI18nLabel` (Zod 4): attach a translated message to any validation — built-in (`.min`, `.email`, …) or `refine` — via Zod's native `error` option, resolved lazily on every parse so static schemas react to locale changes;
- Documented the `zDate` helper for `YYYY-MM-DD` validation;
- Installable Claude Code plugin/skill (`volverjs-zod-vue-i18n`) to help AI agents integrate the library.

### Fixed

- `WithPath` lookup was missing the namespace separator, so per-field messages never matched;
- a missing translation key now falls back to Zod's default message instead of leaking the raw key;
- date `too_small`/`too_big` boundaries rendered as `Invalid Date` (both versions), and the Zod 4 map read the wrong issue fields (`origin`, `divisor`, `received`);
- locale fixes: wrong `{minimum}`/`{maximum}` placeholders, literal quotes breaking vue-i18n parsing, stray braces, typos, and completed it/ptBR translations;
- the `zDate` regex is now anchored;
- package entry points pointed at non-existent `.mjs`/`.d.mts` files after the `tsdown` upgrade;
- Removed unused devDependencies;
- Cleaned up configuration files.

### Changed

- Replaced `tsx` with `tsdown`. Thanks to @RazorSiM and @wonderbeel for the support;
- The accepted vue-i18n instance type is widened so strongly-typed `createI18n({ messages })` instances are assignable;
- internal refactor of the v3/v4 error maps (shared helpers);
- CI: skip the version bump on PR builds, replace the deprecated `release-tag` action with the `gh` CLI, and bump CI Node.js to 24.

## [0.0.8] - 2025-11-26

### Added

- Added french (fr) translations. Thanks to @CharnaceRegis for the contribution.

### Fixed

- Replaced `jest` with `vitest` for testing framework. Thanks to @wonderbeel for the contribution.

## [0.0.7] - 2025-09-16

### Added

- Added support for `zod` version 4.0.0 and above (#195). Thanks to @LudoFont for the contribution.

## [0.0.6] - 2025-07-16

### Added

- Messages using `count`, `maximum`, `minimum`, `keys` or `value` can be converted to the plural form using [vue-i18n pluralization feature](https://vue-i18n.intlify.dev/guide/essentials/pluralization.html#basic-usage). Thanks to @cxvvs for the contribution.

## [0.0.5] - 2025-01-20

### Added

- Custom error message with options;
- prBR language.

### Fixed

- vue-i18n version.

## [0.0.4] - 2023-07-17

### Added

- Errors key as parameter

## [0.0.2] - 2023-04-07

### Release

- Add locales translations (en, it);
- Fix locales exports in package.json;
- Fix label for `invalid_type` error with `z.nativeEnum()`.

## [0.0.2-beta.4] - 2023-04-07

### Fixed

- Fix label for `invalid_type` error with `z.nativeEnum()`;

## [0.0.2-beta.3] - 2023-03-16

### Fixed

- Fix locales exports in package.json;
- Fix locales labels en and it.

## [0.0.2-beta.2] - 2023-03-14

### Fixed

- Fix release workflow.

## [0.0.2-beta.1] - 2023-03-14

### Fixed

- Update release workflow.

## [0.0.1] - 2023-03-14

### Added

- `makeZodI18nMap` a function to use vue-i18n with zod validation error.

## [0.0.1-beta.1] - 2023-03-13

### Added

- `makeZodI18nMap` a function to use vue-i18n with zod validation error.

[0.0.9]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/volverjs/zod-vue-i18n/compare/v0.0.1...v0.0.2
