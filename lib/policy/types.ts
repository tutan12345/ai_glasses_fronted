/**
 * Policy 类型定义
 * 参考: gemini-cli/packages/core/src/policy/types.ts
 */

export enum PolicyDecision {
  ALLOW = 'allow',
  DENY = 'deny',
  ASK_USER = 'ask_user',
}

export type HookSource = 'project' | 'user' | 'system' | 'extension';

export interface PolicyRule {
  /**
   * 工具名称，如果未定义则适用于所有工具
   */
  toolName?: string;
  /**
   * 参数模式（正则表达式），用于匹配工具参数
   */
  argsPattern?: RegExp;
  /**
   * 决策：允许、拒绝或询问用户
   */
  decision: PolicyDecision;
  /**
   * 优先级（数字越大优先级越高）
   */
  priority?: number;
}

/**
 * 安全检查器接口（基础版本）
 * Phase 3: 基础接口定义，完整实现待 Phase 4+
 */
export interface SafetyChecker {
  name: string;
  check(toolCall: { name: string; args: Record<string, unknown> }): Promise<{
    decision: 'allow' | 'deny' | 'ask_user';
    reason?: string;
  }>;
}

export interface SafetyCheckerRule {
  checker: SafetyChecker;
  toolName?: string;
  argsPattern?: RegExp;
  priority?: number;
}

export interface PolicyEngineConfig {
  /**
   * 策略规则列表
   */
  rules?: PolicyRule[];
  /**
   * 安全检查器规则列表（Phase 3: 基础支持，完整实现待 Phase 4+）
   */
  checkers?: SafetyCheckerRule[];
  /**
   * 默认决策（当没有匹配的规则时）
   */
  defaultDecision?: PolicyDecision;
  /**
   * 非交互模式（如果为 true，ASK_USER 会被转换为 DENY）
   */
  nonInteractive?: boolean;
}

