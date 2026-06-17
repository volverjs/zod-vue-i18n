import { makeZodI18nLabel, makeZodI18nMap, zDate } from '../../src/v4'
import { createI18n } from 'vue-i18n'
import { z, ZodSafeParseResult } from 'zod/v4'
import enLocale from '../../locales/v4/en.json'

const messages = {
    en: {
        errors: {
            tooSmall: {
                string: {
                    exact: 'Must be exactly {minimum} character | Must be exactly {minimum} characters',
                    inclusive: 'Must be at least {minimum} characters',
                    notInclusive: 'Must be more than {minimum} characters',
                },
            },
        },
    },
}

const getErrorMessage = (
    parsed: ZodSafeParseResult<unknown>
) => {
    if (!parsed.success) {
        if (parsed.error.issues.length === 0) {
            throw new Error('No validation issues found')
        }
        return parsed.error.issues[0].message
    }
    throw new Error('Expected validation to fail, but it succeeded')
}

const createInstance = (localeMessages: Record<string, unknown>) => {
    const i18n = createI18n({
        legacy: false,
        locale: 'en',
    })
    i18n.global.setLocaleMessage('en', localeMessages)
    z.config({ localeError: makeZodI18nMap(i18n) })
    return i18n
}

describe('makeZodI18nMap', () => {
    it('should return a function', () => {
        const i18n = createI18n({
            legacy: false,
            locale: 'en',
        })
        i18n.global.setLocaleMessage('en', messages.en)
        expect(makeZodI18nMap(i18n)).toBeInstanceOf(Function)
    })

    it('Should use correct translation', () => {
        createInstance(messages.en)
        const result = getErrorMessage(z.string().min(5).safeParse('12'))
        expect(result).toEqual('Must be at least 5 characters')
    })

    it('Should use support plurals translation', () => {
        createInstance(messages.en)
        expect(getErrorMessage(z.string().length(1).safeParse(''))).toEqual(
            'Must be exactly 1 character',
        )
        expect(getErrorMessage(z.string().length(3).safeParse('12'))).toEqual(
            'Must be exactly 3 characters',
        )
    })
})

describe('bundled v4 en locale', () => {
    it('translates invalid_type (string expected, number received)', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.string().safeParse(123))).toEqual(
            'Expected string, received number',
        )
    })

    it('translates a missing value as "Required"', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.string().safeParse(undefined))).toEqual('Required')
        expect(getErrorMessage(z.string().safeParse(null))).toEqual('Required')
    })

    it('translates too_small for numbers', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.number().min(5).safeParse(3))).toEqual(
            'Enter a value greater than or equal to 5',
        )
    })

    it('translates too_big for strings', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.string().max(3).safeParse('12345'))).toEqual(
            'Maximum length 3 character(s)',
        )
    })

    it('translates not_multiple_of', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.number().multipleOf(5).safeParse(3))).toEqual(
            'The number must be a multiple of 5',
        )
    })

    it('translates invalid_format starts_with', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.string().startsWith('foo').safeParse('bar'))).toEqual(
            'Must start with foo',
        )
    })

    it('translates invalid_format default (email) with a type label', () => {
        createInstance({ errors: enLocale })
        expect(getErrorMessage(z.email().safeParse('nope'))).toEqual(
            'Invalid format, expected email address',
        )
    })

    it('translates unrecognized_keys without literal wrapping quotes', () => {
        createInstance({ errors: enLocale })
        const result = getErrorMessage(
            z.strictObject({ name: z.string() }).safeParse({ name: 'a', extra: 1 }),
        )
        expect(result).toContain('extra')
        expect(result.startsWith('\'')).toBe(false)
    })

    it('translates invalid_value for enums', () => {
        createInstance({ errors: enLocale })
        const result = getErrorMessage(z.enum(['a', 'b']).safeParse('c'))
        expect(result).toContain('a')
        expect(result).toContain('b')
    })

    it('formats date boundaries through d() (regression: used issue.type + "Invalid Date")', () => {
        createInstance({ errors: enLocale })
        const result = getErrorMessage(
            z.date().min(new Date('2020-01-01')).safeParse(new Date('2019-06-01')),
        )
        expect(result).not.toContain('Invalid Date')
        expect(result).toContain('2020')
    })

    it('passes bigint boundaries through untouched', () => {
        createInstance({ errors: { tooSmall: { bigint: { inclusive: 'At least {minimum}' } } } })
        expect(getErrorMessage(z.bigint().min(5n).safeParse(3n))).toEqual('At least 5')
    })
})

describe('withPath behaviour', () => {
    const withPathMessages = {
        errors: {
            ...enLocale,
            invalidTypeWithPath:
                'The {path} property expected {expected}, received {received}',
        },
    }

    it('uses the WithPath message when a path is present', () => {
        createInstance(withPathMessages)
        const result = getErrorMessage(
            z.object({ name: z.string() }).safeParse({ name: 1 }),
        )
        expect(result).toEqual('The name property expected string, received number')
    })

    it('falls back to the normal message when no WithPath key exists', () => {
        createInstance({ errors: enLocale })
        const result = getErrorMessage(
            z.object({ name: z.string() }).safeParse({ name: 1 }),
        )
        expect(result).toEqual('Expected string, received number')
    })
})

describe('custom error messages', () => {
    it('supports a string i18n param', () => {
        createInstance({ my_custom_key: 'This is not valid' })
        const result = getErrorMessage(
            z.string().refine(() => false, { params: { i18n: 'my_custom_key' } }).safeParse('x'),
        )
        expect(result).toEqual('This is not valid')
    })

    it('supports an object i18n param with named options', () => {
        createInstance({ greeting: 'Hello {name}' })
        const result = getErrorMessage(
            z.string()
                .refine(() => false, {
                    params: { i18n: { key: 'greeting', options: { named: { name: 'World' } } } },
                })
                .safeParse('x'),
        )
        expect(result).toEqual('Hello World')
    })
})

describe('fallback to zod default', () => {
    it('returns the zod default message when no translation key exists', () => {
        createInstance({})
        const result = getErrorMessage(z.string().min(5).safeParse('1'))
        expect(result).not.toMatch(/^(errors\.)?tooSmall/)
        expect(result).toContain('5')
    })
})

describe('makeZodI18nLabel', () => {
    it('translates a built-in validation message via the error option', () => {
        const i18n = createI18n({ legacy: false, locale: 'en' })
        i18n.global.setLocaleMessage('en', { errors: { nameTooShort: 'Name too short: min {min}' } })
        const label = makeZodI18nLabel(i18n)
        const result = getErrorMessage(z.string().min(5, label('nameTooShort', { min: 5 })).safeParse('a'))
        expect(result).toEqual('Name too short: min 5')
    })

    it('works on custom refinements too', () => {
        const i18n = createI18n({ legacy: false, locale: 'en' })
        i18n.global.setLocaleMessage('en', { errors: { mustBeUnique: 'Must be unique' } })
        const label = makeZodI18nLabel(i18n)
        const result = getErrorMessage(z.string().refine(() => false, label('mustBeUnique')).safeParse('x'))
        expect(result).toEqual('Must be unique')
    })

    it('resolves lazily so static schemas react to locale changes', () => {
        const i18n = createI18n({ legacy: false, locale: 'en' })
        i18n.global.setLocaleMessage('en', { errors: { tooShort: 'Too short' } })
        i18n.global.setLocaleMessage('it', { errors: { tooShort: 'Troppo corto' } })
        const label = makeZodI18nLabel(i18n)
        // schema defined once, never recreated
        const schema = z.string().min(5, label('tooShort'))
        expect(getErrorMessage(schema.safeParse('a'))).toEqual('Too short')
        i18n.global.locale.value = 'it'
        expect(getErrorMessage(schema.safeParse('a'))).toEqual('Troppo corto')
    })
})

describe('zDate', () => {
    it('accepts a valid ISO date and is anchored', () => {
        expect(zDate.safeParse('2026-06-16').success).toBe(true)
        expect(zDate.safeParse('xx2026-06-16yy').success).toBe(false)
    })
})
