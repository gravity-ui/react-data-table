/* eslint-env node */
module.exports = {
    globals: {
        window: true,
    },
    roots: ['<rootDir>/src/lib', '<rootDir>/src/test'],
    preset: 'ts-jest',
    moduleDirectories: ['node_modules', 'src/lib'],
    moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
    testMatch: ['**/*.test.js'],
    transform: {
        'src/test/.+\\.(j|t)sx?$': 'ts-jest',
    },
};
