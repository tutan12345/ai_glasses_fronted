/**
 * 诊断系统类型定义 - Phase 11.4.1
 *
 * 统一错误格式和诊断接口
 */

export enum DiagnosticSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum DiagnosticCategory {
  // 系统级别错误
  SYSTEM_ERROR = 'system_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',

  // 工具调用相关
  TOOL_EXECUTION_ERROR = 'tool_execution_error',
  TOOL_VALIDATION_ERROR = 'tool_validation_error',
  TOOL_PERMISSION_ERROR = 'tool_permission_error',

  // LLM 相关
  LLM_API_ERROR = 'llm_api_error',
  LLM_RESPONSE_ERROR = 'llm_response_error',
  LLM_PARSING_ERROR = 'llm_parsing_error',

  // 业务逻辑错误
  BUSINESS_LOGIC_ERROR = 'business_logic_error',
  CONFIGURATION_ERROR = 'configuration_error',

  // 性能相关
  PERFORMANCE_WARNING = 'performance_warning',
  RESOURCE_LIMIT = 'resource_limit',
}

export interface DiagnosticContext {
  // 基本上下文
  timestamp: number;
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;

  // 错误相关上下文
  error?: Error;
  stackTrace?: string;

  // 请求上下文
  requestId?: string;
  requestParams?: Record<string, unknown>;

  // 系统上下文
  environment: 'development' | 'staging' | 'production';
  version?: string;

  // 自定义上下文
  metadata?: Record<string, unknown>;
}

export interface DiagnosticError {
  // 基础信息
  id: string;
  timestamp: number;
  message: string;

  // 分类信息
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;

  // 错误详情
  code?: string;
  details?: string;
  cause?: string;

  // 上下文信息
  context: DiagnosticContext;

  // 解决建议
  suggestions?: string[];

  // 统计信息
  occurrenceCount: number;
  firstOccurrence: number;
  lastOccurrence: number;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: number;

  // 阈值信息
  threshold?: number;
  warningThreshold?: number;

  // 上下文
  component: string;
  operation: string;
  context?: Record<string, unknown>;
}

export interface PerformanceThreshold {
  metricName: string;
  warningThreshold: number;
  criticalThreshold: number;
  unit: string;

  // 监控配置
  enabled: boolean;
  component: string;
  operation?: string;
}

export interface DiagnosticReport {
  // 报告基本信息
  id: string;
  timestamp: number;
  period: {
    start: number;
    end: number;
  };

  // 错误统计
  errors: {
    total: number;
    byCategory: Record<DiagnosticCategory, number>;
    bySeverity: Record<DiagnosticSeverity, number>;
    topErrors: DiagnosticError[];
  };

  // 性能统计
  performance: {
    metrics: PerformanceMetric[];
    violations: {
      warning: PerformanceMetric[];
      critical: PerformanceMetric[];
    };
    averages: Record<string, number>;
  };

  // 系统健康状态
  health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memoryUsage: number;
    cpuUsage?: number;
  };
}

export interface DiagnosticConfig {
  // 错误处理配置
  errorTracking: {
    enabled: boolean;
    maxErrorsPerCategory: number;
    retentionPeriod: number; // 毫秒
  };

  // 性能监控配置
  performanceMonitoring: {
    enabled: boolean;
    collectionInterval: number; // 毫秒
    thresholds: PerformanceThreshold[];
  };

  // 诊断输出配置
  reporting: {
    enabled: boolean;
    reportInterval: number; // 毫秒
    outputFormat: 'json' | 'console' | 'file';
    outputPath?: string;
  };
}

