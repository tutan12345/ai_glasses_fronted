import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'jsdom',
    globals: true,

    // 测试文件匹配模式
    include: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],

    exclude: [
      'node_modules',
      '.next',
      'coverage',
      'dist',
      'build',
    ],

    // 并发和线程配置
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // 覆盖率配置
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: [
        'text',
        'text-summary',
        'html',
        'json',
        'lcov',
        ['json-summary', { outputFile: 'coverage-summary.json' }],
      ],
      include: [
        'lib/**/*.ts',
        'hooks/**/*.ts',
        'components/**/*.tsx',
        '!lib/**/*.test.ts',
        '!lib/**/*.d.ts',
        '!hooks/**/*.test.ts',
        '!components/**/*.test.tsx',
      ],
      exclude: [
        'node_modules',
        '.next',
        'coverage',
        'dist',
        'build',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types.ts',
        'app/**',
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 50,
          functions: 60,
          lines: 60,
        },
      },
    },

    // 测试报告配置
    reporters: [
      'default',
      ['html', { outputFolder: 'test-reports' }],
    ],

    // 测试设置文件
    setupFiles: ['./vitest.setup.ts'],

    // 别名配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
  },
});

