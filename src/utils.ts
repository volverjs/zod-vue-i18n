import type { AnyI18n, TranslateLabelOptions, TranslateOptions } from './types'

/**
 * The subset of vue-i18n's translate function this library relies on. Declared
 * locally so the permissive {@link AnyI18n} type doesn't drag the heavily
 * overloaded `ComposerTranslation` generics into an excessively deep instantiation.
 */
type TranslateFn = {
    (key: string, named: TranslateOptions): string
    (key: string, plural: number, options: { named: TranslateOptions }): string
}

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

/**
 * Resolves the message key suffix shared by `too_small`/`too_big` issues.
 */
export function boundarySuffix(issue: { exact?: boolean, inclusive?: boolean }): 'exact' | 'inclusive' | 'notInclusive' {
    if (issue.exact) {
        return 'exact'
    }
    return issue.inclusive ? 'inclusive' : 'notInclusive'
}

/**
 * Resolves the message key for a `custom` issue from its `params.i18n` value,
 * merging any provided translate options into `options`.
 */
export function resolveCustomMessage(params: unknown, options: TranslateLabelOptions): string {
    const i18n = (params as { i18n?: unknown } | undefined)?.i18n
    if (typeof i18n === 'string') {
        return i18n
    }
    if (i18n && typeof i18n === 'object' && 'key' in i18n && i18n.key) {
        const { key, options: i18nOptions } = i18n as { key: string, options?: TranslateLabelOptions }
        if (i18nOptions) {
            Object.assign(options, i18nOptions)
        }
        return key
    }
    return 'custom'
}

export function translateLabelFactory(i18n: AnyI18n, key: string) {
    const t = i18n.global.t as unknown as TranslateFn
    const te = i18n.global.te as unknown as (key: string) => boolean

    return (label: unknown, { named = {}, prefix, count, fallback }: TranslateLabelOptions = {}): string => {
        const hasCount = count ?? retrieveCount(named)

        let labelWithPrefix = `${label}`
        if (prefix) {
            labelWithPrefix = `${prefix}.${label}`
        }

        const messageKey = [
            `${key}.${labelWithPrefix}WithPath`,
            `${key}.${labelWithPrefix}`,
            labelWithPrefix,
        ].find(k => te(k))

        if (!messageKey) {
            return fallback ?? `${label}`
        }

        return hasCount !== undefined
            ? t(messageKey, hasCount, { named })
            : t(messageKey, named)
    }
}
