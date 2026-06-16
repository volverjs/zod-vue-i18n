import type { ErrorMapCtx, ZodErrorMap, ZodIssueOptionalMessage } from 'zod/v3'
import type { AnyI18n, TranslateLabelOptions } from './types'
import {
    defaultErrorMap,
    util,
    z,
    ZodIssueCode,
    ZodParsedType,
} from 'zod/v3'
import { boundarySuffix, resolveCustomMessage, translateLabelFactory } from './utils'

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

function makeZodI18nMap(i18n: AnyI18n, key = 'errors'): ZodErrorMap {
    const d = i18n.global.d
    const n = i18n.global.n

    const translateLabel = translateLabelFactory(i18n, key)

    // Formats a `too_small`/`too_big` boundary: dates through `d`, plain
    // numbers through `n`, while bigints are passed through untouched.
    const formatBoundary = (value: number | bigint, type: string): string | bigint => {
        if (type === 'date') {
            return d(new Date(Number(value)))
        }
        if (typeof value === 'bigint') {
            return value
        }
        return n(value)
    }
    const boundaryCount = (value: number | bigint): number | undefined =>
        typeof value === 'bigint' ? undefined : value

    return (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx): { message: string } => {
        const defaultMessage = defaultErrorMap(issue, ctx).message
        let message = defaultMessage
        const options: TranslateLabelOptions = {}

        switch (issue.code) {
            case ZodIssueCode.invalid_type:
                if (issue.received === ZodParsedType.undefined) {
                    message = 'invalidTypeReceivedUndefined'
                }
                else if (issue.received === ZodParsedType.null) {
                    message = 'invalidTypeReceivedNull'
                }
                else {
                    message = 'invalidType'
                    options.named = {
                        expected: translateLabel(issue.expected, { prefix: 'types' }),
                        received: translateLabel(issue.received, { prefix: 'types' }),
                    }
                }
                break
            case ZodIssueCode.invalid_literal:
                message = 'invalidLiteral'
                options.named = {
                    expected: JSON.stringify(
                        issue.expected,
                        util.jsonStringifyReplacer,
                    ),
                }
                break
            case ZodIssueCode.unrecognized_keys:
                message = 'unrecognizedKeys'
                options.count = issue.keys.length
                options.named = {
                    keys: util.joinValues(issue.keys, ', '),
                }
                break
            case ZodIssueCode.invalid_union:
                message = 'invalidUnion'
                break
            case ZodIssueCode.invalid_union_discriminator:
                message = 'invalidUnionDiscriminator'
                options.count = issue.options.length
                options.named = {
                    options: util.joinValues(issue.options),
                }
                break
            case ZodIssueCode.invalid_enum_value:
                message = 'invalidEnumValue'
                options.named = {
                    options: util.joinValues(issue.options),
                    received: issue.received,
                }
                break
            case ZodIssueCode.invalid_arguments:
                message = 'invalidArguments'
                break
            case ZodIssueCode.invalid_return_type:
                message = 'invalidReturnType'
                break
            case ZodIssueCode.invalid_date:
                message = 'invalidDate'
                break
            case ZodIssueCode.invalid_string:
                if (typeof issue.validation === 'object') {
                    if ('startsWith' in issue.validation) {
                        message = `invalidString.startsWith`
                        options.named = {
                            startsWith: issue.validation.startsWith,
                        }
                    }
                    else if ('endsWith' in issue.validation) {
                        message = `invalidString.endsWith`
                        options.named = {
                            endsWith: issue.validation.endsWith,
                        }
                    }
                }
                else {
                    message = `invalidString.${issue.validation}`
                    options.named = {
                        validation: translateLabel(issue.validation, { prefix: 'validations' }),
                    }
                }
                break
            case ZodIssueCode.too_small:
                options.count = boundaryCount(issue.minimum)
                message = `tooSmall.${issue.type}.${boundarySuffix(issue)}`
                options.named = {
                    minimum: formatBoundary(issue.minimum, issue.type),
                }
                break
            case ZodIssueCode.too_big:
                options.count = boundaryCount(issue.maximum)
                message = `tooBig.${issue.type}.${boundarySuffix(issue)}`
                options.named = {
                    maximum: formatBoundary(issue.maximum, issue.type),
                }
                break
            case ZodIssueCode.custom:
                message = resolveCustomMessage(issue.params, options)
                break
            case ZodIssueCode.invalid_intersection_types:
                message = 'invalidIntersectionTypes'
                break
            case ZodIssueCode.not_multiple_of:
                message = 'notMultipleOf'
                options.named = {
                    multipleOf: issue.multipleOf,
                }
                break
            case ZodIssueCode.not_finite:
                message = 'notFinite'
                break
        }
        options.named = {
            ...options.named,
            path: issue.path?.join('.') || '',
        }
        return { message: translateLabel(message, { ...options, fallback: defaultMessage }) }
    }
}

export { makeZodI18nMap, zDate }
