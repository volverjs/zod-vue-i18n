import { z as Zod } from 'zod'
export const jsonStringifyReplacer = (_: string, value: unknown): unknown => {
	if (typeof value === 'bigint') {
		return value.toString()
	}
	return value
}

export function joinValues<T extends unknown[]>(
	array: T,
	separator = ' | ',
): string {
	return array
		.map((val) => (typeof val === 'string' ? `'${val}'` : val))
		.join(separator)
}

import merge from 'ts-deepmerge'

export const getDefaults = <Schema extends Zod.AnyZodObject>(
	schema: Schema,
	original: Partial<Zod.infer<Schema>> = {},
): Record<string, unknown> => {
	return merge(
		Object.fromEntries(
			Object.entries(schema.shape).map(([key, value]) => {
				if (value instanceof Zod.ZodDefault) {
					return [key, value._def.defaultValue()]
				}
				if (value instanceof Zod.ZodObject) {
					return [key, getDefaults(value)]
				}
				return [key, undefined]
			}),
		),
		original,
	) as Partial<Zod.infer<Schema>>
}
