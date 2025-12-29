/**
 * 统一的日志工具 - 添加时间戳和格式化
 */

export interface LogContext {
  timestamp?: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
  category?: string;
  [key: string]: any;
}

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, -5);
  }

  private formatMessage(message: string, context?: LogContext): string {
    const timestamp = context?.timestamp || this.formatTimestamp();
    const category = context?.category ? `[${context.category}]` : '';
    const level = context?.level ? context.level.toUpperCase() : '';

    let formatted = `${timestamp}`;

    if (level) {
      formatted += ` ${level}`;
    }

    if (category) {
      formatted += ` ${category}`;
    }

    formatted += ` ${message}`;

    return formatted;
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(message, { ...context, level: 'debug' }));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(message, { ...context, level: 'info' }));
  }

  log(message: string, context?: LogContext): void {
    console.log(this.formatMessage(message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(message, { ...context, level: 'warn' }));
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage(message, { ...context, level: 'error' }));
  }

  // 便捷方法 - 带时间戳的日志
  withTimestamp(message: string, context?: Omit<LogContext, 'timestamp'>): void {
    this.log(message, { ...context, timestamp: this.formatTimestamp() });
  }

  // 带类别的日志方法
  telemetry(message: string, data?: any): void {
    this.log(message, { category: 'Telemetry', ...data });
  }

  agent(message: string, data?: any): void {
    this.log(message, { category: 'Agent', ...data });
  }

  tool(message: string, data?: any): void {
    this.log(message, { category: 'Tool', ...data });
  }

  ui(message: string, data?: any): void {
    this.log(message, { category: 'UI', ...data });
  }

  stream(message: string, data?: any): void {
    this.log(message, { category: 'Stream', ...data });
  }
}

// 全局日志实例
export const logger = new Logger();

// 向后兼容的便捷导出
export { Logger };