import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateUUID } from './uuid';

describe('generateUUID', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该生成有效的UUID格式', () => {
    const uuid = generateUUID();
    expect(uuid).toBeTruthy();
    expect(typeof uuid).toBe('string');
    expect(uuid.length).toBeGreaterThan(0);
  });

  it('应该生成不同的UUID', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).not.toBe(uuid2);
  });

  it('应该使用crypto.randomUUID如果可用', () => {
    const mockRandomUUID = vi.fn(() => 'test-uuid-123');
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: mockRandomUUID,
      },
      writable: true,
      configurable: true,
    });

    const uuid = generateUUID();
    expect(uuid).toBe('test-uuid-123');
    expect(mockRandomUUID).toHaveBeenCalled();
  });

  it('应该使用fallback如果crypto.randomUUID不可用', () => {
    // 移除crypto.randomUUID
    Object.defineProperty(global, 'crypto', {
      value: {},
      writable: true,
      configurable: true,
    });

    const uuid = generateUUID();
    expect(uuid).toBeTruthy();
    expect(typeof uuid).toBe('string');
    // Fallback格式: timestamp-randomstring
    expect(uuid).toMatch(/^\d+-[a-z0-9]+$/);
  });
});

