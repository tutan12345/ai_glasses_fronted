/**
 * Telemetry - 轻量级埋点和监控服务
 * 收集 API 耗时、FPS、ContextLost、SSE 中断等指标
 */

import { logger } from './logger';

interface TelemetryMetrics {
  apiCalls: {
    count: number;
    failures: number;
    totalDuration: number;
    lastDuration?: number;
  };
  sseConnections: {
    count: number;
    interruptions: number;
    totalEvents: number;
  };
  fps: {
    samples: number[];
    avg: number;
    min: number;
    max: number;
  };
  contextLost: {
    count: number;
    lastTimestamp?: number;
  };
}

class TelemetryService {
  private metrics: TelemetryMetrics = {
    apiCalls: { count: 0, failures: 0, totalDuration: 0 },
    sseConnections: { count: 0, interruptions: 0, totalEvents: 0 },
    fps: { samples: [], avg: 0, min: 60, max: 0 },
    contextLost: { count: 0 },
  };

  private fpsFrameCount = 0;
  private fpsLastTime = 0;
  private fpsInterval?: number;

  constructor() {
    this.initFPSTracking();
    this.initWebGLTracking();
  }

  /**
   * API 调用埋点
   */
  recordApiCall(duration: number, success: boolean = true) {
    this.metrics.apiCalls.count++;
    this.metrics.apiCalls.totalDuration += duration;
    this.metrics.apiCalls.lastDuration = duration;

    if (!success) {
      this.metrics.apiCalls.failures++;
    }

    // 开发模式下打印
    if (process.env.NODE_ENV === 'development') {
      logger.telemetry('API call completed', {
        duration: `${duration.toFixed(1)}ms`,
        success,
        totalCalls: this.metrics.apiCalls.count,
        failureRate: `${((this.metrics.apiCalls.failures / this.metrics.apiCalls.count) * 100).toFixed(1)}%`,
      });
    }
  }

  /**
   * SSE 连接埋点
   */
  recordSSEConnection(eventsCount: number, interrupted: boolean = false) {
    this.metrics.sseConnections.count++;
    this.metrics.sseConnections.totalEvents += eventsCount;

    if (interrupted) {
      this.metrics.sseConnections.interruptions++;
    }

    if (process.env.NODE_ENV === 'development') {
      logger.telemetry('SSE connection completed', {
        events: eventsCount,
        interrupted,
        totalConnections: this.metrics.sseConnections.count,
        interruptionRate: `${((this.metrics.sseConnections.interruptions / this.metrics.sseConnections.count) * 100).toFixed(1)}%`,
      });
    }
  }

  /**
   * WebGL Context Lost 埋点
   */
  recordContextLost() {
    this.metrics.contextLost.count++;
    this.metrics.contextLost.lastTimestamp = Date.now();

    logger.telemetry('WebGL Context Lost detected', {
      level: 'warn',
      totalCount: this.metrics.contextLost.count,
      lastTime: new Date(this.metrics.contextLost.lastTimestamp).toISOString(),
    });
  }

  /**
   * 初始化 FPS 跟踪
   */
  private initFPSTracking() {
    if (typeof window === 'undefined') return;

    const trackFPS = (currentTime: number) => {
      this.fpsFrameCount++;

      if (currentTime - this.fpsLastTime >= 1000) { // 每秒采样
        const fps = this.fpsFrameCount;
        this.metrics.fps.samples.push(fps);

        // 保持最近 10 个样本
        if (this.metrics.fps.samples.length > 10) {
          this.metrics.fps.samples.shift();
        }

        // 计算统计
        this.metrics.fps.avg = this.metrics.fps.samples.reduce((a, b) => a + b, 0) / this.metrics.fps.samples.length;
        this.metrics.fps.min = Math.min(this.metrics.fps.min, fps);
        this.metrics.fps.max = Math.max(this.metrics.fps.max, fps);

        // 开发模式打印异常 FPS
        if (process.env.NODE_ENV === 'development' && fps < 45) {
          logger.telemetry('Low FPS detected', {
            level: 'warn',
            current: fps,
            avg: this.metrics.fps.avg.toFixed(1),
            min: this.metrics.fps.min,
          });
        }

        this.fpsFrameCount = 0;
        this.fpsLastTime = currentTime;
      }

      this.fpsInterval = requestAnimationFrame(trackFPS);
    };

    this.fpsInterval = requestAnimationFrame(trackFPS);
  }

  /**
   * 初始化 WebGL 跟踪
   */
  private initWebGLTracking() {
    if (typeof window === 'undefined') return;

    // 监听 WebGL context lost 事件
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      this.recordContextLost();
    };

    // 为所有 canvas 添加监听
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLCanvasElement) {
            node.addEventListener('webglcontextlost', handleContextLost);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // 清理函数
    const cleanup = () => {
      if (this.fpsInterval) {
        cancelAnimationFrame(this.fpsInterval);
      }
      observer.disconnect();
    };

    // 页面卸载时清理
    window.addEventListener('beforeunload', cleanup);
  }

  /**
   * 获取当前指标
   */
  getMetrics(): TelemetryMetrics {
    return { ...this.metrics };
  }

  /**
   * 重置指标
   */
  resetMetrics() {
    this.metrics = {
      apiCalls: { count: 0, failures: 0, totalDuration: 0 },
      sseConnections: { count: 0, interruptions: 0, totalEvents: 0 },
      fps: { samples: [], avg: 0, min: 60, max: 0 },
      contextLost: { count: 0 },
    };
  }

  /**
   * 获取性能摘要
   */
  getPerformanceSummary() {
    const { apiCalls, sseConnections, fps, contextLost } = this.metrics;

    return {
      api: {
        totalCalls: apiCalls.count,
        avgDuration: apiCalls.count > 0 ? (apiCalls.totalDuration / apiCalls.count).toFixed(1) + 'ms' : '0ms',
        failureRate: apiCalls.count > 0 ? ((apiCalls.failures / apiCalls.count) * 100).toFixed(1) + '%' : '0%',
      },
      sse: {
        totalConnections: sseConnections.count,
        interruptionRate: sseConnections.count > 0 ? ((sseConnections.interruptions / sseConnections.count) * 100).toFixed(1) + '%' : '0%',
        avgEventsPerConnection: sseConnections.count > 0 ? (sseConnections.totalEvents / sseConnections.count).toFixed(1) : '0',
      },
      fps: {
        current: fps.samples[fps.samples.length - 1] || 0,
        avg: fps.avg.toFixed(1),
        min: fps.min,
      },
      webgl: {
        contextLostCount: contextLost.count,
      },
    };
  }
}

// 全局单例
export const telemetry = new TelemetryService();

// 便捷导出
export { TelemetryService };