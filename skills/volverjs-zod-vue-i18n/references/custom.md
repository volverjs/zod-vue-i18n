# Custom messages: `params.i18n`, `makeZodI18nLabel`, `zDate`

## Contents

- [Which tool for which validation](#which)
- [`params.i18n` on custom checks](#params)
- [`makeZodI18nLabel` (Zod 4)](#label)
- [Raw strings bypass the map](#raw)
- [`zDate`](#zdate)

<a id="which"></a>
## Which tool for which validation

| Validation | Zod 3 | Zod 4 |
| --- | --- | --- |
| Built-in (`.min`, `.max`, `.email`, `.regex`, `.length`...) | Override the key in the locale (`references/messages.md`); no per-validation hook. | Override the key, or `makeZodI18nLabel` for a per-validation key. |
| `.refine()` / `.superRefine()` / `z.custom()` | `params: { i18n }` | `params: { i18n }`, or `makeZodI18nLabel`. |
| One field of an object | `WithPath` variant of the key | `WithPath` variant, or `makeZodI18nLabel` on that field. |

<a id="params"></a>
## `params.i18n` on custom checks

Zod forwards `params` to the error map only for `custom` issues, so this channel exists
on `.refine()`, `.superRefine()` (through `ctx.addIssue`) and `z.custom()`. Both builds
read the same shape.

**String form**: the key, resolved in the normal order (`errors.<key>WithPath`,
`errors.<key>`, `<key>` at the root), so a root-level key works too.

```ts
z.string().refine(isUnique, { params: { i18n: 'usernameTaken' } })
```

**Object form**: the key plus translate options.

```ts
z.array(z.string()).refine(v => v.length <= 3, {
    params: {
        i18n: {
            key: 'tooManyTags',
            options: { named: { max: 3 }, count: 3 },
        },
    },
})
// errors.tooManyTags: "At most {max} tag | At most {max} tags"
```

`options` accepts:

| Option | Type | Meaning |
| --- | --- | --- |
| `named` | `Record<string, unknown>` | Interpolation params. `path` is added by the map afterwards. |
| `count` | `number` | Plural count. Omitted, the first numeric `count`/`minimum`/`maximum`/`keys`/`value` in `named` is used. |
| `prefix` | `string` | Prepends `prefix.` to the key (the map uses it internally for `types.*`). Rarely needed. |
| `fallback` | `string` | Text when no key exists, instead of Zod's default. |

Inside `superRefine`, set `path` so the issue lands on the right field and `{path}`
renders it:

```ts
const schema = z.object({
    password: z.string(),
    confirm: z.string(),
}).superRefine((value, ctx) => {
    if (value.password !== value.confirm) {
        ctx.addIssue({
            code: 'custom',
            path: ['confirm'],
            params: { i18n: 'passwordMismatch' },
        })
    }
})
```

Use `z.ZodIssueCode.custom` for the `code` on Zod 3; the string `'custom'` works on
both.

Two fallbacks apply when things are missing: a custom issue **without** `params.i18n`
renders `errors.custom` (bundled as "Invalid value"); a `params.i18n` key that exists in
no locale renders Zod's default text for the issue ("Invalid input" on Zod 4).

<a id="label"></a>
## `makeZodI18nLabel` (Zod 4)

Built-in validations accept no `params`, but every Zod 4 validation accepts an `error`
option, and `error` may be a **function** evaluated when the issue is created.
`makeZodI18nLabel` builds such functions on top of the same key lookup as the map:

```ts
import { makeZodI18nLabel } from '@volverjs/zod-vue-i18n/v4'
import { z } from 'zod'

const label = makeZodI18nLabel(i18n) // (key, named?, count?) => { error: () => string }

const schema = z.object({
    name: z.string().min(5, label('nameTooShort', { min: 5 })),
    email: z.email(label('invalidEmail')),
    username: z.string().refine(isUnique, label('usernameTaken')),
    tags: z.array(z.string()).max(3, label('tooManyTags', { max: 3 }, 3)),
})
```

| Argument | Meaning |
| --- | --- |
| `key` | Resolved as `errors.<key>WithPath` (never, since no path is passed), `errors.<key>`, `<key>`, else the key itself is returned as text. |
| `named` | Interpolation params. A numeric `count`/`minimum`/`maximum`/`keys`/`value` in here doubles as the plural count. |
| `count` | Explicit plural count, when `named` has none or you want to keep them separate. |

Properties of the helper worth knowing:

- **Placement follows Zod's signature.** `.min(5, label(...))` takes it as the second
  argument, `z.email(label(...))` as the first: it goes wherever that validation accepts
  its `params` / `error`.
- **Lazy.** The translation runs on every parse, so a schema declared at module scope
  keeps following `i18n.global.locale` after a switch. No need to rebuild schemas.
- **Highest precedence.** A schema-level `error` beats the global map, `customError`
  included. That is the point, but it also means the locale's `tooSmall.string.*` entry is
  ignored for that validation.
- **`{path}` is not available** in a label message: the label knows nothing about where
  the schema sits. Put the field name in `named` if the sentence needs it.
- **Same namespace as the map.** `makeZodI18nLabel(i18n, 'validation')` when the map was
  built with `makeZodI18nMap(i18n, 'validation')`.
- **Zod 3 has no equivalent.** Zod 3's `message` is a string, so there is nothing to
  resolve lazily; override the locale key or use `params.i18n` on a `refine`.

<a id="raw"></a>
## Raw strings bypass the map

Any literal message on a validation is final and never translated:

```ts
z.string().min(3, 'Too short') // "Too short" in every locale
z.string().min(3, { message: 'Too short' }) // same, Zod 3 style
z.string().min(3, { error: 'Too short' }) // same, Zod 4 style
```

When reviewing existing code for "errors stuck in English", grep for these first. Replace
them with `label(...)` (Zod 4) or drop them so the locale key applies.

<a id="zdate"></a>
## `zDate`

Both entry points export the same helper:

```ts
import { zDate } from '@volverjs/zod-vue-i18n/v4' // or '@volverjs/zod-vue-i18n'

zDate.parse('2026-06-16') // ok
zDate.parse('16/06/2026') // throws: invalidFormat.regex on Zod 4, invalidString.regex on Zod 3
```

It is `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`: a **shape** check for the value an
`<input type="date">` produces, nothing more. `2026-13-45` passes. When calendar validity
matters, add a refinement:

```ts
const zCalendarDate = zDate.refine(
    v => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime())
        && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v),
    { params: { i18n: 'invalidDate' } },
)
```

The error a bare `zDate` produces is the regex one, so its message comes from
`invalidFormat.regex` (Zod 4, `{pattern}` available) or `invalidString.regex` (Zod 3).
Override that key, or wrap `zDate` in a `label`/`params.i18n`, if "Must match the pattern
..." is too technical for the UI.
