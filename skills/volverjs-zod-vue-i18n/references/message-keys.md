# Message-key reference

Every key below lives under the `errors` namespace (or the namespace passed as the
second argument to `makeZodI18nMap`) and is resolved in the order described in
`references/messages.md`: `WithPath` variant, namespaced key, root key, Zod default.

- `{path}` (the dot-joined issue path, e.g. `address.city`, `items.0.name`) is
  available in **every** message; it is empty for a root-level issue.
- `count` marks the keys that receive a plural count automatically.
- `minimum` / `maximum` arrive formatted through `i18n.global.n` (numbers) or
  `i18n.global.d` (dates); bigints pass through raw.

The two builds map different Zod issue shapes, so the key sets differ.

## Contents

- [Zod 3 keys](#zod-3)
- [Zod 4 keys](#zod-4)
- [Shared lookup tables: `types.*` and `validations.*`](#tables)

<a id="zod-3"></a>
## Zod 3 entry point

| Issue | Key | Named params | count |
| --- | --- | --- | --- |
| invalid_type (received undefined) | `invalidTypeReceivedUndefined` | | |
| invalid_type (received null) | `invalidTypeReceivedNull` | | |
| invalid_type (other) | `invalidType` | `expected`, `received` (via `types.*`) | |
| invalid_literal | `invalidLiteral` | `expected` (JSON-stringified) | |
| unrecognized_keys | `unrecognizedKeys` | `keys` (joined with `, `) | number of keys |
| invalid_union | `invalidUnion` | | |
| invalid_union_discriminator | `invalidUnionDiscriminator` | `options` (joined) | number of options |
| invalid_enum_value | `invalidEnumValue` | `options` (joined), `received` | |
| invalid_arguments | `invalidArguments` | | |
| invalid_return_type | `invalidReturnType` | | |
| invalid_date | `invalidDate` | | |
| invalid_string (`email`, `url`, `uuid`, `cuid`, `regex`, `datetime`, ...) | `invalidString.<validation>` | `validation` (via `validations.*`) | |
| invalid_string (`.startsWith()`) | `invalidString.startsWith` | `startsWith` | |
| invalid_string (`.endsWith()`) | `invalidString.endsWith` | `endsWith` | |
| invalid_string (`.includes()`) | none: Zod's default text | | |
| too_small | `tooSmall.<type>.<bound>` | `minimum` | minimum (not for bigint) |
| too_big | `tooBig.<type>.<bound>` | `maximum` | maximum (not for bigint) |
| invalid_intersection_types | `invalidIntersectionTypes` | | |
| not_multiple_of | `notMultipleOf` | `multipleOf` | |
| not_finite | `notFinite` | | |
| custom (no `params.i18n`) | `custom` | | |
| custom (with `params.i18n`) | the given key | the given `named` | the given `count` |

- `<type>`: `string`, `number`, `array`, `set`, `date`, `bigint`.
- `<bound>`: `exact` (`.length()`), `inclusive` (`.min()` / `.max()`), `notInclusive`
  (`.gt()` / `.lt()`).
- `invalidString.<validation>` covers every string validation Zod 3 reports by name
  (`ip`, `emoji`, `ulid`, `cuid2`... included); the bundled file lists the common ones,
  add the rest as needed. `.includes()` reports an object the map does not handle.

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

<a id="zod-4"></a>
## Zod 4 entry point (`/v4`)

| Issue | Key | Named params | count |
| --- | --- | --- | --- |
| invalid_type (input undefined) | `invalidTypeReceivedUndefined` | | |
| invalid_type (input null) | `invalidTypeReceivedNull` | | |
| invalid_type (other) | `invalidType` | `expected`, `received` (via `types.*`) | |
| invalid_value (`z.literal`, `z.enum`) | `invalidValue` | `values` (joined with `\|`), `expected` (the single value, or the joined list) | number of values |
| too_big | `tooBig.<origin>.<bound>` | `maximum` | maximum (not for bigint) |
| too_small | `tooSmall.<origin>.<bound>` | `minimum` | minimum (not for bigint) |
| invalid_format (`starts_with`) | `invalidFormat.starts_with` | `prefix` | |
| invalid_format (`ends_with`) | `invalidFormat.ends_with` | `suffix` | |
| invalid_format (`includes`) | `invalidFormat.includes` | `includes` | |
| invalid_format (`regex`) | `invalidFormat.regex` | `pattern` | |
| invalid_format (any other: `email`, `uuid`, `ipv4`, `datetime`, ...) | `invalidFormat.default` | `format` (via `types.*`) | |
| not_multiple_of | `notMultipleOf` | `multipleOf` (from `issue.divisor`) | |
| unrecognized_keys | `unrecognizedKeys` | `keys` (joined with `, `) | none |
| invalid_key (`z.record`, `z.map`) | `invalidKey` | `origin` | |
| invalid_union | `invalidUnion` | | |
| invalid_element (`z.map`, `z.set`) | `invalidElement` | `origin` | |
| custom (no `params.i18n`) | `custom` | | |
| custom (with `params.i18n`) | the given key | the given `named` | the given `count` |

- `<origin>`: `number`, `int`, `bigint`, `date`, `string`, `array`, `set`, `file`.
- `<bound>`: `exact`, `inclusive`, `notInclusive`, same meaning as Zod 3.
- `invalidValue` is the single key for both `z.literal` and `z.enum`; the bundled `en`
  uses the count to switch between "expected {expected}" and "expected one of {expected}".
- `invalidFormat.default` receives every named param of the family (`prefix`, `suffix`,
  `includes`, `pattern`) as `undefined` except `format`.

<a id="tables"></a>
## Shared lookup tables

`{expected}`, `{received}` (both builds), `{format}` (Zod 4) and `{validation}` (Zod 3)
are translated through small tables under the same namespace, resolved like any other
key (`errors.types.string`, then `types.string`, then the raw name):

```jsonc
{
    "types": { "string": "string", "number": "number", "date": "date" /* … */ },
    "validations": { "email": "Email", "url": "URL", "uuid": "UUID" /* … */ }
}
```

- Zod 3 `types.*` holds the parsed type names (`string`, `number`, `object`, `array`,
  `date`, `null`, `undefined`, `nan`, `bigint`, `symbol`, `function`, `map`, `set`,
  `promise`, `never`, `void`, `unknown`, `integer`, `float`, `boolean`).
- Zod 4 `types.*` also holds the string formats reported by `invalidFormat.default`
  (`email`, `url`, `uuid`, `uuidv4`, `nanoid`, `cuid2`, `ulid`, `ipv4`, `ipv6`, `cidrv4`,
  `base64`, `jwt`, `e164`, `datetime`, `date`, `time`, `duration`, ...).
- `validations.*` exists on Zod 3 only (`email`, `url`, `uuid`, `cuid`, `regex`, `datetime`).

Copy the bundled `locales/<lang>.json` or `locales/v4/<lang>.json` as the starting point
rather than hand-listing them.
