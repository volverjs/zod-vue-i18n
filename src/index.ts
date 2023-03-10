import {
	type ZodIssueOptionalMessage,
	type ErrorMapCtx,
	type ZodErrorMap,
	ZodIssueCode,
	ZodParsedType,
	defaultErrorMap,
	z as Zod,
} from 'zod'
import type {
	ComposerDateTimeFormatting,
	ComposerTranslation,
	I18n,
} from 'vue-i18n'

import { getDefaults, joinValues, jsonStringifyReplacer } from './utils'

const zDate = Zod.string().regex(/(\d{4})-\d{2}-(\d{2})/)

const makeZodI18nMap =
	(i18n: I18n): ZodErrorMap =>
	(issue: ZodIssueOptionalMessage, ctx: ErrorMapCtx): { message: string } => {
		let message: string
		message = defaultErrorMap(issue, ctx).message

		const t = i18n.global.t as ComposerTranslation
		const d = i18n.global.d as ComposerDateTimeFormatting

		switch (issue.code) {
			case ZodIssueCode.invalid_type:
				if (issue.received === ZodParsedType.undefined) {
					message = t('errors.invalidTypeReceivedUndefined')
				} else {
					message = t('errors.invalidType', {
						expected: t(`types.${issue.expected}`),
						received: t(`types.${issue.received}`),
					})
				}
				break
			case ZodIssueCode.invalid_literal:
				message = t('errors.invalidLiteral', {
					expected: JSON.stringify(
						issue.expected,
						jsonStringifyReplacer,
					),
				})
				break
			case ZodIssueCode.unrecognized_keys:
				message = t('errors.unrecognizedKeys', {
					keys: joinValues(issue.keys, ', '),
				})
				break
			case ZodIssueCode.invalid_union:
				message = t('errors.invalidUnion')
				break
			case ZodIssueCode.invalid_union_discriminator:
				message = t('errors.invalidUnionDiscriminator', {
					options: joinValues(issue.options),
				})
				break
			case ZodIssueCode.invalid_enum_value:
				message = t('errors.invalidEnumValue', {
					options: joinValues(issue.options),
					received: issue.received,
				})
				break
			case ZodIssueCode.invalid_arguments:
				message = t('errors.invalidArguments')
				break
			case ZodIssueCode.invalid_return_type:
				message = t('errors.invalidReturnType')
				break
			case ZodIssueCode.invalid_date:
				message = t('errors.invalidDate')
				break
			case ZodIssueCode.invalid_string:
				if (typeof issue.validation === 'object') {
					if ('startsWith' in issue.validation) {
						message = t(`errors.invalidString.startsWith`, {
							startsWith: issue.validation.startsWith,
						})
					} else if ('endsWith' in issue.validation) {
						message = t(`errors.invalidString.endsWith`, {
							endsWith: issue.validation.endsWith,
						})
					}
				} else {
					message = t(`errors.invalidString.${issue.validation}`, {
						validation: t(`validations.${issue.validation}`),
					})
				}
				break
			case ZodIssueCode.too_small:
				message = t(
					`errors.tooSmall.${issue.type}.${
						issue.exact
							? 'exact'
							: issue.inclusive
							? 'inclusive'
							: 'notInclusive'
					}`,
					{
						minimum:
							issue.type === 'date'
								? d(new Date(issue.minimum as string | number))
								: issue.minimum,
					},
				)
				break
			case ZodIssueCode.too_big:
				message = t(
					`errors.tooBig.${issue.type}.${
						issue.exact
							? 'exact'
							: issue.inclusive
							? 'inclusive'
							: 'notInclusive'
					}`,
					{
						maximum:
							issue.type === 'date'
								? d(new Date(issue.maximum as string | number))
								: issue.maximum,
					},
				)
				break
			case ZodIssueCode.custom:
				message = t('errors.custom')
				break
			case ZodIssueCode.invalid_intersection_types:
				message = t('errors.invalidIntersectionTypes')
				break
			case ZodIssueCode.not_multiple_of:
				message = t('errors.notMultipleOf', {
					multipleOf: issue.multipleOf,
				})
				break
			case ZodIssueCode.not_finite:
				message = t('errors.notFinite')
				break
		}

		return { message }
	}

export { Zod, zDate, makeZodI18nMap, getDefaults }
