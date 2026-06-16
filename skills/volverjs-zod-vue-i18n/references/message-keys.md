# Message-key reference

Every key below lives under the `errors` namespace (or the custom namespace you
passed as the second argument to `makeZodI18nMap`). Any key you omit falls back to
Zod's built-in default message.

- `{path}` (the dot-joined field path, e.g. `address.city`) is available as a
  named parameter in **every** message.
- Appending `WithPath` to any key (e.g. `invalidTypeWithPath`) defines a variant
  used when the issue has a non-empty path; it falls back to the base key.
- Numeric data (`count`, `minimum`, `maximum`, `keys`, `value`) drives vue-i18n
  pluralization — use the `a | b` pipe syntax.

The two builds map different Zod issue shapes, so the key sets differ.

## Contents
- [Zod 3 keys](#zod-3-entry-point)
- [Zod 4 keys](#zod-4-entry-point-v4)
- [Shared lookup tables: types & validations](#shared-lookup-tables)

---

## Zod 3 entry point

| Issue | Key | Named params |
| --- | --- | --- |
| invalid_type (undefined) | `invalidTypeReceivedUndefined` | — |
| invalid_type (null) | `invalidTypeReceivedNull` | — |
| invalid_type (other) | `invalidType` | `expected`, `received` (translated via `types.*`) |
| invalid_literal | `invalidLiteral` | `expected` |
| unrecognized_keys | `unrecognizedKeys` | `keys` (joined); count = number of keys |
| invalid_union | `invalidUnion` | — |
| invalid_union_discriminator | `invalidUnionDiscriminator` | `options`; count = number of options |
| invalid_enum_value | `invalidEnumValue` | `options`, `received` |
| invalid_arguments | `invalidArguments` | — |
| invalid_return_type | `invalidReturnType` | — |
| invalid_date | `invalidDate` | — |
| invalid_string (validation) | `invalidString.<validation>` | `validation` (translated via `validations.*`) |
| invalid_string (startsWith) | `invalidString.startsWith` | `startsWith` |
| invalid_string (endsWith) | `invalidString.endsWith` | `endsWith` |
| too_small | `tooSmall.<type>.<bound>` | `minimum`; count = minimum |
| too_big | `tooBig.<type>.<bound>` | `maximum`; count = maximum |
| invalid_intersection_types | `invalidIntersectionTypes` | — |
| not_multiple_of | `notMultipleOf` | `multipleOf` |
| not_finite | `notFinite` | — |
| custom | `custom` | overridable via `params.i18n` |

- `<type>` for too_small/too_big: `string` · `number` · `array` · `set` · `date` · `bigint`
- `<bound>`: `exact` (when `.length`/exact) · `inclusive` (≤ / ≥) · `notInclusive` (< / >)
- `date` minimum/maximum are pre-formatted through `i18n.global.d`; numbers through `i18n.global.n`.

```jsonc
{
  "tooSmall": {
    "string": {
      "exact": "Exactly {minimum} character | Exactly {minimum} characters",
      "inclusive": "At least {minimum} characters",
      "notInclusive": "More than {minimum} characters"
    }
  }
}
```

---

## Zod 4 entry point (`/v4`)

| Issue | Key | Named params |
| --- | --- | --- |
| invalid_type (undefined) | `invalidTypeReceivedUndefined` | — |
| invalid_type (null) | `invalidTypeReceivedNull` | — |
| invalid_type (other) | `invalidType` | `expected`, `received` (translated via `types.*`) |
| invalid_value | `invalidValue` | `values`, `expected`; count = number of values |
| too_big | `tooBig.<origin>.<bound>` | `maximum`; count = maximum |
| too_small | `tooSmall.<origin>.<bound>` | `minimum`; count = minimum |
| invalid_format (starts_with) | `invalidFormat.starts_with` | `prefix` |
| invalid_format (ends_with) | `invalidFormat.ends_with` | `suffix` |
| invalid_format (includes) | `invalidFormat.includes` | `includes` |
| invalid_format (regex) | `invalidFormat.regex` | `pattern` |
| invalid_format (other) | `invalidFormat.default` | `format` (translated via `types.*`) |
| not_multiple_of | `notMultipleOf` | `multipleOf` (from `issue.divisor`) |
| unrecognized_keys | `unrecognizedKeys` | `keys` (joined) |
| invalid_key | `invalidKey` | `origin` |
| invalid_union | `invalidUnion` | — |
| invalid_element | `invalidElement` | `origin` |
| custom | `custom` | overridable via `params.i18n` |

- `<origin>` for too_small/too_big: `number` · `int` · `bigint` · `date` · `string` · `array` · `set` · `file`
- `<bound>`: `exact` · `inclusive` · `notInclusive` (same meaning as Zod 3)
- `date` boundaries are formatted through `i18n.global.d`, other numbers through `i18n.global.n`.

---

## Shared lookup tables

`invalidType` (and Zod 4 `invalidFormat.default`) translate the type name through
the `types.*` table; Zod 3 `invalid_string` translates the validation name through
`validations.*`. Provide these so `{expected}`/`{received}`/`{format}`/`{validation}`
render in the active language. The bundled locales already include them.

```jsonc
{
  "types": { "string": "string", "number": "number", "date": "date" /* … */ },
  "validations": { "email": "Email", "url": "URL", "uuid": "UUID" /* … */ }
}
```

The exact set of `types.*` keys differs between builds (Zod 4 has many string
formats like `email`, `uuid`, `ipv4`, `datetime`, …). Copy the bundled
`locales/<lang>.json` / `locales/v4/<lang>.json` as the starting point rather than
hand-listing them.
