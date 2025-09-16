import type {
    I18n,
} from 'vue-i18n'
import type { ErrorMapCtx, ZodErrorMap, ZodIssueOptionalMessage } from 'zod/v3'
import type { TranslateLabelOptions } from './types'
import {
    defaultErrorMap,
    util,
    z,
    ZodIssueCode,
    ZodParsedType,
} from 'zod/v3'
import { translateLabelFactory } from './utils'

const zDate = z.string().regex(/(\d{4})-\d{2}-(\d{2})/)

function makeZodI18nMap(i18n: I18n, key = 'errors'): ZodErrorMap {
    const d = i18n.global.d
    const n = i18n.global.n

    const translateLabel = translateLabelFactory(i18n, key)

    return (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx): { message: string } => {
        let message = defaultErrorMap(issue, ctx).message
        let options: TranslateLabelOptions = {}

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
            case ZodIssueCode.too_small: {
                let minimum
                if (issue.type === 'date') {
                    minimum = d(new Date(issue.minimum.toString()))
                }
                else if (typeof issue.minimum === 'bigint') {
                    minimum = issue.minimum
                }
                else {
                    minimum = n(issue.minimum)
                }
                options.count = typeof issue.minimum === 'bigint' ? undefined : issue.minimum
                message = `tooSmall.${issue.type}.`
                if (issue.exact) {
                    message += 'exact'
                }
                else {
                    message += issue.inclusive ? 'inclusive' : 'notInclusive'
                }
                options.named = {
                    minimum,
                }

                break
            }
            case ZodIssueCode.too_big: {
                let maximum
                if (issue.type === 'date') {
                    maximum = d(new Date(issue.maximum.toString()))
                }
                else if (typeof issue.maximum === 'bigint') {
                    maximum = issue.maximum
                }
                else {
                    maximum = n(issue.maximum)
                }
                options.count = typeof issue.maximum === 'bigint' ? undefined : issue.maximum
                message = `tooBig.${issue.type}.`
                if (issue.exact) {
                    message += 'exact'
                }
                else {
                    message += issue.inclusive ? 'inclusive' : 'notInclusive'
                }
                options.named = {
                    maximum,
                }
                break
            }
            case ZodIssueCode.custom:
                message = 'custom'
                if (issue.params?.i18n) {
                    if (typeof issue.params.i18n === 'string') {
                        message = issue.params.i18n
                        break
                    }
                    if (
                        typeof issue.params.i18n === 'object'
                        && issue.params.i18n?.key
                    ) {
                        message = issue.params.i18n.key
                        if (issue.params.i18n?.options) {
                            options = issue.params.i18n.options
                        }
                    }
                }
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
        return { message: translateLabel(message, options) }
    }
}

export { makeZodI18nMap, zDate }
