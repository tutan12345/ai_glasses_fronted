/**
 * 核心类型定义 (前端 Mock 版本，不依赖 @google/generative-ai)
 */

// Mock Gemini types to avoid dependency
export interface Part {
  text?: string;
  inlineData?: any;
  functionCall?: FunctionCall;
  functionResponse?: any;
}

export interface Content {
  role: string;
  parts: Part[];
}

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

export type FinishReason = 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';

export enum GeminiEventType {
  Content = 'content',
  ToolCallRequest = 'tool_call_request',
  ToolCallResponse = 'tool_call_response',
  ToolCallConfirmation = 'tool_call_confirmation',
  UserCancelled = 'user_cancelled',
  Error = 'error',
  ChatCompressed = 'chat_compressed',
  Thought = 'thought',
  MaxSessionTurns = 'max_session_turns',
  Finished = 'finished',
  LoopDetected = 'loop_detected',
  Citation = 'citation',
  Retry = 'retry',
  ContextWindowWillOverflow = 'context_window_will_overflow',
  InvalidStream = 'invalid_stream',
  ModelInfo = 'model_info',
}

export interface StructuredError {
  message: string;
  status?: number;
}

export interface GeminiErrorEventValue {
  error: StructuredError;
}

export interface GeminiFinishedEventValue {
  reason: FinishReason | undefined;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

export interface GeminiContentEventValue {
  text: string;
  isComplete: boolean;
}

export interface GeminiToolCallRequestEventValue {
  toolCall: FunctionCall;
  toolName: string;
}

export interface GeminiToolCallResponseEventValue {
  toolCall: FunctionCall;
  result: unknown;
}

export interface GeminiContextWindowWillOverflowEventValue {
  estimatedRequestTokenCount: number;
  remainingTokenCount: number;
}

export interface GeminiThoughtEventValue {
  thought: string;
  confidence?: number;
  reasoning?: string;
}

export interface GeminiToolCallConfirmationEventValue {
  request: FunctionCall;
  details: unknown;
}

/**
 * 扩展的服务端事件 Envelope，用于可观测/可视化（Phase6/6.1）
 */
export interface StreamEnvelope {
  traceId: string;
  promptId: string;
  phase?: string;
  status?: 'pending' | 'running' | 'success' | 'error';
  toolName?: string;
  durationMs?: number;
  error?: StructuredError;
}

export type ServerGeminiStreamEvent =
  | ({ type: GeminiEventType.Content; value: GeminiContentEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.ToolCallRequest; value: GeminiToolCallRequestEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.ToolCallResponse; value: GeminiToolCallResponseEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.ToolCallConfirmation; value: GeminiToolCallConfirmationEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.Finished; value: GeminiFinishedEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.Error; value: GeminiErrorEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.LoopDetected } & StreamEnvelope)
  | ({ type: GeminiEventType.MaxSessionTurns } & StreamEnvelope)
  | ({ type: GeminiEventType.UserCancelled } & StreamEnvelope)
  | ({ type: GeminiEventType.Thought; value: GeminiThoughtEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.ContextWindowWillOverflow; value: GeminiContextWindowWillOverflowEventValue } & StreamEnvelope)
  | ({ type: GeminiEventType.ChatCompressed; value?: ChatCompressionInfo } & StreamEnvelope)
  | ({ type: GeminiEventType.Citation; value: string } & StreamEnvelope)
  | ({ type: GeminiEventType.ModelInfo; value: string } & StreamEnvelope)
  | ({ type: GeminiEventType.Retry } & StreamEnvelope)
  | ({ type: GeminiEventType.InvalidStream } & StreamEnvelope);

export interface ChatCompressionInfo {
  originalTokenCount: number;
  newTokenCount: number;
  compressionStatus: 'compressed' | 'noop' | 'compression_failed_inflated_token_count' | 'compression_failed_empty_summary';
}

export interface Turn {
  promptId: string;
  finishReason?: FinishReason;
  pendingToolCalls: FunctionCall[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}
