---
name: volverjs-zod-vue-i18n
description: >-
  Translate Zod's validation error messages into the active vue-i18n locale in
  Vue 3 apps, using the @volverjs/zod-vue-i18n error map. Use this skill whenever
  the user wants Zod validation errors (min/max/email/required/refine, etc.)
  rendered through vue-i18n — for example errors stuck in English despite a
  locale switch, multilingual form validation backed by Zod, or any mention of
  @volverjs/zod-vue-i18n, makeZodI18nMap, makeZodI18nLabel or zDate. It covers
  choosing the Zod 3 vs Zod 4 entry point, loading the bundled locale JSON,
  overriding or adding error keys, attaching a custom key to a validation
  (including without refine), per-field WithPath labels, and pluralized
  messages. Do not use it for translating general UI, label or placeholder copy
  with vue-i18n (no Zod involved), for Zod used outside Vue (Node, React,
  react-hook-form), for vue-i18n $d/$n date and number formatting, or for other
  validators such as valibot or yup.
---

# Using @volverjs/zod-vue-i18n

This library turns Zod's English-only error messages into vue-i18n translations.
You register an **error map** built from a vue-i18n instance; from then on every
Zod issue is rendered through `i18n` against keys under an `errors` namespace.

The hardest part is usually picking the right entry point and shaping the locale
messages correctly — get those two right and everything else follows.

## Peer dependencies

Requires `vue-i18n@^11.2` and `zod@^3.25 || ^4`. Install:

```bash
pnpm add @volverjs/zod-vue-i18n
```

## Step 1 — choose the entry point (Zod 3 vs Zod 4)

Zod 3 and Zod 4 expose different error-map APIs, so the package ships two builds.
**Match the entry point to the `z` the project imports**, otherwise the issue
shapes won't line up.

| Project uses | Import from | Register with |
| --- | --- | --- |
| `import { z } from 'zod'` (v3) | `@volverjs/zod-vue-i18n` | `z.setErrorMap(makeZodI18nMap(i18n))` |
| `import { z } from 'zod/v4'` (or zod 4.x) | `@volverjs/zod-vue-i18n/v4` | `z.config({ localeError: makeZodI18nMap(i18n) })` |

Zod 3:

```typescript
import { z } from 'zod'
import { makeZodI18nMap } from '@volverjs/zod-vue-i18n'
z.setErrorMap(makeZodI18nMap(i18n)) // i18n = your createI18n() instance
```

Zod 4:

```typescript
import { z } from 'zod/v4'
import { makeZodI18nMap } from '@volverjs/zod-vue-i18n/v4'
z.config({ localeError: makeZodI18nMap(i18n) })
```

`makeZodI18nMap(i18n, key?)` reads keys under `key` (default `'errors'`). Pass a
second argument only if you want a different namespace, e.g. `makeZodI18nMap(i18n, 'zodErrors')`.

## Step 2 — provide the translations

Messages must live under the `errors` namespace of each locale. The fastest path
is the **bundled locale files** (en, it, fr, ptBR), which already cover every
built-in Zod issue. Use the `/v4` variants with the Zod 4 entry point.

```typescript
import { createI18n } from 'vue-i18n'
import en from '@volverjs/zod-vue-i18n/locales/en.json'       // or /locales/v4/en.json
import it from '@volverjs/zod-vue-i18n/locales/it.json'

const i18n = createI18n({
    locale: 'en',
    messages: {
        en: { errors: en, ...yourEn }, // merge with your own keys under the SAME locale
        it: { errors: it, ...yourIt },
    },
})
```

Or merge later onto an existing instance:

```typescript
i18n.global.mergeLocaleMessage('en', { errors: en })
```

To customize a single message, override its key under `errors` (see the full key
list in `references/message-keys.md`). Any key you don't provide falls back to
Zod's own default message, so partial locales are fine.

## Custom error messages on `.refine()`

For custom checks, pass an i18n key through the `params.i18n` channel — this is
the only place Zod propagates `params` to the error map.

```typescript
// string key (looked up under errors., then at the root)
z.string().refine(fn, { params: { i18n: 'myKey' } })

// with interpolation / pluralization
z.string().refine(fn, {
    params: { i18n: { key: 'myKey', options: { named: { name: 'Ada' }, count: 2 } } },
})
```

Built-in validations (`.min`, `.email`, …) do **not** accept `params`, so this
route is `refine`/`superRefine`/`custom` only.

## Custom labels on ANY validation — `makeZodI18nLabel` (Zod 4 only)

To attach a translated message to a built-in validation without rewriting it as a
`refine`, use `makeZodI18nLabel`. It plugs into Zod 4's native `error` option and
resolves the translation **lazily on every parse**, so statically-defined schemas
keep updating when the active locale changes.

```typescript
import { makeZodI18nLabel } from '@volverjs/zod-vue-i18n/v4'

const label = makeZodI18nLabel(i18n) // label(key, named?, count?)

z.string().min(5, label('nameTooShort', { min: 5 }))
z.email(label('invalidEmail'))
z.string().refine(fn, label('mustBeUnique'))
```

The lookup reuses the same key resolution as the error map (the `errors.`
namespace, fallbacks and plurals all apply).

## Per-field messages with `WithPath`

When an object field fails, append `WithPath` to a key to get a variant that
receives the field's `{path}`. If the `WithPath` key is missing, the normal key
is used. The path is also available as `{path}` in every message.

```typescript
errors: {
    invalidType: 'Expected {expected}, received {received}',
    invalidTypeWithPath: 'The {path} field expected {expected}, received {received}',
}
// z.object({ name: z.string() }).parse({ name: 1 }) => "The name field expected string, received number"
```

## Pluralization

Messages whose data includes `count`, `minimum`, `maximum`, `keys` or `value` can
use vue-i18n's `|` plural syntax — the library passes the numeric value as the
plural count automatically.

```json
{ "tooSmall": { "string": { "exact": "Exactly {minimum} character | Exactly {minimum} characters" } } }
```

## `zDate` helper

The package also exports `zDate` (both entry points): a ready-made schema for ISO
calendar dates in `YYYY-MM-DD` form, handy for `<input type="date">` string values.

```typescript
import { zDate } from '@volverjs/zod-vue-i18n' // or '/v4'
zDate.parse('2026-06-16') // ok — throws on anything that isn't YYYY-MM-DD
```

## Gotchas

- **Entry point must match the Zod major** — a v3 map against `zod/v4` (or vice
  versa) silently misreads issues.
- **Messages go under `errors`** (or your custom namespace), not the locale root.
- **A custom per-validation `message`/`error: 'literal'` bypasses the error map** —
  use `makeZodI18nLabel` (or `params.i18n`) instead of a raw string if you want it translated.
- **Keep the i18n instance reactive**: build the map once from your app's `i18n`
  instance; locale switches then apply automatically.

## Full message-key reference

For the complete list of keys and the data available to each message (per Zod
version), read `references/message-keys.md`.
