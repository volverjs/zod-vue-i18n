# Setup: entry points, registration, the `i18n` instance

## Contents

- [Peer dependencies and package exports](#exports)
- [Which entry point](#entry-point)
- [Registering the map](#register)
- [Per-parse registration](#per-parse)
- [Message precedence](#precedence)
- [The `i18n` instance](#instance)
- [Custom namespace](#namespace)
- [Locale switches](#switching)

<a id="exports"></a>
## Peer dependencies and package exports

```bash
pnpm add @volverjs/zod-vue-i18n
```

Peers: `vue-i18n@^11.2.0` and `zod@^3.25.0 || ^4.0.0`. The package is ESM-only.

| Subpath | Contents |
| --- | --- |
| `@volverjs/zod-vue-i18n` | Zod 3 build: `makeZodI18nMap`, `zDate`. Imports from `zod/v3`. |
| `@volverjs/zod-vue-i18n/v4` | Zod 4 build: `makeZodI18nMap`, `makeZodI18nLabel`, `zDate`. Imports from `zod/v4`. |
| `@volverjs/zod-vue-i18n/locales/<lang>.json` | Zod 3 messages: `en`, `it`, `fr`, `ptBR`. |
| `@volverjs/zod-vue-i18n/locales/v4/<lang>.json` | Zod 4 messages, same four languages. |

Importing the JSON files from TypeScript needs `resolveJsonModule: true`.

<a id="entry-point"></a>
## Which entry point

The two Zod majors produce different issue objects (`issue.received` vs `issue.input`,
`issue.type` vs `issue.origin`, `invalid_string` vs `invalid_format`...) and expose
different registration APIs. Pick the build that matches **the `z` the schemas are
built with**, not the version string in `package.json`:

| Installed | Schemas import | Use |
| --- | --- | --- |
| `zod@3.25.x` | `from 'zod'` or `from 'zod/v3'` | `@volverjs/zod-vue-i18n` |
| `zod@3.25.x` | `from 'zod/v4'` | `@volverjs/zod-vue-i18n/v4` |
| `zod@4.x` | `from 'zod'` or `from 'zod/v4'` | `@volverjs/zod-vue-i18n/v4` |
| `zod@4.x` | `from 'zod/v3'` | `@volverjs/zod-vue-i18n` |

Both subpaths (`zod/v3`, `zod/v4`) exist from `zod@3.25` on, which is why the peer range
starts there. A mismatched build does not throw: the `switch` on `issue.code` falls
through, the map returns Zod's default text, and everything looks untranslated.

A project mixing both majors (during a migration, say) can register both maps: they are
independent, one per Zod runtime.

<a id="register"></a>
## Registering the map

Once, at startup, right after `createI18n()`:

```ts
// Zod 4
import { makeZodI18nMap } from '@volverjs/zod-vue-i18n/v4'
import { createI18n } from 'vue-i18n'
import { z } from 'zod'

export const i18n = createI18n({ legacy: false, locale: 'en', messages })

z.config({ localeError: makeZodI18nMap(i18n) })
```

```ts
// Zod 3
import { makeZodI18nMap } from '@volverjs/zod-vue-i18n'
import { createI18n } from 'vue-i18n'
import { z } from 'zod'

export const i18n = createI18n({ legacy: false, locale: 'en', messages })

z.setErrorMap(makeZodI18nMap(i18n))
```

The registration is global to the Zod runtime: every schema, in every module, picks it
up, including schemas created before the call. Nothing has to be re-created.

<a id="per-parse"></a>
## Per-parse registration

Zod also accepts a map for a single parse call, which scopes the translation to that
call without touching the global map:

```ts
// Zod 4
schema.safeParse(data, { error: makeZodI18nMap(i18n) })

// Zod 3
schema.safeParse(data, { errorMap: makeZodI18nMap(i18n) })
```

Build the map once and reuse it; there is no per-instance state, but each call to
`makeZodI18nMap` allocates the closures again.

<a id="precedence"></a>
## Message precedence

The map is the **lowest-priority** source of text. Anything more specific wins:

| Zod 4 (highest first) | Zod 3 (highest first) |
| --- | --- |
| `error` on the check or schema (`z.string().min(3, 'x')`, `label(...)`) | `message` / `errorMap` on the check or schema |
| `error` passed to `parse`/`safeParse` | `errorMap` passed to `parse`/`safeParse` |
| `z.config({ customError })` | `z.setErrorMap(...)` (this map) |
| `z.config({ localeError })` (this map) | Zod default |
| Zod default | |

Two consequences worth remembering:

- A raw string message anywhere in the schema is final. `z.string().min(3, 'Too short')`
  never reaches the map. Use `makeZodI18nLabel` (Zod 4) or `params.i18n` instead
  (`references/custom.md`).
- On Zod 4, a `z.config({ customError })` set by another module hides the map entirely.
  If everything is suddenly English, look for one.

<a id="instance"></a>
## The `i18n` instance

`makeZodI18nMap` accepts the object returned by `createI18n()`, in either mode
(`legacy: false` is the vue-i18n 11 default; legacy mode is deprecated but works). It
only uses four members, all read through `i18n.global`:

| Member | Used for |
| --- | --- |
| `t(key, named)` / `t(key, count, { named })` | Rendering the message. |
| `te(key)` | Deciding whether a key exists, in the resolution order (`references/messages.md`). |
| `d(date)` | Formatting `too_small` / `too_big` boundaries when the origin is `date`. |
| `n(number)` | Formatting numeric boundaries. |

Do not pass the **composer** from `useI18n()`: it has `t` and `te` directly and no
`global`, so the very first lookup throws. If the map is created inside a component,
import the instance from the module that called `createI18n()` instead.

Both `te()` and `t()` honour `fallbackLocale`: a key missing from `it` but present in
`en` is found and rendered from `en`, and vue-i18n logs a "Fall back to translate"
warning for each lookup (set `fallbackWarn: false` and `missingWarn: false` to silence
it in production). The map falls back to Zod's English default only when no locale in
the chain has the key.

<a id="namespace"></a>
## Custom namespace

The second argument moves the lookup out of `errors`:

```ts
z.config({ localeError: makeZodI18nMap(i18n, 'validation') })
// keys are now read from validation.invalidType, validation.tooSmall.string.inclusive, ...
```

`makeZodI18nLabel(i18n, key)` takes the same argument. Keep the two in sync, otherwise
labels and map messages live in different namespaces.

<a id="switching"></a>
## Locale switches

The map reads `i18n.global.locale` on every issue, so `i18n.global.locale.value = 'it'`
applies to the **next** parse with no further work. Messages already stored in an
error object or in form state are plain strings and keep their old language: re-run
validation after switching if the UI shows persisted errors.

`makeZodI18nLabel` labels are functions evaluated on each parse for the same reason, so
schemas declared at module scope follow the switch too.
