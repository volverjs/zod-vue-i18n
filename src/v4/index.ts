import type {
    I18n,
} from 'vue-i18n'
import type { $ZodErrorMap } from 'zod/v4/core'
import type { TranslateLabelOptions } from '../types'
import { z } from 'zod/v4'
import { util } from 'zod/v4/core'
import { en } from 'zod/v4/locales'
import { translateLabelFactory } from '../utils'

const defaultErrorMap = en().localeError

const zDate = z.string().regex(/(\d{4})-\d{2}-(\d{2})/)

function makeZodI18nMap(i18n: I18n, key = 'errors'): $ZodErrorMap {
    const d = i18n.global.d
    const n = i18n.global.n

    const translateLabel = translateLabelFactory(i18n, key)

    return (issue) => {
        let message: string = ''
        const defaultMessage = defaultErrorMap(issue)
        if (defaultMessage) {
            if (typeof defaultMessage === 'object') {
                message = defaultMessage?.message
            }
            else {
                message = defaultMessage
            }
        }
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
                        received: translateLabel(issue.received, { prefix: 'types' }),
                    }
                }
                break
            case 'invalid_value':
                message = 'invalidValue'
                options.count = issue.values?.length
                options.named = {
                    values: util.joinValues(issue.values, '|'),
                    expected: issue.values.length === 1
                        ? util.stringifyPrimitive(issue.values[0])
                        : util.joinValues(issue.values, '|'),
                }
                break
            case 'too_big': {
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
                message = `tooBig.${issue.origin}.`
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
            case 'too_small': {
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
                message = `tooSmall.${issue.origin}.`
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
                    multipleOf: issue.multipleOf,
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
                            options.named = issue.params.i18n.options
                        }
                    }
                }
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
