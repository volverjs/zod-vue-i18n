# Volver Zod Vue I18n Skill for Claude Code

Agent skill that helps Claude Code integrate [@volverjs/zod-vue-i18n](https://github.com/volverjs/zod-vue-i18n), the error map that renders [Zod](https://zod.dev) validation messages through [vue-i18n](https://vue-i18n.intlify.dev) in Vue 3 apps.

## Installation

```bash
npx skills add volverjs/zod-vue-i18n
```

This adds the skill to your Claude Code configuration.

## What This Skill Covers

The skill is specialized for real `@volverjs/zod-vue-i18n` implementation patterns:

- **Entry point selection**: matching the build to the project's Zod major — Zod 3 (`z.setErrorMap(makeZodI18nMap(i18n))`) vs Zod 4 (`z.config({ localeError: makeZodI18nMap(i18n) })`).
- **Bundled locales**: loading the shipped `en`, `it`, `fr`, `ptBR` JSON files (and their `/v4` variants) under the `errors` namespace.
- **Custom error messages**: overriding or adding keys, and routing custom checks through `params.i18n` on `.refine()`/`.superRefine()`/`.custom()`.
- **Custom labels (`makeZodI18nLabel`)**: attaching translated, locale-reactive messages to any built-in validation in Zod 4 without rewriting it as a `refine`.
- **Per-field `WithPath` labels**: field-aware message variants that receive `{path}`.
- **Pluralization**: vue-i18n `|` plural syntax driven by `count`, `minimum`, `maximum`, `keys` or `value`.
- **`zDate` helper**: ready-made `YYYY-MM-DD` ISO date schema for `<input type="date">` values.
- **Gotchas**: entry-point mismatches, namespace placement, raw `message` strings bypassing the map, and keeping the i18n instance reactive.

## Usage

Once installed, Claude Code should automatically use this skill when you ask to:

- Render Zod validation errors through the active vue-i18n locale.
- Wire up the error map for a Zod 3 or Zod 4 project.
- Load or merge the bundled locale files.
- Override built-in messages or add custom error keys.
- Attach translated labels to validations or per-field `WithPath` variants.

### Example Prompts

```text
Translate my Zod errors with vue-i18n in this Vue app.
```

```text
Add @volverjs/zod-vue-i18n and make the form validation messages localized in en and it.
```

```text
My Zod errors stay in English after switching locale — wire up the error map correctly.
```

```text
Attach a translated message to z.string().min(5) without rewriting it as a refine.
```

```text
Add a per-field message that includes the field name using a WithPath key.
```

## Source of Truth

When coding, verify implementation details directly from the library source:

- `src/index.ts`, `src/utils.ts`, `src/types.ts` (Zod 3 error map and helpers)
- `src/v4/` (Zod 4 error map, `makeZodI18nLabel`)
- `locales/` and `locales/v4/` (bundled message JSON)

## Documentation

- [Volver Zod Vue I18n Repository](https://github.com/volverjs/zod-vue-i18n)
- [Skill Specification](./SKILL.md)
- [Full message-key reference](./references/message-keys.md)

## License

MIT
