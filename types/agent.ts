export enum StepType {
  USER_INPUT = 'user_input',
  MODEL_RESPONSE = 'model_response',
  THOUGHT = 'thought',
  TOOL_CALL = 'tool_call',
  TOOL_RESULT = 'tool_result',
  ERROR = 'error',
}

export interface AgentStep {
  id: string;
  type: StepType;
  content: string;
  metadata?: any;
  timestamp: number;
}

export interface ToolExecution {
  id: string;
  toolName: string;
  args: any;
  status: 'executing' | 'success' | 'error';
  result?: any;
  error?: string;
  timestamp: number;
  duration?: number;
}

export interface TodoItem {
  id: string;
  content: string; // 使用 content 对齐新版本（向后兼容 title）
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: number;
  // 向后兼容字段
  title?: string; // 兼容旧版本
}