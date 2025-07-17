import type { ComposerTranslation, I18n } from 'vue-i18n'
import type { TranslateLabelOptions, TranslateOptions } from './types'

const PLURAL_KEYS = [
    'count',
    'minimum',
    'maximum',
    'keys',
    'value',
]

export function retrieveCount(options: TranslateOptions): number | undefined {
    for (const key of PLURAL_KEYS) {
        if (key in options && typeof options[key] === 'number') {
            return options[key]
        }
    }
    return undefined
}


export const translateLabelFactory = (i18n: I18n, key: string) => {
    const t = i18n.global.t as ComposerTranslation
    const te = i18n.global.te

    return (label: string, { named = {}, prefix, count }: TranslateLabelOptions = {}) => {
        const hasCount = count ?? retrieveCount(named)
        const completeLabel = `${prefix ? `${prefix}.` : ''}${label}`
        const messageKey = [
            `${key}${completeLabel}WithPath`,
            `${key}.${completeLabel}`,
            completeLabel,
        ].find(k => te(k))

        if (!messageKey)
            return label

        return hasCount !== undefined
            ? t(messageKey, hasCount, { named })
            : t(messageKey, named)
    }
}
