import {
	type ZodIssueOptionalMessage,
	type ErrorMapCtx,
	type ZodErrorMap,
	ZodIssueCode,
	ZodParsedType,
	defaultErrorMap,
	z,
} from 'zod'
import type {
	ComposerDateTimeFormatting,
	ComposerTranslation,
	I18n,
} from 'vue-i18n'
import { joinValues, jsonStringifyReplacer } from './utils'

const zDate = z.string().regex(/(\d{4})-\d{2}-(\d{2})/)

interface i18nOptions {
	[key: string]: unknown
}

const makeZodI18nMap =
	(i18n: I18n): ZodErrorMap =>
	(issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx): { message: string } => {
		let message: string
		message = defaultErrorMap(issue, ctx).message

		let options = {} as i18nOptions

		const t = i18n.global.t as ComposerTranslation
		const te = i18n.global.te
		const d = i18n.global.d as ComposerDateTimeFormatting

		const translateLabel = (message: string, options: i18nOptions) => {
			return te(`${message}WithPath`)
				? t(`${message}WithPath`, options)
				: t(message, options)
		}

		switch (issue.code) {
			case ZodIssueCode.invalid_type:
				if (issue.received === ZodParsedType.undefined) {
					message = 'errors.invalidTypeReceivedUndefined'
				} else {
					message = 'errors.invalidType'
					options = {
						expected: te(`types.${issue.expected}`) ? t(`types.${issue.expected}`) : issue.expected,
						received: te(`types.${issue.received}`) ? t(`types.${issue.received}`) : issue.received,
					}
				}
				break
			case ZodIssueCode.invalid_literal:
				message = 'errors.invalidLiteral'
				options = {
					expected: JSON.stringify(
						issue.expected,
						jsonStringifyReplacer,
					),
				}
				break
			case ZodIssueCode.unrecognized_keys:
				message = 'errors.unrecognizedKeys'
				options = {
					keys: joinValues(issue.keys, ', '),
				}
				break
			case ZodIssueCode.invalid_union:
				message = 'errors.invalidUnion'
				break
			case ZodIssueCode.invalid_union_discriminator:
				message = 'errors.invalidUnionDiscriminator'
				options = {
					options: joinValues(issue.options),
				}
				break
			case ZodIssueCode.invalid_enum_value:
				message = 'errors.invalidEnumValue'
				options = {
					options: joinValues(issue.options),
					received: issue.received,
				}
				break
			case ZodIssueCode.invalid_arguments:
				message = 'errors.invalidArguments'
				break
			case ZodIssueCode.invalid_return_type:
				message = 'errors.invalidReturnType'
				break
			case ZodIssueCode.invalid_date:
				message = 'errors.invalidDate'
				break
			case ZodIssueCode.invalid_string:
				if (typeof issue.validation === 'object') {
					if ('startsWith' in issue.validation) {
						message = `errors.invalidString.startsWith`
						options = {
							startsWith: issue.validation.startsWith,
						}
					} else if ('endsWith' in issue.validation) {
						message = `errors.invalidString.endsWith`
						options = {
							endsWith: issue.validation.endsWith,
						}
					}
				} else {
					message = `errors.invalidString.${issue.validation}`
					options = {
						validation: t(`validations.${issue.validation}`),
					}
				}
				break
			case ZodIssueCode.too_small:
				message = `errors.tooSmall.${issue.type}.${
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
				message = `errors.tooBig.${issue.type}.${
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
				message = 'errors.custom'
				if (issue.params?.i18n) {
					message = issue.params.i18n
				}
				break
			case ZodIssueCode.invalid_intersection_types:
				message = 'errors.invalidIntersectionTypes'
				break
			case ZodIssueCode.not_multiple_of:
				message = 'errors.notMultipleOf'
				options = {
					multipleOf: issue.multipleOf,
				}
				break
			case ZodIssueCode.not_finite:
				message = 'errors.notFinite'
				break
		}
		options.path = issue.path.join('.') || ''
		message = translateLabel(message, options)

		return { message }
	}

export { zDate, makeZodI18nMap }
