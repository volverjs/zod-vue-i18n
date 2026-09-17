# Messages: resolution, `{path}`, `WithPath`, plurals, formatting

## Contents

- [Key resolution order](#resolution)
- [Named parameters and `{path}`](#named)
- [`WithPath` variants](#withpath)
- [Pluralization](#plurals)
- [Number and date formatting](#formatting)
- [The `types.*` and `validations.*` tables](#tables)
- [Overriding a message](#override)
- [Adding a language](#new-locale)

<a id="resolution"></a>
## Key resolution order

Each issue is mapped to a key (`references/message-keys.md`), then resolved with `te()`
(which honours `fallbackLocale`) in this order. The first existing key is rendered with `t()`.

| Order | Key tried | Notes |
| --- | --- | --- |
| 1 | `errors.<key>WithPath` | Only when the issue has a non-empty path. |
| 2 | `errors.<key>` | The normal case. |
| 3 | `<key>` | Locale root. Last-resort fallback, and where `params.i18n` string keys usually live. |
| 4 | Zod's default message | Rendered when none of the above exists. |

`errors` is the namespace given to `makeZodI18nMap` (default). Nested keys keep their
dots: `.min(3)` on a string tries `errors.tooSmall.string.inclusiveWithPath`,
`errors.tooSmall.string.inclusive`, `tooSmall.string.inclusive`.

Putting the bundled file at the locale root (`messages: { en }` instead of
`messages: { en: { errors: en } }`) works through step 3, but step 1 never applies
there and the keys share the root with the app's own copy. Prefer the namespace.

<a id="named"></a>
## Named parameters and `{path}`

Every message can interpolate the named params listed for its key in
`references/message-keys.md` (`{minimum}`, `{maximum}`, `{expected}`, `{received}`,
`{keys}`, `{multipleOf}`...). Two are always present:

- `{path}`: the issue path joined with dots, array indices included. `address.city`,
  `items.0.name`. Empty string for a root-level issue.
- The key-specific data, already formatted (see [formatting](#formatting)).

```json
{
    "errors": {
        "tooSmall": {
            "string": {
                "inclusive": "{path}: at least {minimum} characters"
            }
        }
    }
}
```

<a id="withpath"></a>
## `WithPath` variants

Suffixing any key with `WithPath` defines a variant that is preferred when the issue
has a path, which in practice means "the failing value is a property of an object or an
element of an array". The base key stays in use for root-level issues.

```json
{
    "errors": {
        "invalidType": "Expected {expected}, received {received}",
        "invalidTypeWithPath": "The {path} field expected {expected}, received {received}"
    }
}
```

```ts
z.object({ name: z.string() }).safeParse({ name: 1 })
// "The name field expected string, received number"

z.string().safeParse(1)
// "Expected string, received number"

z.object({ name: z.string() }).safeParse(undefined)
// root-level issue, path is empty: "Expected object, received undefined"
```

Rules:

- The variant is resolved inside the namespace only (`errors.<key>WithPath`). A root-level
  `invalidTypeWithPath` is never looked up.
- It applies to every key, nested ones included: `tooSmall.string.inclusiveWithPath`.
- If the variant is missing, the base key is used. Define it only where the field name
  improves the sentence.
- `{path}` is the raw schema path, not a display label. To show "Email address" instead
  of `contact.email`, translate the path yourself: `errors.fields.contact.email` looked
  up in the component, or a `params.i18n` message with your own `named`.

<a id="plurals"></a>
## Pluralization

Messages use vue-i18n's pipe syntax, `singular | plural` (or `zero | one | many`). The
count comes from the issue, in this order:

| Source | When |
| --- | --- |
| Explicit `count` set by the map | `too_small` / `too_big` (`minimum` / `maximum`, numbers only), Zod 3 `unrecognized_keys` (number of keys), Zod 3 `invalid_union_discriminator` and Zod 4 `invalid_value` (number of options). |
| Explicit `count` from the user | `params.i18n.options.count`, or the third argument of `makeZodI18nLabel`'s `label()`. |
| A numeric `named` entry | The first of `count`, `minimum`, `maximum`, `keys`, `value` that holds a **number** in `named`. This is how `label('key', { count: 2 })` pluralizes without a third argument. |

```json
{
    "errors": {
        "tooSmall": {
            "string": {
                "exact": "Exactly {minimum} character | Exactly {minimum} characters"
            }
        },
        "invalidValue": "Invalid value, expected {expected} | Invalid value, expected one of {expected}"
    }
}
```

Note that `{minimum}` and `{maximum}` reach the message **already formatted** as
strings (see below); the plural count is the raw number, set separately. Zod 4
`unrecognized_keys` sets no count; bigint boundaries set none either.

<a id="formatting"></a>
## Number and date formatting

`too_small` / `too_big` boundaries are formatted before interpolation:

| Origin | Formatter | Example (`en` / `it`) |
| --- | --- | --- |
| `number`, `int`, `string`, `array`, `set`, `file` | `i18n.global.n(value)` | `1,000` / `1.000` |
| `date` | `i18n.global.d(new Date(value))` | `1/1/2026` / `1/1/2026` per `datetimeFormats` |
| `bigint` | none, passed through | `10` |

So `numberFormats` and `datetimeFormats` in `createI18n()` control what `{minimum}` and
`{maximum}` look like. If a date boundary should read `01 January 2026`, define a
`datetimeFormats.<locale>.short` (or the default format) accordingly; the map calls `d()`
with no named format, so the locale's default applies.

<a id="tables"></a>
## The `types.*` and `validations.*` tables

Some params are themselves translated through small lookup tables under the same
namespace, using the same resolution order (`errors.types.string`, then `types.string`,
then the raw name):

| Table | Feeds | Used by |
| --- | --- | --- |
| `types.*` | `{expected}`, `{received}` | `invalidType`, both builds. Zod 4 also `{format}` in `invalidFormat.default` (`email`, `uuid`, `ipv4`, `datetime`...). |
| `validations.*` | `{validation}` | Zod 3 `invalidString.<validation>` (`email`, `url`, `uuid`, `cuid`, `regex`, `datetime`). |

The bundled locales include both tables. When adding a language, copy them from
`locales/v4/en.json` (Zod 4 has many more string formats than Zod 3) rather than listing
them by hand. A name missing from the table is rendered as-is (`string`, `email`).

<a id="override"></a>
## Overriding a message

Redefine the key under `errors` after (or on top of) the bundled file. Object spread does
this per top-level key, so nested groups such as `tooSmall` must be spread too:

```ts
import en from '@volverjs/zod-vue-i18n/locales/v4/en.json'

const errors = {
    ...en,
    invalidTypeReceivedUndefined: 'This field is required',
    tooSmall: {
        ...en.tooSmall,
        string: {
            ...en.tooSmall.string,
            inclusive: 'At least {minimum} characters, please',
        },
    },
}
```

`mergeLocaleMessage` merges deeply, so the incremental form is simpler when the
instance already exists:

```ts
i18n.global.mergeLocaleMessage('en', {
    errors: { tooSmall: { string: { inclusive: 'At least {minimum} characters, please' } } },
})
```

<a id="new-locale"></a>
## Adding a language

Copy the bundled file of the matching build (`locales/<lang>.json` for Zod 3,
`locales/v4/<lang>.json` for Zod 4), translate every value, keep every key. Keep the
`| ` plural forms where the source has them, and keep the `types.*` /
`validations.*` tables: they are what makes `{expected}` and `{format}` read naturally.
Partial files work: a missing key is resolved through `fallbackLocale` first and only
then through Zod's English default (`references/setup.md`), at the cost of one intlify
warning per lookup unless `fallbackWarn` is off.
