import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigStorage, type LLMConfig } from './configStorage';

describe('ConfigStorage', () => {
  let mockLocalStorage: Storage;

  beforeEach(() => {
    // 创建mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    vi.clearAllMocks();
  });

  describe('save', () => {
    it('应该保存配置到localStorage', () => {
      const config: LLMConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        modelName: 'test-model',
      };

      ConfigStorage.save(config);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'smart_agent_llm_config',
        JSON.stringify(config)
      );
    });

    it('应该处理localStorage错误', () => {
      mockLocalStorage.setItem = vi.fn(() => {
        throw new Error('Storage quota exceeded');
      });

      const config: LLMConfig = {
        apiKey: 'test-key',
        modelName: 'test-model',
      };

      expect(() => ConfigStorage.save(config)).not.toThrow();
    });
  });

  describe('load', () => {
    it('应该从localStorage加载配置', () => {
      const config: LLMConfig = {
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        modelName: 'test-model',
      };

      mockLocalStorage.getItem = vi.fn(() => JSON.stringify(config));

      const loaded = ConfigStorage.load();

      expect(loaded).toEqual(config);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('smart_agent_llm_config');
    });

    it('应该返回null如果localStorage为空', () => {
      mockLocalStorage.getItem = vi.fn(() => null);

      const loaded = ConfigStorage.load();

      expect(loaded).toBeNull();
    });

    it('应该处理无效的JSON', () => {
      mockLocalStorage.getItem = vi.fn(() => 'invalid-json');

      const loaded = ConfigStorage.load();

      expect(loaded).toBeNull();
    });
  });

  describe('clear', () => {
    it('应该清除localStorage中的配置', () => {
      ConfigStorage.clear();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('smart_agent_llm_config');
    });
  });

  describe('getDefault', () => {
    it('应该返回默认配置', () => {
      const defaultConfig = ConfigStorage.getDefault();

      expect(defaultConfig).toEqual({
        apiKey: '',
        baseUrl: 'https://api.moonshot.cn/v1',
        modelName: 'kimi-k2-thinking',
      });
    });
  });

  describe('getConfig', () => {
    it('应该返回保存的配置', () => {
      const savedConfig: LLMConfig = {
        apiKey: 'saved-key',
        baseUrl: 'https://api.saved.com',
        modelName: 'saved-model',
      };

      mockLocalStorage.getItem = vi.fn(() => JSON.stringify(savedConfig));

      const config = ConfigStorage.getConfig();

      expect(config).toEqual(savedConfig);
    });

    it('应该合并默认配置如果localStorage为空', () => {
      mockLocalStorage.getItem = vi.fn(() => null);

      const config = ConfigStorage.getConfig();

      expect(config).toEqual({
        apiKey: '',
        baseUrl: 'https://api.moonshot.cn/v1',
        modelName: 'kimi-k2-thinking',
      });
    });

    it('应该警告如果API Key为空', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockLocalStorage.getItem = vi.fn(() => null);

      ConfigStorage.getConfig();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('API Key is empty')
      );

      consoleSpy.mockRestore();
    });
  });
});

