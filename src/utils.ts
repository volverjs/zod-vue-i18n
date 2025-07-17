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

export function translateLabelFactory(i18n: I18n, key: string) {
    const t = i18n.global.t as ComposerTranslation
    const te = i18n.global.te

    return (label: string, { named = {}, prefix, count }: TranslateLabelOptions = {}) => {
        const hasCount = count ?? retrieveCount(named)
        let labelWithPrefix = label
        if (prefix) {
            labelWithPrefix = `${prefix}.${label}`
        }
        const messageKey = [
            `${key}${labelWithPrefix}WithPath`,
            `${key}.${labelWithPrefix}`,
            labelWithPrefix,
        ].find(k => te(k))

        if (!messageKey)
            return label

        return hasCount !== undefined
            ? t(messageKey, hasCount, { named })
            : t(messageKey, named)
    }
}
