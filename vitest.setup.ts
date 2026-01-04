/**
 * Vitest 测试环境设置
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// 全局测试环境设置
beforeAll(async () => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test';

  // Mock window对象（如果需要）
  if (typeof window !== 'undefined') {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock crypto.randomUUID
    if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
      Object.defineProperty(global, 'crypto', {
        value: {
          randomUUID: () => {
            return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          },
        },
        writable: true,
      });
    }
  }

  console.log('🚀 初始化测试环境...');
});

afterAll(async () => {
  // 清理测试资源
  console.log('🧹 清理测试环境...');
});

// 每个测试套件前的设置
beforeEach(async () => {
  // 重置mocks
  vi.clearAllMocks();
  
  // 清理localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});

// 每个测试套件后的清理
afterEach(async () => {
  // 清理测试数据
  vi.restoreAllMocks();
});

// 全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

