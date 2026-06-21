module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/apps/**/*.test.ts',
    '<rootDir>/packages/**/*.spec.ts'
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@marinheiros/core$': '<rootDir>/packages/core/src'
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.base.json'
    }
  }
};
