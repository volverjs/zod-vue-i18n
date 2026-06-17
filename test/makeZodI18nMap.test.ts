import { makeZodI18nMap, zDate } from '../src'
import { createI18n } from 'vue-i18n'
import { type SafeParseReturnType, z } from 'zod/v3'
import enLocale from '../locales/en.json'
import frLocale from '../locales/fr.json'
import itLocale from '../locales/it.json'
import ptBRLocale from '../locales/ptBR.json'

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
	parsed: SafeParseReturnType<unknown, unknown>,
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
	z.setErrorMap(makeZodI18nMap(i18n))
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

describe('bundled en locale', () => {
	it('translates invalid_type (string expected, number received)', () => {
		createInstance({ errors: enLocale })
		expect(getErrorMessage(z.string().safeParse(123))).toEqual(
			'Expected string, received number',
		)
	})

	it('translates a missing value as "Mandatory"', () => {
		createInstance({ errors: enLocale })
		expect(getErrorMessage(z.string().safeParse(undefined))).toEqual('Mandatory')
		expect(getErrorMessage(z.string().safeParse(null))).toEqual('Mandatory')
	})

	it('translates unrecognized_keys without literal quotes', () => {
		createInstance({ errors: enLocale })
		const result = getErrorMessage(
			z.object({ name: z.string() }).strict().safeParse({ name: 'a', extra: 1 }),
		)
		// regression: message must not be wrapped in literal single quotes
		// (the inner quotes around `extra` come from zod's joinValues)
		expect(result).toEqual('Unrecognized keys: \'extra\'')
		expect(result.startsWith('\'')).toBe(false)
	})

	it('translates not_multiple_of', () => {
		createInstance({ errors: enLocale })
		expect(getErrorMessage(z.number().multipleOf(5).safeParse(3))).toEqual(
			'The number must be a multiple of 5',
		)
	})

	it('translates too_big for strings with the maximum placeholder', () => {
		createInstance({ errors: enLocale })
		expect(getErrorMessage(z.string().max(3).safeParse('12345'))).toEqual(
			'Maximum length 3 characters',
		)
		// regression: tooBig.string.exact used to interpolate {minimum} instead of {maximum}
		expect(getErrorMessage(z.string().length(3).safeParse('12345'))).toEqual(
			'The length must be of 3 characters',
		)
	})

	it('translates invalid_string validation labels via the prefix', () => {
		createInstance({ errors: enLocale })
		expect(getErrorMessage(z.string().email().safeParse('nope'))).toEqual('Invalid Email')
	})

	it('formats date boundaries through d() (regression: produced "Invalid Date")', () => {
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
		// regression: the WithPath key lookup was missing the dot after the namespace
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
		createInstance({ my_custom_key: 'This is not a string' })
		const result = getErrorMessage(
			z.string().refine(() => false, { params: { i18n: 'my_custom_key' } }).safeParse('x'),
		)
		expect(result).toEqual('This is not a string')
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
		// regression: used to return the raw key (e.g. "tooSmall.string.inclusive")
		expect(result).not.toMatch(/^(errors\.)?tooSmall/)
		expect(result).toContain('5')
	})
})

describe('bundled non-english locales', () => {
	const createMultiInstance = (locale: string) => {
		const i18n = createI18n({
			legacy: false,
			locale,
			messages: {
				it: { errors: itLocale },
				fr: { errors: frLocale },
				ptBR: { errors: ptBRLocale },
			},
		})
		z.setErrorMap(makeZodI18nMap(i18n))
		return i18n
	}

	it('translates invalid_type with localized type names (it)', () => {
		createMultiInstance('it')
		// regression: italian type names used to be left in english
		expect(getErrorMessage(z.string().safeParse(123))).toEqual(
			'Previsto stringa, ricevuto numero',
		)
	})

	it('translates too_small string (fr)', () => {
		createMultiInstance('fr')
		expect(getErrorMessage(z.string().min(5).safeParse('1'))).toEqual(
			'5 caractères minimum',
		)
	})

	it('translates invalid_string without redundant placeholder (ptBR)', () => {
		createMultiInstance('ptBR')
		// regression: used to render "E-mail inválido: Email"
		expect(getErrorMessage(z.string().email().safeParse('nope'))).toEqual(
			'e-mail inválido',
		)
	})
})

describe('zDate', () => {
	it('accepts a valid ISO date and is anchored', () => {
		expect(zDate.safeParse('2026-06-16').success).toBe(true)
		// regression: regex was unanchored and matched substrings
		expect(zDate.safeParse('xx2026-06-16yy').success).toBe(false)
	})
})
