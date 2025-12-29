import { PolicyDecision, type PolicyEngineConfig } from './types';

/**
 * 简化版的 PolicyEngine，仅用于前端编译通过
 */
export class PolicyEngine {
  private readonly defaultDecision: PolicyDecision;

  constructor(config: PolicyEngineConfig = {}) {
    this.defaultDecision = config.defaultDecision ?? PolicyDecision.ASK_USER;
  }

  async check(): Promise<{ decision: PolicyDecision }> {
    // 前端策略引擎默认返回 ASK_USER，由 UI 处理确认
    return { decision: this.defaultDecision };
  }
}

