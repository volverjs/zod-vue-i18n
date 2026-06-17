import type { $ZodErrorMap } from 'zod/v4/core'
import type { AnyI18n, TranslateLabelOptions, TranslateOptions } from '../types'
import { z } from 'zod/v4'
import { util } from 'zod/v4/core'
import { en } from 'zod/v4/locales'
import { boundarySuffix, resolveCustomMessage, translateLabelFactory } from '../utils'

const defaultErrorMap = en().localeError

/**
 * A zod schema that validates ISO calendar dates in `YYYY-MM-DD` format
 * (e.g. `2026-06-16`). Useful for `<input type="date">` values, which are
 * exchanged as strings rather than `Date` objects.
 *
 * @example
 * ```ts
 * zDate.parse('2026-06-16') // ok
 * zDate.parse('16/06/2026') // throws
 * ```
 */
const zDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

// Normalizes the zod v4 default error (string | { message } | undefined).
function resolveDefaultMessage(result: ReturnType<typeof defaultErrorMap>): string {
    if (!result) {
        return ''
    }
    return typeof result === 'string' ? result : result.message
}

function makeZodI18nMap(i18n: AnyI18n, key = 'errors'): $ZodErrorMap {
    const d = i18n.global.d
    const n = i18n.global.n

    const translateLabel = translateLabelFactory(i18n, key)

    // Formats a `too_small`/`too_big` boundary: dates through `d`, plain
    // numbers through `n`, while bigints are passed through untouched.
    const formatBoundary = (value: number | bigint, origin: string): string | bigint => {
        if (origin === 'date') {
            return d(new Date(Number(value)))
        }
        if (typeof value === 'bigint') {
            return value
        }
        return n(value)
    }
    const boundaryCount = (value: number | bigint): number | undefined =>
        typeof value === 'bigint' ? undefined : value

    return (issue) => {
        const defaultMessage = resolveDefaultMessage(defaultErrorMap(issue))
        let message = defaultMessage
        const options: TranslateLabelOptions = {}

        switch (issue.code) {
            case 'invalid_type':
                if (issue.input === undefined) {
                    message = 'invalidTypeReceivedUndefined'
                }
                else if (issue.input === null) {
                    message = 'invalidTypeReceivedNull'
                }
                else {
                    message = 'invalidType'
                    options.named = {
                        expected: translateLabel(issue.expected, { prefix: 'types' }),
                        received: translateLabel(util.parsedType(issue.input), { prefix: 'types' }),
                    }
                }
                break
            case 'invalid_value': {
                const values = issue.values ?? []
                message = 'invalidValue'
                options.count = values.length
                options.named = {
                    values: util.joinValues(values, '|'),
                    expected: values.length === 1
                        ? util.stringifyPrimitive(values[0])
                        : util.joinValues(values, '|'),
                }
                break
            }
            case 'too_big':
                options.count = boundaryCount(issue.maximum)
                message = `tooBig.${issue.origin}.${boundarySuffix(issue)}`
                options.named = {
                    maximum: formatBoundary(issue.maximum, issue.origin),
                }
                break
            case 'too_small':
                options.count = boundaryCount(issue.minimum)
                message = `tooSmall.${issue.origin}.${boundarySuffix(issue)}`
                options.named = {
                    minimum: formatBoundary(issue.minimum, issue.origin),
                }
                break
            case 'invalid_format':
                message = ['starts_with', 'ends_with', 'includes', 'regex'].includes(issue.format)
                    ? `invalidFormat.${issue.format}`
                    : `invalidFormat.default`
                options.named = {
                    prefix: issue.prefix,
                    suffix: issue.suffix,
                    includes: issue.includes,
                    pattern: issue.pattern,
                    format: translateLabel(issue.format, { prefix: 'types' }),
                }
                break
            case 'not_multiple_of':
                message = 'notMultipleOf'
                options.named = {
                    multipleOf: issue.divisor,
                }
                break
            case 'unrecognized_keys':
                message = 'unrecognizedKeys'
                options.named = {
                    keys: util.joinValues(issue.keys, ', '),
                }
                break
            case 'invalid_key':
                message = 'invalidKey'
                options.named = {
                    origin: issue.origin,
                }
                break
            case 'invalid_union':
                message = 'invalidUnion'
                break
            case 'invalid_element':
                message = 'invalidElement'
                options.named = {
                    origin: issue.origin,
                }
                break
            case 'custom':
                message = resolveCustomMessage(issue.params, options)
                break
        }
        options.named = {
            ...options.named,
            path: issue.path?.join('.') || '',
        }
        return { message: translateLabel(message, { ...options, fallback: defaultMessage }) }
    }
}

/**
 * Creates a helper that attaches a translated message to any Zod v4 validation
 * — built-in (`.min()`, `.email()`, …) or custom (`.refine()`) — through Zod's
 * native `error` option, without going through `params.i18n`.
 *
 * The message is resolved lazily on every parse (via a function), so it stays
 * correct for statically-defined schemas even when the active locale changes
 * after the schema was created.
 *
 * @example
 * ```ts
 * const label = makeZodI18nLabel(i18n)
 * const schema = z.string().min(5, label('nameTooShort', { min: 5 }))
 * schema.safeParse('a') // => translation of `errors.nameTooShort`
 * ```
 */
function makeZodI18nLabel(i18n: AnyI18n, key = 'errors') {
    const translate = translateLabelFactory(i18n, key)
    return (label: string, named?: TranslateOptions, count?: number): { error: () => string } => ({
        error: () => translate(label, { named, count }),
    })
}

export { makeZodI18nLabel, makeZodI18nMap, zDate }
