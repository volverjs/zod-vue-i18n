import type { I18n } from 'vue-i18n'

/**
 * A vue-i18n instance accepted regardless of how its messages, formats or
 * locales are typed. `createI18n({ messages })` produces a strongly-typed
 * instance that would otherwise not be assignable to the bare `I18n` type.
 */
export type AnyI18n = I18n<any, any, any, any, boolean>

export type TranslateOptions = {
    [key: string]: unknown
}

export type TranslateLabelOptions = { named?: TranslateOptions, prefix?: string, count?: number, fallback?: string }
