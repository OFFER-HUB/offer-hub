/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/apps', '<rootDir>/packages'],
    testMatch: ['**/*.spec.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '^@offerhub/shared$': '<rootDir>/packages/shared/src',
        '^@offerhub/database$': '<rootDir>/packages/database/src',
        '^@offerhub/sdk$': '<rootDir>/packages/sdk/src',
        // Mock ESM modules
        '^ky$': '<rootDir>/apps/api/src/providers/airtm/__tests__/mocks/ky.mock.js',
        '^nanoid$': '<rootDir>/apps/api/src/providers/airtm/__tests__/mocks/nanoid.mock.js',
        // Handle .js extensions in relative TypeScript imports (ESM style)
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    target: 'ES2022',
                    module: 'CommonJS',
                    moduleResolution: 'node',
                    esModuleInterop: true,
                    experimentalDecorators: true,
                    emitDecoratorMetadata: true,
                    strict: true,
                    skipLibCheck: true,
                },
            },
        ],
    },
    transformIgnorePatterns: [
        'node_modules/(?!(ky|nanoid)/)',
    ],
    collectCoverageFrom: [
        'apps/**/*.ts',
        'packages/**/*.ts',
        '!**/*.spec.ts',
        '!**/node_modules/**',
        '!**/dist/**',
    ],
    coverageDirectory: 'coverage',
    verbose: true,
};
