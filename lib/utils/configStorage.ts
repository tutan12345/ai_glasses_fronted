/**
 * 配置存储工具
 * 使用 LocalStorage 存储 LLM 配置（API Key、Base URL、Model Name）
 * 
 * 为什么用 LocalStorage 而不是 IndexedDB？
 * - 配置数据量小（几个字符串）
 * - 不需要复杂查询
 * - LocalStorage 更简单、同步 API
 * - IndexedDB 也可以，但有点大材小用
 */

export interface LLMConfig {
  apiKey: string;
  baseUrl?: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

const CONFIG_KEY = 'smart_agent_llm_config';

export class ConfigStorage {
  /**
   * 检查是否在浏览器环境
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * 保存配置
   */
  static save(config: LLMConfig): void {
    if (!this.isBrowser()) {
      console.warn('[ConfigStorage] Not in browser environment, cannot save config');
      return;
    }
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      console.log('[ConfigStorage] Config saved');
    } catch (error) {
      console.error('[ConfigStorage] Failed to save config:', error);
    }
  }

  /**
   * 读取配置
   */
  static load(): LLMConfig | null {
    if (!this.isBrowser()) {
      return null;
    }
    try {
      const item = localStorage.getItem(CONFIG_KEY);
      if (!item) return null;
      const config = JSON.parse(item) as LLMConfig;
      console.log('[ConfigStorage] Config loaded');
      return config;
    } catch (error) {
      console.error('[ConfigStorage] Failed to load config:', error);
      return null;
    }
  }

  /**
   * 清除配置
   */
  static clear(): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      localStorage.removeItem(CONFIG_KEY);
      console.log('[ConfigStorage] Config cleared');
    } catch (error) {
      console.error('[ConfigStorage] Failed to clear config:', error);
    }
  }

  /**
   * 获取默认配置
   */
  static getDefault(): LLMConfig {
    return {
      apiKey: '',
      baseUrl: 'https://api.moonshot.cn/v1',
      modelName: 'kimi-k2-thinking',
    };
  }

  /**
   * 获取配置（合并默认值）
   */
  static getConfig(): LLMConfig {
    if (!this.isBrowser()) {
      // 服务端返回默认配置
      return this.getDefault();
    }
    const saved = this.load();
    const defaults = this.getDefault();

    const config = {
      apiKey: saved?.apiKey || defaults.apiKey,
      baseUrl: saved?.baseUrl || defaults.baseUrl,
      modelName: saved?.modelName || defaults.modelName,
    };

    // 验证配置完整性
    if (!config.apiKey || config.apiKey.trim() === '') {
      console.warn('[ConfigStorage] API Key is empty, API calls will fail. Please configure in settings.');
    }

    return config;
  }
}

