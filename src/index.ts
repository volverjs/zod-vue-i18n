import type {
    ComposerDateTimeFormatting,
    ComposerTranslation,
    I18n,
} from 'vue-i18n'
import {
    defaultErrorMap,
    type ErrorMapCtx,
    z,
    type ZodErrorMap,
    ZodIssueCode,
    type ZodIssueOptionalMessage,
    ZodParsedType,
} from 'zod'
import { joinValues, jsonStringifyReplacer } from './utils'

const zDate = z.string().regex(/(\d{4})-\d{2}-(\d{2})/)

type i18nOptions = {
    [key: string]: unknown
}

function makeZodI18nMap(i18n: I18n, key = 'errors'): ZodErrorMap {
    return (issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx): { message: string } => {
        let message: string
        message = defaultErrorMap(issue, ctx).message

        let options = {} as i18nOptions

        const t = i18n.global.t as ComposerTranslation
        const te = i18n.global.te
        const d = i18n.global.d as ComposerDateTimeFormatting

        const translateLabel = (message: string, options: i18nOptions) => {
            if (te(`${key}.${message}WithPath`)) {
                return t(`${key}.${message}WithPath`, options)
            }
            if (te(`${key}.${message}`)) {
                return t(`${key}.${message}`, options)
            }
            if (te(message)) {
                return t(message, options)
            }
            return message
        }

        switch (issue.code) {
            case ZodIssueCode.invalid_type:
                if (issue.received === ZodParsedType.undefined) {
                    message = 'invalidTypeReceivedUndefined'
                }
                else {
                    message = 'invalidType'
                    options = {
                        expected: te(`types.${issue.expected}`)
                            ? t(`types.${issue.expected}`)
                            : issue.expected,
                        received: te(`types.${issue.received}`)
                            ? t(`types.${issue.received}`)
                            : issue.received,
                    }
                }
                break
            case ZodIssueCode.invalid_literal:
                message = 'invalidLiteral'
                options = {
                    expected: JSON.stringify(
                        issue.expected,
                        jsonStringifyReplacer,
                    ),
                }
                break
            case ZodIssueCode.unrecognized_keys:
                message = 'unrecognizedKeys'
                options = {
                    keys: joinValues(issue.keys, ', '),
                }
                break
            case ZodIssueCode.invalid_union:
                message = 'invalidUnion'
                break
            case ZodIssueCode.invalid_union_discriminator:
                message = 'invalidUnionDiscriminator'
                options = {
                    options: joinValues(issue.options),
                }
                break
            case ZodIssueCode.invalid_enum_value:
                message = 'invalidEnumValue'
                options = {
                    options: joinValues(issue.options),
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
                        options = {
                            startsWith: issue.validation.startsWith,
                        }
                    }
                    else if ('endsWith' in issue.validation) {
                        message = `invalidString.endsWith`
                        options = {
                            endsWith: issue.validation.endsWith,
                        }
                    }
                }
                else {
                    message = `invalidString.${issue.validation}`
                    options = {
                        validation: t(`validations.${issue.validation}`),
                    }
                }
                break
            case ZodIssueCode.too_small:
                message = `tooSmall.${issue.type}.${
                    issue.exact
                        ? 'exact'
                        : issue.inclusive
                            ? 'inclusive'
                            : 'notInclusive'
                }`
                options = {
                    minimum:
						issue.type === 'date'
						    ? d(new Date(issue.minimum as string | number))
						    : issue.minimum,
                }

                break
            case ZodIssueCode.too_big:
                message = `tooBig.${issue.type}.${
                    issue.exact
                        ? 'exact'
                        : issue.inclusive
                            ? 'inclusive'
                            : 'notInclusive'
                }`
                options = {
                    maximum:
						issue.type === 'date'
						    ? d(new Date(issue.maximum as string | number))
						    : issue.maximum,
                }
                break
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
                options = {
                    multipleOf: issue.multipleOf,
                }
                break
            case ZodIssueCode.not_finite:
                message = 'notFinite'
                break
        }
        options.path = issue.path.join('.') || ''
        message = translateLabel(message, options)

        return { message }
    }
}

export { makeZodI18nMap, zDate }
