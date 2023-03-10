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
