module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jest-environment-node',
	testMatch: ['**/test/**/*.ts', '**/test/**/*.js'],
	verbose: true,
	testPathIgnorePatterns: ['dist.*\\.ts$'],
	setupFiles: ['jest-localstorage-mock'],
}
