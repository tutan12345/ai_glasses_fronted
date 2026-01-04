import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger, Logger } from './logger';

describe('Logger', () => {
  let consoleSpy: {
    debug: ReturnType<typeof vi.spyOn>;
    info: ReturnType<typeof vi.spyOn>;
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug', () => {
    it('应该在开发模式下输出debug日志', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('test message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('不应该在生产模式下输出debug日志', () => {
      process.env.NODE_ENV = 'production';
      logger.debug('test message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('应该输出info日志', () => {
      logger.info('test message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('应该包含时间戳', () => {
      logger.info('test message');
      const call = consoleSpy.info.mock.calls[0][0];
      expect(call).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });
  });

  describe('log', () => {
    it('应该输出日志', () => {
      logger.log('test message');
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('应该输出警告日志', () => {
      logger.warn('test warning');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('应该输出错误日志', () => {
      logger.error('test error');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('便捷方法', () => {
    it('telemetry应该输出带Telemetry类别的日志', () => {
      logger.telemetry('test telemetry', { data: 'test' });
      expect(consoleSpy.log).toHaveBeenCalled();
      const call = consoleSpy.log.mock.calls[0][0];
      expect(call).toContain('Telemetry');
    });

    it('agent应该输出带Agent类别的日志', () => {
      logger.agent('test agent', { data: 'test' });
      expect(consoleSpy.log).toHaveBeenCalled();
      const call = consoleSpy.log.mock.calls[0][0];
      expect(call).toContain('Agent');
    });

    it('tool应该输出带Tool类别的日志', () => {
      logger.tool('test tool', { data: 'test' });
      expect(consoleSpy.log).toHaveBeenCalled();
      const call = consoleSpy.log.mock.calls[0][0];
      expect(call).toContain('Tool');
    });

    it('ui应该输出带UI类别的日志', () => {
      logger.ui('test ui', { data: 'test' });
      expect(consoleSpy.log).toHaveBeenCalled();
      const call = consoleSpy.log.mock.calls[0][0];
      expect(call).toContain('UI');
    });

    it('stream应该输出带Stream类别的日志', () => {
      logger.stream('test stream', { data: 'test' });
      expect(consoleSpy.log).toHaveBeenCalled();
      const call = consoleSpy.log.mock.calls[0][0];
      expect(call).toContain('Stream');
    });
  });
});

