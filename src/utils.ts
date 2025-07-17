import type { TranslateOptions } from './types'

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
