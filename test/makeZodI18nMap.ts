import { makeZodI18nMap } from '../src'
import { createI18n } from 'vue-i18n'
import { type SafeParseReturnType, z } from 'zod'

const messages = {
	en: {
		errors: {
			tooSmall: {
				string: {
					exact: 'Must be exactly {minimum} characters',
					inclusive: 'Must be at least {minimum} characters',
					notInclusive: 'Must be more than {minimum} characters',
				},
			},
		},
	},
}

const getErrorMessage = (
	parsed: SafeParseReturnType<unknown, unknown>,
): string => {
	if ('error' in parsed) return parsed.error.issues[0].message
	throw new Error()
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

	it('Sould use correct translation', () => {
		const i18n = createI18n({
			legacy: false,
			locale: 'en',
		})
		i18n.global.setLocaleMessage('en', messages.en)
		expect(makeZodI18nMap(i18n)).toBeInstanceOf(Function)
		z.setErrorMap(makeZodI18nMap(i18n))
		const result = getErrorMessage(z.string().min(5).safeParse('12'))
		expect(result).toEqual('Must be at least 5 characters')
	})
})
