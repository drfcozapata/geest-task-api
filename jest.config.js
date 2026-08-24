module.exports = {
  transform: {
    '^.+\\.ts$': '@swc/jest',
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  setupFiles: ['dotenv/config'],
  // Las suites comparten una única base de datos remota (Aiven). Si corren en
  // paralelo, los TRUNCATE/DELETE de beforeAll/beforeEach colisionan y provocan
  // deadlocks y timeouts. maxWorkers:1 las serializa y evita la contención.
  maxWorkers: 1,
  // La latencia de la DB remota hace que los flujos pesados (complete -> archive
  // -> 3x processNotifications) superen el timeout por defecto de 5s.
  testTimeout: 30000,
  // El pool de mysql2 mantiene conexiones abiertas; forzamos la salida para que
  // `npm test` termine sin quedar colgado (el if require.main en app.ts ya evita
  // abrir el servidor durante los tests).
  forceExit: true,
};
