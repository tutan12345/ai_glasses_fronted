import { EventEmitter } from 'events';
import {
  MessageBusType,
  type Message,
} from './types';

/**
 * 简化版的 MessageBus，仅用于前端 UI 的事件协调
 */
export class MessageBus extends EventEmitter {
  constructor(
    private readonly policyEngine: any,
    private readonly debug = false,
  ) {
    super();
  }

  async publish(message: Message): Promise<void> {
    if (this.debug) {
      console.debug(`[MessageBus] publish: ${JSON.stringify(message)}`);
    }
    // 在前端，我们主要关注工具调用的确认响应
    this.emit(message.type, message);
  }

  subscribe<T extends Message>(
    type: T['type'],
    listener: (message: T) => void,
  ): void {
    this.on(type, listener);
  }

  unsubscribe<T extends Message>(
    type: T['type'],
    listener: (message: T) => void,
  ): void {
    this.off(type, listener);
  }

  /**
   * 简单的请求-响应模式实现
   */
  async requestResponse<TRequest extends Message, TResponse extends Message>(
    request: TRequest,
    responseType: TResponse['type'],
    timeout = 30000,
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const correlationId = (request as any).correlationId;
      
      const timeoutId = setTimeout(() => {
        this.off(responseType, handler);
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      const handler = (response: TResponse) => {
        if ((response as any).correlationId === correlationId) {
          clearTimeout(timeoutId);
          this.off(responseType, handler);
          resolve(response);
        }
      };

      this.on(responseType, handler);
      this.publish(request).catch(reject);
    });
  }
}

