/**
 * useAgent - Agent 交互 Hook
 */

import { useState, useCallback, useEffect } from 'react';
import { useStream } from './useStream';
import type { ServerGeminiStreamEvent } from '../lib/core/types';
import { GeminiEventType } from '../lib/core/types';
import { ConfigStorage, type LLMConfig } from '../lib/utils/configStorage';
import { logger } from '../lib/utils/logger';
import { AgentStep, StepType, ToolExecution, TodoItem } from '../types/agent';
import { telemetry } from '../lib/utils/telemetry';
import type { SubAgentEvent, SubAgentEventType } from '../lib/agents/types';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Phase 14: 补充对话机制
export interface SupplementalInput {
  id: string;
  content: string;
  timestamp: number;
}

export interface ExecutionContext {
  conversationId: string;
  currentExecution?: ToolExecution;
  supplementalInputs: SupplementalInput[];
}

interface ReasoningStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp: number;
  duration?: number;
}

export function useAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [traceId, setTraceId] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [safetyStatus, setSafetyStatus] = useState<'safe' | 'warning' | 'error'>('safe');
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  // Phase 14: 补充对话机制
  const [executionContext, setExecutionContext] = useState<ExecutionContext>({
    conversationId: 'default',
    supplementalInputs: []
  });

  // 生成智能体前缀的辅助函数（支持子智能体扩展）
  const getAgentPrefix = (event?: any): string => {
    // 检查是否是子智能体事件
    if (event && typeof event === 'object') {
      // 未来：检查 event.subAgentId, event.agentPrefix 等字段
      // 例如：
      // if (event.subAgentId) {
      //   const subAgentName = getSubAgentName(event.subAgentId);
      //   return `[子智能体-${subAgentName}]`;
      // }
      // if (event.agentPrefix) {
      //   return event.agentPrefix;
      // }
    }

    // 检查工具名称来推断可能的子智能体
    if (event && event.value && event.value.toolName) {
      const toolName = event.value.toolName;
      if (toolName.includes('music') || toolName === 'music_player') {
        return '[子智能体-音乐助手]';
      }
      if (toolName.includes('calculator') || toolName === 'calculator') {
        return '[子智能体-计算器]';
      }
      // 可以继续添加其他工具到子智能体的映射
    }

    // 默认返回主智能体
    return '[主智能体]';
  };
  // 只在客户端初始化配置
  const [config, setConfig] = useState<LLMConfig>(() => {
    if (typeof window !== 'undefined') {
      const cfg = ConfigStorage.getConfig();
      logger.agent('Initialized with config', { model: cfg.modelName, baseUrl: cfg.baseUrl });
      return cfg;
    }
    return ConfigStorage.getDefault();
  });
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const { stream, isLoading, error, resetLoadingState } = useStream();

  // 监听配置更新事件
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent<LLMConfig>) => {
      setConfig(event.detail);
    };

    window.addEventListener('llmConfigUpdated', handleConfigUpdate as EventListener);
    return () => {
      window.removeEventListener('llmConfigUpdated', handleConfigUpdate as EventListener);
    };
  }, []);

  // Phase 14: 补充对话机制 - 处理输入
  const handleInput = useCallback(async (content: string, conversationId?: string) => {
    // 检查是否有正在执行的任务
    const hasCurrentExecution = executionContext.currentExecution &&
                               executionContext.currentExecution.status === 'executing';

    if (hasCurrentExecution) {
      // 有正在执行的任务，添加到补充输入
      const supplementalInput: SupplementalInput = {
        id: `supplemental-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        timestamp: Date.now()
      };

      // 详细日志：补充输入
      logger.agent('[补充输入] 检测到正在执行的任务', {
        currentExecution: {
          toolName: executionContext.currentExecution?.toolName,
          status: executionContext.currentExecution?.status,
          timestamp: executionContext.currentExecution?.timestamp,
        },
        supplementalInput: {
          id: supplementalInput.id,
          content: supplementalInput.content.substring(0, 100) + (supplementalInput.content.length > 100 ? '...' : ''),
        },
      });
      console.log('[useAgent] 💬 [补充输入] 检测到正在执行的任务:', {
        currentExecution: {
          toolName: executionContext.currentExecution?.toolName,
          args: executionContext.currentExecution?.args,
          status: executionContext.currentExecution?.status,
          duration: executionContext.currentExecution ? Date.now() - executionContext.currentExecution.timestamp : 0,
        },
        supplementalInput: {
          id: supplementalInput.id,
          content,
          timestamp: new Date(supplementalInput.timestamp).toISOString(),
        },
        existingSupplementalInputsCount: executionContext.supplementalInputs.length,
      });

      setExecutionContext(prev => ({
        ...prev,
        supplementalInputs: [...prev.supplementalInputs, supplementalInput]
      }));

      // 添加到消息列表，但标记为补充输入
      const supplementalMessage: Message = {
        id: supplementalInput.id,
        role: 'user',
        content: `[补充输入] ${content}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, supplementalMessage]);

      // TODO: 将补充输入发送给正在执行的任务
      console.log('[useAgent] ✅ 补充输入已添加:', supplementalInput);
      return;
    }

    // 没有执行中的任务，正常启动新任务
    await sendMessage(content, conversationId);
  }, [executionContext.currentExecution]);

  // Phase 14: 智能判断是否需要使用todo工具
  const shouldUseTodoTool = useCallback((input: string): boolean => {
    // 检查输入是否包含多个工具相关的关键词
    const toolKeywords = [
      // 设备控制
      '拍照', '手电筒', '导航', '定位', '音乐', '播放', '音量',
      'photo', 'flashlight', 'navigation', 'location', 'music', 'play', 'volume',
      // 复杂操作
      '打开', '关闭', '设置', '调节', '开始', '停止',
      'open', 'close', 'set', 'adjust', 'start', 'stop',
      // 组合操作
      '和', '以及', '还有', '同时', '先', '然后', '接着',
      'and', 'also', 'then', 'next', 'after'
    ];

    const inputLower = input.toLowerCase();
    const keywordMatches = toolKeywords.filter(keyword => inputLower.includes(keyword)).length;

    // 如果包含多个工具关键词，或者是明确的复杂请求，建议使用todo工具
    return keywordMatches >= 2 || inputLower.includes('todo') || inputLower.includes('任务');
  }, []);

  const sendMessage = useCallback(
    async (content: string, conversationId?: string) => {
      let eventCount = 0;

      // 重置推理链状态
      setReasoningSteps([]);
      setSafetyStatus('safe');
      setLastUserMessage(content);

      // Phase 14: 清除之前的补充输入
      setExecutionContext(prev => ({
        ...prev,
        conversationId: conversationId || prev.conversationId,
        supplementalInputs: []
      }));

      // Phase 14: 智能判断是否需要使用todo工具
      const useTodoTool = shouldUseTodoTool(content);
      if (useTodoTool) {
        logger.agent('[主智能体] 检测到复杂多工具请求', {
          content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          willSuggestTodoTool: true,
        });
        console.log('[useAgent] 🎯 [主智能体] 检测到复杂多工具请求，将建议使用 todo 工具:', {
          content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          contentLength: content.length,
        });
      } else {
        console.log('[useAgent] 📋 [主智能体] 简单请求，不需要 todo 工具');
      }

      // 添加用户消息
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: useTodoTool ? `[复杂任务] ${content}` : content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // 初始化推理步骤
      const initialSteps: ReasoningStep[] = [
        { id: 'intent', name: '意图分析', status: 'active', timestamp: Date.now() },
        { id: 'clarification', name: '澄清确认', status: 'pending', timestamp: Date.now() },
        { id: 'tool_select', name: '工具选择', status: 'pending', timestamp: Date.now() },
        { id: 'safety', name: '安全检查', status: 'pending', timestamp: Date.now() },
        { id: 'execute', name: '执行工具', status: 'pending', timestamp: Date.now() },
        { id: 'result', name: '结果处理', status: 'pending', timestamp: Date.now() },
        { id: 'followup', name: '跟进推理', status: 'pending', timestamp: Date.now() },
      ];
      setReasoningSteps(initialSteps);

      const requestStart = Date.now();

      // 添加用户输入步骤
      const userStepId = `user-${Date.now()}`;
      setSteps((prev) => [
        ...prev,
        {
          id: userStepId,
          type: StepType.USER_INPUT,
          content,
          timestamp: Date.now(),
        },
      ]);

      // 详细日志：用户输入
      logger.agent('[用户输入]', {
        content,
        conversationId: conversationId || 'default',
        timestamp: new Date().toISOString(),
        hasCurrentExecution: !!executionContext.currentExecution,
        currentExecutionTool: executionContext.currentExecution?.toolName,
      });
      console.log('[useAgent] 📝 用户输入:', {
        content,
        conversationId: conversationId || 'default',
        hasSupplementalInputs: executionContext.supplementalInputs.length > 0,
        supplementalInputsCount: executionContext.supplementalInputs.length,
      });

      try {
        // 创建助手消息占位符
        let assistantMessage: Message | null = null;
        let currentStepId: string | null = null;

        // 每次发送前重置 trace/prompt
        setTraceId(null);
        setPromptId(conversationId || null);

        // 准备请求数据
        const requestData = {
          message: content,
          conversationId: conversationId || 'default',
          config, // 传递配置
        };

        // 详细日志：主智能体请求
        logger.agent('[主智能体] 发送请求', {
          message: content,
          conversationId: requestData.conversationId,
          config: {
            modelName: config.modelName,
            baseUrl: config.baseUrl,
            temperature: config.temperature,
          },
          timestamp: new Date().toISOString(),
        });
        console.log('[useAgent] 🚀 [主智能体] 发送请求:', {
          message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          conversationId: requestData.conversationId,
          model: config.modelName,
        });

        // 流式接收响应（传递配置）
        const events = await stream('/api/agent', requestData);

        const requestStartTime = Date.now();

        // 详细日志：流式响应开始
        logger.agent('[主智能体] 流式响应开始', {
          conversationId: conversationId || 'default',
          timestamp: new Date().toISOString(),
        });
        console.log('[useAgent] 🌊 [主智能体] 流式响应开始:', {
          conversationId: conversationId || 'default',
          timestamp: new Date().toISOString(),
        });

        for await (const event of events) {
            eventCount++;
            
            // 捕获 traceId/promptId 以便 UI 展示与排障
            const evtTrace = (event as any).traceId;
            const evtPrompt = (event as any).promptId;
            if (evtTrace && !traceId) {
              setTraceId(evtTrace);
              console.log('[useAgent] 🔍 TraceId 已设置:', evtTrace);
            }
            if (evtPrompt && !promptId) {
              setPromptId(evtPrompt);
              console.log('[useAgent] 🔍 PromptId 已设置:', evtPrompt);
            }

            // 详细日志：每个事件
            console.log(`[useAgent] 📨 事件 #${eventCount} [${event.type}]:`, {
              type: event.type,
              traceId: evtTrace || traceId,
              promptId: evtPrompt || promptId,
              elapsed: Date.now() - requestStartTime,
              hasValue: 'value' in event && !!event.value,
            });

            // 更新推理链状态
            const now = Date.now();
            setReasoningSteps(prev => {
              const updated = [...prev];

              switch (event.type as SubAgentEventType) {
                case GeminiEventType.Content:
                  // 意图分析完成，开始工具选择
                  updated[0] = { ...updated[0], status: 'completed', duration: now - updated[0].timestamp };
                  updated[2] = { ...updated[2], status: 'active' };
                  break;

                case GeminiEventType.ToolCallRequest:
                  // 工具选择完成，开始安全检查和执行
                  updated[2] = { ...updated[2], status: 'completed', duration: now - updated[2].timestamp };
                  updated[3] = { ...updated[3], status: 'active' };
                  updated[4] = { ...updated[4], status: 'active' };
                  break;

                case GeminiEventType.ToolCallResponse:
                  // 工具执行完成，开始结果处理
                  updated[4] = { ...updated[4], status: 'completed', duration: now - updated[4].timestamp };
                  updated[5] = { ...updated[5], status: 'active' };
                  break;

                case GeminiEventType.Finished:
                  // 详细日志：流式响应完成
                  const finishedValue = (event as any).value;
                  const finishedReason = finishedValue?.reason || 'UNKNOWN';
                  const totalDuration = Date.now() - requestStartTime;
                  
                  logger.agent('[主智能体] 流式响应完成', {
                    reason: finishedReason,
                    totalEvents: eventCount,
                    totalDuration,
                    traceId: evtTrace || traceId,
                    promptId: evtPrompt || promptId,
                  });
                  console.log('[useAgent] 🏁 [主智能体] 流式响应完成:', {
                    reason: finishedReason,
                    totalEvents: eventCount,
                    totalDuration: `${totalDuration}ms`,
                    traceId: evtTrace || traceId,
                    promptId: evtPrompt || promptId,
                    timestamp: new Date().toISOString(),
                  });

                  // 推理完成，立即重置 loading 状态
                  resetLoadingState();

                  // Phase 14: 清除当前执行状态
                  setExecutionContext(prev => ({
                    ...prev,
                    currentExecution: undefined
                  }));

                  updated.forEach(step => {
                    if (step.status === 'active') {
                      step.status = 'completed';
                      step.duration = now - step.timestamp;
                    }
                  });
                  break;

                case GeminiEventType.Error:
                  // 详细日志：错误事件
                  const errorValue = (event as any).value;
                  const errorMessage = errorValue?.error?.message || 'Unknown error';
                  const errorTotalDuration = Date.now() - requestStartTime;
                  
                  logger.agent('[主智能体] 错误事件', {
                    error: errorMessage,
                    totalEvents: eventCount,
                    totalDuration: errorTotalDuration,
                    traceId: evtTrace || traceId,
                    promptId: evtPrompt || promptId,
                  });
                  console.error('[useAgent] ❌ [主智能体] 错误事件:', {
                    error: errorMessage,
                    errorValue,
                    totalEvents: eventCount,
                    totalDuration: `${errorTotalDuration}ms`,
                    traceId: evtTrace || traceId,
                    promptId: evtPrompt || promptId,
                    timestamp: new Date().toISOString(),
                  });

                  // 出现错误，立即重置 loading 状态
                  resetLoadingState();

                  // Phase 14: 清除当前执行状态
                  setExecutionContext(prev => ({
                    ...prev,
                    currentExecution: undefined
                  }));

                  updated.forEach(step => {
                    if (step.status === 'active') {
                      step.status = 'failed';
                      step.duration = now - step.timestamp;
                    }
                  });
                  setSafetyStatus('error');
                  break;

                // 处理子智能体事件
                case 'subagent_started':
                case 'subagent_completed':
                case 'subagent_error':
                case 'subagent_clarification_needed':
                  // 子智能体事件，使用前缀区分显示
                  const subAgentEvent = event as unknown as SubAgentEvent;
                  const prefix = subAgentEvent.agentPrefix || '[子智能体]';
                  
                  // 详细日志：子智能体事件
                  logger.agent(`${prefix} ${event.type}`, {
                    eventType: event.type,
                    data: subAgentEvent.data,
                    agentPrefix: prefix,
                  });
                  console.log(`[useAgent] 🤖 ${prefix} ${event.type}:`, {
                    eventType: event.type,
                    data: subAgentEvent.data,
                    fullEvent: subAgentEvent,
                    timestamp: new Date().toISOString(),
                  });
                  break;
              }

              return updated;
            });

            if (event.type === GeminiEventType.Content) {
            // 详细日志：主智能体内容响应
            const agentPrefix = getAgentPrefix(event);
            logger.agent(`${agentPrefix} 内容响应`, {
              text: event.value.text.substring(0, 100) + (event.value.text.length > 100 ? '...' : ''),
              isComplete: event.value.isComplete,
              textLength: event.value.text.length,
            });
            console.log(`[useAgent] 💬 ${agentPrefix} 内容响应:`, {
              textPreview: event.value.text.substring(0, 50) + (event.value.text.length > 50 ? '...' : ''),
              textLength: event.value.text.length,
              isComplete: event.value.isComplete,
            });

            // 创建或更新模型响应步骤
            if (!currentStepId) {
              currentStepId = `model-${Date.now()}`;
              setSteps((prev) => [
                ...prev,
                {
                  id: currentStepId!,
                  type: StepType.MODEL_RESPONSE,
                  content: event.value.text,
                  timestamp: Date.now(),
                },
              ]);
            } else {
              setSteps((prev) =>
                prev.map((s) =>
                  s.id === currentStepId
                    ? { ...s, content: s.content + event.value.text }
                    : s,
                ),
              );
            }

            // 更新消息
            if (!assistantMessage) {
              assistantMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: event.value.text,
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, assistantMessage!]);
            } else {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last.id === assistantMessage!.id) {
                  return [
                    ...prev.slice(0, -1),
                    { ...last, content: last.content + event.value.text },
                  ];
                }
                return prev;
              });
            }
          } else if (event.type === GeminiEventType.ToolCallRequest) {
            // 在浏览器控制台打印工具调用信息，添加智能体前缀
            const agentPrefix = getAgentPrefix(event);
            const toolName = event.value.toolName;
            const toolArgs = event.value.toolCall.args;
            
            // 详细日志：工具调用请求
            logger.tool(`${agentPrefix} Tool Call Request`, {
              tool: toolName,
              args: toolArgs,
            });
            console.log(`[useAgent] 🔧 ${agentPrefix} 工具调用请求:`, {
              toolName,
              args: toolArgs,
              fullArgs: JSON.stringify(toolArgs, null, 2),
              timestamp: new Date().toISOString(),
            });

            // 添加工具调用步骤 - 使用高精度时间戳确保唯一性
            const now = Date.now();
            const randomId = Math.random().toString(36).substr(2, 9);
            const toolStepId = `tool-${now}-${randomId}`;
            setSteps((prev) => [
              ...prev,
              {
                id: toolStepId,
                type: StepType.TOOL_CALL,
                content: `${agentPrefix} ${JSON.stringify({
                  name: event.value.toolName,
                  args: event.value.toolCall.args,
                })}`,
                metadata: event.value.toolCall,
                timestamp: now,
              },
            ]);

            // 添加工具执行记录 - 使用高精度时间戳确保唯一性
            const executionId = `exec-${now}-${randomId}`;
            const newExecution: ToolExecution = {
              id: executionId,
              toolName: event.value.toolName,
              args: event.value.toolCall.args || {},
              status: 'executing',
              timestamp: now,
            };

            setExecutions((prev) => [...prev, newExecution]);

            // Phase 14: 记录当前执行状态
            setExecutionContext(prev => ({
              ...prev,
              currentExecution: newExecution
            }));
          } else if (event.type === GeminiEventType.ToolCallResponse) {
            // 在浏览器控制台打印工具调用结果
            const agentPrefix = getAgentPrefix(event);
            const toolName = event.value.toolCall.name;
            const toolArgs = event.value.toolCall.args;
            const toolResult = event.value.result;
            
            // 详细日志：工具调用响应
            logger.tool(`${agentPrefix} Tool Call Completed`, {
              tool: toolName,
              args: toolArgs,
              result: toolResult,
            });
            
            // 检查结果中是否有错误
            const resultValue = toolResult as any;
            const structuredResult = resultValue?.result || resultValue;
            const hasError = resultValue?.error || structuredResult?.error;
            const errorMessage = resultValue?.error?.message || structuredResult?.error?.message;
            
            console.log(`[useAgent] ✅ ${agentPrefix} 工具调用完成:`, {
              toolName,
              args: toolArgs,
              hasError,
              errorMessage: errorMessage || null,
              resultPreview: JSON.stringify(structuredResult).substring(0, 200) + (JSON.stringify(structuredResult).length > 200 ? '...' : ''),
              fullResult: structuredResult,
              timestamp: new Date().toISOString(),
            });

            // 工具执行完成后立即重置 loading 状态，避免UI延迟
            resetLoadingState();

            // 添加工具结果步骤
            const resultStepId = `result-${Date.now()}`;
            setSteps((prev) => [
              ...prev,
              {
                id: resultStepId,
                type: StepType.TOOL_RESULT,
                content: `${agentPrefix} ${JSON.stringify(event.value.result)}`,
                timestamp: Date.now(),
              },
            ]);

            // 更新工具执行记录（包含结构化结果）
            setExecutions((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.status === 'executing') {
                // 提取结构化结果（如果存在）
                const resultValue = event.value.result as any;
                const structuredResult = resultValue?.result || resultValue;
                
                // 检查是否有错误
                const hasError = resultValue?.error || structuredResult?.error;
                const executionStatus = hasError ? 'error' : 'success';
                const executionDuration = Date.now() - last.timestamp;
                
                // 详细日志：工具执行状态更新
                console.log(`[useAgent] 📊 工具执行状态更新 [${last.toolName}]:`, {
                  toolName: last.toolName,
                  args: last.args,
                  status: executionStatus,
                  duration: `${executionDuration}ms`,
                  hasError,
                  errorMessage: hasError ? (resultValue?.error?.message || structuredResult?.error?.message) : null,
                  resultPreview: JSON.stringify(structuredResult).substring(0, 200) + (JSON.stringify(structuredResult).length > 200 ? '...' : ''),
                  timestamp: new Date().toISOString(),
                });
                
                // 如果是 write_todos 或 write_todo 工具，更新 todo 列表（仅在成功时）
                if (!hasError && (last.toolName === 'write_todos' || last.toolName === 'write_todo') && structuredResult?.todos) {
                  console.log('[useAgent] 📝 更新 Todo 列表:', {
                    toolName: last.toolName,
                    todosCount: structuredResult.todos.length,
                    todos: structuredResult.todos,
                  });
                  // 确保 todos 格式兼容（content/title 转换）
                  const normalizedTodos = structuredResult.todos.map((todo: any) => ({
                    ...todo,
                    content: todo.content || todo.title, // 兼容两种格式
                    title: todo.title || todo.content, // 同时保留两种字段
                  }));
                  setTodos(normalizedTodos);
                }
                
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    result: structuredResult,
                    status: executionStatus,
                    duration: executionDuration,
                  },
                ];
              }
              return prev;
            });
          } else if (event.type === GeminiEventType.Error) {
            // 出现错误时立即重置加载状态
            resetLoadingState();

            const errorMsg = event.value.error?.message || 'Unknown error';
            const trace = (event as any).traceId || traceId || 'unknown-trace';
            const prompt = (event as any).promptId || promptId || 'unknown-prompt';
            const errorTotalDuration = Date.now() - requestStartTime;

            // 详细日志：错误处理
            logger.agent('[主智能体] 错误处理', {
              error: errorMsg,
              traceId: trace,
              promptId: prompt,
              totalEvents: eventCount,
              totalDuration: errorTotalDuration,
            });
            console.error('[useAgent] ❌ [主智能体] 错误处理:', {
              error: errorMsg,
              errorValue: event.value,
              traceId: trace,
              promptId: prompt,
              totalEvents: eventCount,
              totalDuration: `${errorTotalDuration}ms`,
              timestamp: new Date().toISOString(),
            });

            // 检查是否是 API Key 配置错误
            let friendly = `错误: ${errorMsg}（traceId=${trace}）`;
            if (errorMsg.includes('API Key') || errorMsg.includes('API Key 未配置')) {
              friendly = `🔑 配置错误: 请在项目根目录创建 .env.local 文件，并设置 GEMINI_API_KEY=你的API密钥\n\n详细配置说明请参考 .env.local.example 文件。`;
            }
            const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now().toString(36)}`;
            setSteps((prev) => [
              ...prev,
              {
                id: errorId,
                type: StepType.ERROR,
                content: friendly,
                timestamp: Date.now(),
              },
            ]);
            // 同步在消息流中展示
            setMessages((prev) => [
              ...prev,
              {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                content: friendly,
                timestamp: new Date(),
              },
            ]);
            throw new Error(friendly);
          }
        }

        // API 调用成功埋点
        const requestDuration = Date.now() - requestStart;
        telemetry.recordApiCall(requestDuration, true);

        // 详细日志：请求完成总结
        logger.agent('[主智能体] 请求完成总结', {
          success: true,
          totalDuration: requestDuration,
          totalEvents: eventCount,
          traceId: traceId || 'unknown',
          promptId: promptId || 'unknown',
          executionsCount: executions.length,
        });
        console.log('[useAgent] ✅ [主智能体] 请求完成总结:', {
          success: true,
          totalDuration: `${requestDuration}ms`,
          totalEvents: eventCount,
          traceId: traceId || 'unknown',
          promptId: promptId || 'unknown',
          executionsCount: executions.length,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        const errorEventCount = typeof eventCount === 'number' ? eventCount : 0; // 在错误时捕获事件计数

        // 在错误时使用局部变量，因为 state 更新是异步的
        const errorTraceId = traceId || 'unknown';
        const errorPromptId = promptId || conversationId || 'unknown';

        // API 调用失败埋点
        const requestDuration = requestStart ? Date.now() - requestStart : 0;
        telemetry.recordApiCall(requestDuration, false);

        // 详细日志：请求失败总结
        logger.agent('[主智能体] 请求失败总结', {
          success: false,
          error: errorMessage,
          totalDuration: requestDuration,
          totalEvents: errorEventCount,
          traceId: errorTraceId,
          promptId: errorPromptId,
        });
        console.error('[useAgent] ❌ [主智能体] 请求失败总结:', {
          success: false,
          error: String(errorMessage || 'Unknown error'),
          totalDuration: `${requestDuration}ms`,
          totalEvents: Number(errorEventCount || 0),
          traceId: String(errorTraceId),
          promptId: String(errorPromptId),
          timestamp: new Date().toISOString(),
        });

        // 使用更唯一的 ID，包含随机数和性能计数器
        const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now().toString(36)}`;
        setMessages((prev) => [
          ...prev,
          {
            id: errorId,
            role: 'assistant',
            content: `错误: ${errorMessage}`,
            timestamp: new Date(),
          },
        ]);
        // 使用更唯一的 ID，包含随机数和性能计数器
        const stepErrorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${performance.now().toString(36)}`;
        setSteps((prev) => [
          ...prev,
          {
            id: stepErrorId,
            type: StepType.ERROR,
            content: errorMessage,
            timestamp: Date.now(),
          },
        ]);
      }
    },
    [stream, config],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSteps([]);
    setExecutions([]);
    setLastUserMessage(null);
    setReasoningSteps([]);
    setSafetyStatus('safe');
    setTraceId(null);
    setPromptId(null);

    // Phase 14: 清除执行上下文
    setExecutionContext({
      conversationId: 'default',
      supplementalInputs: []
    });
  }, []);

  const retryLast = useCallback(async () => {
    if (lastUserMessage) {
      await sendMessage(lastUserMessage, promptId || undefined);
    }
  }, [lastUserMessage, promptId, sendMessage]);


  return {
    messages,
    steps,
    executions,
    todos,
    traceId,
    promptId,
    lastUserMessage,
    reasoningSteps,
    safetyStatus,
    sendMessage: handleInput, // Phase 14: 使用handleInput代替sendMessage
    retryLast,
    clearMessages,
    isLoading,
    error,
    executionContext, // Phase 14: 暴露执行上下文
  };
}

