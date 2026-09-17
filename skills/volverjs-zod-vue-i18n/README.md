# Volver Zod Vue I18n Skill for Claude Code

Agent skill that helps Claude Code integrate [@volverjs/zod-vue-i18n](https://github.com/volverjs/zod-vue-i18n), the error map that renders [Zod](https://zod.dev) validation messages through [vue-i18n](https://vue-i18n.intlify.dev) in Vue 3 apps.

## Installation

```bash
npx skills add volverjs/zod-vue-i18n
```

This adds the skill to your Claude Code configuration.

## What This Skill Covers

The skill is specialized for real `@volverjs/zod-vue-i18n` implementation patterns:

- **Setup**: matching the build to the Zod major the schemas use (`@volverjs/zod-vue-i18n` on `zod/v3`, `@volverjs/zod-vue-i18n/v4` on `zod/v4`), global registration with `z.setErrorMap` / `z.config({ localeError })`, per-parse registration, message precedence, and what the map needs from the `createI18n()` instance.
- **Messages**: the key resolution order (`WithPath` variant, namespaced key, root key, Zod default), the bundled `en`, `it`, `fr`, `ptBR` locales and their `/v4` variants, overriding a single key, adding a language, the `types.*` / `validations.*` lookup tables.
- **Per-field `WithPath` variants**: field-aware messages receiving `{path}`, and when they do (and do not) apply.
- **Pluralization and formatting**: vue-i18n `|` plural syntax driven by the issue's numeric data, and boundaries formatted through `numberFormats` / `datetimeFormats`.
- **Custom messages**: `params.i18n` on `.refine()` / `.superRefine()` / `z.custom()` (string and object forms), and `makeZodI18nLabel` to attach a translated, locale-reactive message to any Zod 4 validation without rewriting it as a refine.
- **`zDate` helper**: the `YYYY-MM-DD` shape check for `<input type="date">` values, and how to add calendar validity.
- **Gotchas**: entry-point mismatches, composer vs instance, raw strings bypassing the map, how partial locales resolve through `fallbackLocale` before Zod's default, `customError` hiding the map.

## Usage

Once installed, Claude Code should automatically use this skill when you ask to:

- Render Zod validation errors through the active vue-i18n locale.
- Wire up the error map for a Zod 3 or Zod 4 project, or migrate between them.
- Load, merge or override the bundled locale files, or add a new language.
- Attach a translated message to a specific validation or to a custom check.
- Write field-aware (`WithPath`) or pluralized messages.

### Example Prompts

```text
Translate my Zod errors with vue-i18n in this Vue app.
```

```text
Add @volverjs/zod-vue-i18n and make the form validation messages localized in en and it.
```

```text
My Zod errors stay in English after switching locale. Wire up the error map correctly.
```

```text
Attach a translated message to z.string().min(5) without rewriting it as a refine.
```

```text
Add a per-field message that includes the field name using a WithPath key.
```

```text
Why does my z.string().min(3, 'Too short') error say "Too short" in every locale?
```

## Source of Truth

When coding, verify implementation details directly from the library source:

- `src/index.ts`: Zod 3 error map, `zDate`
- `src/v4/index.ts`: Zod 4 error map, `makeZodI18nLabel`, `zDate`
- `src/utils.ts`: key resolution (`translateLabelFactory`), plural count detection, `params.i18n` parsing
- `src/types.ts`: `AnyI18n`, `TranslateOptions`, `TranslateLabelOptions`
- `locales/` and `locales/v4/`: bundled message JSON, one file per language and build

## Documentation

- [Volver Zod Vue I18n Repository](https://github.com/volverjs/zod-vue-i18n)
- [Skill Specification](./SKILL.md)
- [Setup reference](./references/setup.md), [Messages reference](./references/messages.md), [Custom messages reference](./references/custom.md), [Message-key reference](./references/message-keys.md)

## License

MIT
