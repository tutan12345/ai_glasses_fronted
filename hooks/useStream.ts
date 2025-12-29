/**
 * useStream - 流式响应 Hook
 */

import { useState, useCallback } from 'react';
import type { ServerGeminiStreamEvent } from '../lib/core/types';
import { telemetry } from '../lib/utils/telemetry';
import { logger } from '../lib/utils/logger';

export function useStream() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 暴露重置 loading 状态的方法
  const resetLoadingState = useCallback(() => {
    logger.stream('Manually resetting loading state');
    setIsLoading(false);
  }, []);

  const stream = useCallback(async (url: string, body: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);

    const fetchStart = performance.now();
    let streamConsumed = false;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let eventCount = 0;

      const events = {
        async *[Symbol.asyncIterator](): AsyncGenerator<ServerGeminiStreamEvent, void, unknown> {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                try {
                  const data = JSON.parse(dataStr) as ServerGeminiStreamEvent;
                  eventCount += 1;
                  yield data;
                  } catch (e) {
                    console.error('[useStream] Failed to parse SSE data:', e, 'data:', dataStr);
                  }
                }
              }
            }
          } finally {
            // 标记流已被消费
            streamConsumed = true;

            // 在迭代完成后记录 telemetry
            const cost = performance.now() - fetchStart;
            const wasInterrupted = eventCount === 0;

            telemetry.recordSSEConnection(eventCount, wasInterrupted);

            if (wasInterrupted) {
              logger.stream('SSE closed with zero events, possible weak network/disconnection', {
                level: 'warn',
                costMs: cost.toFixed(1),
                eventCount
              });
            } else {
              logger.stream('SSE finished', { events: eventCount, costMs: cost.toFixed(1) });
            }
            setIsLoading(false);
          }
        },
      };

      // 设置一个较短的超时，仅用于检测可能的流处理问题，不强制重置loading状态
      setTimeout(() => {
        if (!streamConsumed) {
          logger.stream('Stream not consumed within timeout, this may indicate processing issues', { level: 'warn' });
          // 不在这里强制重置loading状态，让工具执行完成事件来处理
        }
      }, 5000); // 5秒超时，仅用于警告

      return events;
    } catch (err) {
      logger.stream('Stream setup failed', { level: 'error', error: err });
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { stream, isLoading, error, resetLoadingState };
}

