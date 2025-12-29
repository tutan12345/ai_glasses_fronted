/**
 * 子代理架构类型定义 (前端 Mock 版本)
 */

import { GeminiEventType, type Content } from '../core/types';

/**
 * 子代理上下文接口
 */
export interface SubAgentContext {
  /** 子代理唯一标识 */
  id: string;

  /** 子代理名称 */
  name: string;

  /** 子代理描述 */
  description: string;

  /** 独立的对话历史 */
  history: Content[];

  /** 模板变量 */
  variables: Record<string, any>;

  /** 扩展元数据 */
  metadata: Record<string, any>;

  /** 允许的工具列表 */
  tools: string[];

  /** 系统提示 */
  systemInstruction: string;

  /** 父对话ID */
  parentConversationId?: string;

  /** 创建时间 */
  createdAt: number;

  /** 最后活跃时间 */
  lastActiveAt: number;
}

/**
 * 子代理配置接口
 */
export interface SubAgentConfig {
  /** 子代理名称 */
  name: string;

  /** 子代理描述 */
  description: string;

  /** 允许的工具列表 */
  tools: string[];

  /** 系统提示 */
  systemInstruction: string;

  /** 模板变量 */
  variables?: Record<string, any>;

  /** 其他配置 */
  [key: string]: any;
}

/**
 * 子代理事件类型
 */
export type SubAgentEventType =
  | GeminiEventType
  | 'subagent_started'
  | 'subagent_completed'
  | 'subagent_error'
  | 'subagent_clarification_needed'
  | 'subagent_context_switched';

/**
 * 子代理事件接口
 */
export interface SubAgentEvent {
  type: SubAgentEventType;
  subAgentId: string;
  conversationId: string;
  timestamp: number;
  data: any;
  /** 前缀标记，区分主智能体和子智能体执行 */
  agentPrefix?: string;
}

/**
 * 子代理响应接口
 */
export interface SubAgentResponse {
  /** 响应内容 */
  content?: string;

  /** 工具调用列表 */
  toolCalls?: Array<{
    id: string;
    name: string;
    args: Record<string, any>;
  }>;

  /** 是否需要用户确认 */
  requiresConfirmation?: boolean;

  /** 是否完成 */
  isComplete?: boolean;

  /** 澄清问题列表 */
  clarificationQuestions?: string[];

  /** 错误信息 */
  error?: string;
}

/**
 * 子代理状态判断结果
 */
export interface SubAgentStatus {
  needsClarification: boolean;
  hasPendingToolCalls: boolean;
  isTaskComplete: boolean;
  isActive: boolean;
  lastActiveAt: number;
}

/**
 * 路由结果接口
 */
export interface RoutingResult {
  targetSubAgentId?: string;
  reason: string;
  confidence: number;
  shouldCreateNew: boolean;
  newSubAgentConfig?: SubAgentConfig;
}

/**
 * 子代理管理器接口
 */
export interface SubAgentManager {
  createSubAgent(config: SubAgentConfig, parentConversationId?: string): Promise<string>;
  getSubAgentContext(subAgentId: string): Promise<SubAgentContext | null>;
  updateSubAgentContext(subAgentId: string, updates: Partial<SubAgentContext>): Promise<void>;
  deleteSubAgent(subAgentId: string): Promise<void>;
  listActiveSubAgents(conversationId?: string): Promise<SubAgentContext[]>;
  getSubAgentStatus(subAgentId: string): Promise<SubAgentStatus>;
}

/**
 * 路由器接口
 */
export interface SubAgentRouter {
  route(input: string, conversationId: string, context?: SubAgentContext): Promise<RoutingResult>;
  registerSubAgent(config: SubAgentConfig): void;
  unregisterSubAgent(name: string): void;
  listAvailableSubAgents(): SubAgentConfig[];
}
