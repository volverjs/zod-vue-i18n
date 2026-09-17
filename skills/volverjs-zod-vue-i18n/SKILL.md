---
name: volverjs-zod-vue-i18n
description: >-
  Translate Zod's validation error messages into the active vue-i18n locale in
  Vue 3 apps, using the @volverjs/zod-vue-i18n error map. Use this skill whenever
  the user wants Zod validation errors (min/max/email/required/refine, etc.)
  rendered through vue-i18n, for example errors stuck in English despite a
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

# @volverjs/zod-vue-i18n

`@volverjs/zod-vue-i18n` renders [Zod](https://zod.dev) validation errors through
[vue-i18n](https://vue-i18n.intlify.dev). You build an **error map** from the app's
`i18n` instance and register it with Zod once; from then on every issue Zod produces
is looked up as a vue-i18n message under an `errors` namespace, with named parameters,
plural forms and locale-aware number and date formatting. Any key you did not provide
falls back to Zod's own English text.

You help users wire the map up and shape their messages correctly. Read the relevant
`references/*.md` file before writing non-trivial code: they hold the full key tables
and option lists, and this file stays deliberately short so it loads fast.

## When this applies

- Zod errors must follow the active vue-i18n locale (or are stuck in English after a switch).
- Choosing between the Zod 3 and Zod 4 entry points, or migrating from one to the other.
- Loading, merging, overriding or extending the bundled locales (en, it, fr, ptBR).
- Attaching a translated message to one validation (`.refine`, `.min`, `.email`, ...).
- Field-aware messages (`WithPath`), plural forms, the `types.*` / `validations.*` tables.

Default stack for examples: **Vue 3 + `<script setup lang="ts">` + vue-i18n 11 + Zod**.
Not for general UI copy, Zod outside Vue, `$d`/`$n` on their own, or other validators.

## Mental model (read this first)

Five ideas explain almost every behavior:

- **One map, built once, from the `createI18n()` instance.** `makeZodI18nMap(i18n)`
  reads `i18n.global.t/te/d/n`, so it follows `i18n.global.locale` on every parse.
  Pass the instance returned by `createI18n()`, never the composer from `useI18n()`.
- **Two builds, one per Zod major.** Issue shapes and registration APIs differ, so the
  package ships `@volverjs/zod-vue-i18n` (Zod 3, built on `zod/v3`) and
  `@volverjs/zod-vue-i18n/v4` (Zod 4). The entry point must match the `z` the schemas use.
- **Every issue becomes a key.** `invalid_type` is `invalidType`, `.min()` on a string is
  `tooSmall.string.inclusive`, and so on (`references/message-keys.md`). The key is then
  resolved in order: `errors.<key>WithPath` (only when the issue has a path),
  `errors.<key>`, `<key>` at the locale root, and finally Zod's default message.
- **Messages are plain vue-i18n messages.** Named params (`{minimum}`, `{path}`,
  `{expected}`...), `a | b` plural syntax driven by the issue's numeric data, numbers
  formatted through `i18n.global.n`, dates through `i18n.global.d`.
- **Custom checks reach the map only through `params.i18n`.** Built-in validations do
  not accept `params`; for those, Zod 4 has `makeZodI18nLabel`, which plugs into Zod's
  native `error` option and shares the same key lookup. A raw string bypasses everything.

## Install

```bash
pnpm add @volverjs/zod-vue-i18n
```

Peer dependencies: `vue-i18n@^11.2` and `zod@^3.25 || ^4`. Nothing else.

## Register the map

| Schemas built with | Import from | Register with |
| --- | --- | --- |
| `zod` 3.25.x, or the `zod/v3` subpath | `@volverjs/zod-vue-i18n` | `z.setErrorMap(makeZodI18nMap(i18n))` |
| `zod` 4.x, or the `zod/v4` subpath | `@volverjs/zod-vue-i18n/v4` | `z.config({ localeError: makeZodI18nMap(i18n) })` |

```ts
// Zod 4
import { makeZodI18nMap } from '@volverjs/zod-vue-i18n/v4'
import { z } from 'zod'

z.config({ localeError: makeZodI18nMap(i18n) }) // i18n = the createI18n() instance
```

```ts
// Zod 3
import { makeZodI18nMap } from '@volverjs/zod-vue-i18n'
import { z } from 'zod'

z.setErrorMap(makeZodI18nMap(i18n))
```

Do it once at startup, next to `createI18n()`. `makeZodI18nMap(i18n, key?)` takes an
optional namespace (default `'errors'`). See `references/setup.md`.

## Provide the messages

The bundled locale files cover every built-in Zod issue and are the fastest path. Each
file is the **content of the `errors` namespace** for one language; use the `/v4` files
with the Zod 4 entry point.

```ts
import en from '@volverjs/zod-vue-i18n/locales/v4/en.json'
import it from '@volverjs/zod-vue-i18n/locales/v4/it.json'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    messages: {
        en: { errors: en, ...appMessages.en },
        it: { errors: it, ...appMessages.it },
    },
})
```

Or later: `i18n.global.mergeLocaleMessage('en', { errors: en })`. Override one message by
redefining its key under `errors`; whatever is missing falls back to Zod's default text,
so partial locales are fine. See `references/messages.md`.

## Custom messages

Three tools, from narrowest to widest reach (details in `references/custom.md`):

- **`params.i18n` on `.refine()` / `.superRefine()` / `.custom()`**, Zod 3 and 4:
  `z.string().refine(fn, { params: { i18n: 'myKey' } })`, or
  `{ i18n: { key, options: { named, count } } }` for interpolation. It is the only
  channel Zod propagates to the error map for custom issues.
- **`makeZodI18nLabel(i18n)`**, Zod 4 only: `label('key', named?, count?)` returns an
  `{ error }` object accepted by **any** validation, `z.string().min(5, label('tooShort',
  { min: 5 }))`, `z.email(label('badEmail'))`, `.refine(fn, label('taken'))`. Resolved
  lazily on each parse, so static schemas follow locale switches.
- **`WithPath` variants**: define `invalidTypeWithPath` next to `invalidType` and it wins
  whenever the issue has a path, receiving `{path}` (`address.city`, `items.0.name`).

## `zDate`

Both entry points export `zDate`, a `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)` for
`<input type="date">` values. Shape only: `2026-13-45` passes. Add a `.refine` when
calendar validity matters.

## Best practices & gotchas

- **Entry point must match the Zod build.** A Zod 3 map registered on `zod/v4` (or the
  reverse) reads the wrong issue fields and silently degrades to default messages.
- **Pass the `createI18n()` instance.** The map needs `i18n.global`; the composer from
  `useI18n()` has no such property and every lookup throws.
- **Keys go under `errors`.** Root-level keys are found as a last resort, but `WithPath`
  variants are only looked up inside the namespace, and root keys collide with app copy
  (`custom`, `types`, `date`).
- **A raw string bypasses the map.** `z.string().min(3, 'Too short')` prints `Too short`
  in every locale. Use `makeZodI18nLabel` or `params.i18n` instead.
- **Partial locales resolve through `fallbackLocale` first.** A key missing from `it` but
  present in `en` renders the `en` message, with one intlify warning per lookup (silence
  it with `fallbackWarn: false`). Zod's English default is used only when no locale in
  the chain has the key.
- **Errors are snapshots.** A message is translated when the issue is produced. After a
  locale switch re-run validation; the map itself never needs rebuilding.
- **`{path}` is dot-joined**, array indices included: `items.0.name`. `WithPath` never
  fires on a root-level issue (`z.string().parse(1)`, or an object schema fed a non-object).
- **Numbers and dates follow `numberFormats` / `datetimeFormats`.** `{minimum}` for
  `.min(1000)` renders `1,000` in en and `1.000` in it; bigints pass through untouched.
- **Zod 3 `.includes()` has no key** and falls back to Zod's text; Zod 4 has
  `invalidFormat.includes`.
- **Zod 4 precedence**: a schema-level `error`, a per-parse `error` and a global
  `customError` all win over `localeError`, so a stray `z.config({ customError })`
  hides the map.

## Reference files

- `references/setup.md`: peer deps and package exports, choosing the entry point, global vs
  per-parse registration, the `i18n` instance requirements, custom namespace, precedence.
- `references/messages.md`: key resolution order, named params and `{path}`, `WithPath`,
  pluralization and where the count comes from, number and date formatting, the
  `types.*` / `validations.*` tables, overriding and adding locales.
- `references/custom.md`: `params.i18n` (string and object forms, `superRefine`),
  `makeZodI18nLabel` and Zod 4's `error` option, raw strings, `zDate`.
- `references/message-keys.md`: every issue code with its key and named params, per build.
