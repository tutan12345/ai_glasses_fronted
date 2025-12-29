/**
 * ChatInterface - 主聊天界面组件
 * 左右分栏布局：
 * - 左侧：对话框和执行步骤序列
 * - 右侧：工具执行结果面板
 * 参考: agentos-web/App.tsx，但做得更好
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useAgent } from '@/hooks/useAgent';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { SettingsButton } from '../settings/SettingsButton';
import { StepItem } from '../steps/StepItem';
import { DevicePanel } from '../device/DevicePanel';
import { TodoList } from '../task/TodoList';
import { ReasoningChainVisualizer } from './ReasoningChainVisualizer';
import { initialDeviceState, type DeviceState } from '@/types/device';
import { useMessageBus } from '@/contexts/MessageBusContext';
import { MessageBusType, type ToolConfirmationRequest } from '@/lib/confirmation-bus/types';
import { ConfirmationDialog } from '../confirmation/ConfirmationDialog';
import { logger } from '@/lib/utils/logger';

export function ChatInterface() {
  const { messages, steps, executions, todos, traceId, promptId, lastUserMessage, reasoningSteps, safetyStatus, sendMessage, retryLast, clearMessages, isLoading, executionContext } = useAgent();
  const [input, setInput] = useState('');

  // Phase 14: 在有当前执行任务时仍然允许输入（补充对话）
  const isInputDisabled = isLoading && !executionContext?.currentExecution;

  // 生成智能体前缀的辅助函数（支持子智能体扩展）
  const getAgentPrefix = (toolName?: string): string => {
    // 根据工具名称推断可能的子智能体
    if (toolName) {
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
  const [deviceState, setDeviceState] = useState<DeviceState>(initialDeviceState);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    visible: boolean;
    toolCall: any;
    correlationId: string;
  } | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  // 获取MessageBus实例
  const messageBus = useMessageBus();

  // 根据工具执行更新设备状态
  useEffect(() => {
    executions.forEach((execution) => {
      const toolName = execution.toolName.toLowerCase();
      const result = execution.result;
      const args = execution.args || {};

      // 仅在 success 时使用返回的 result；在 executing 时用 args 做乐观更新
      const isSuccess = execution.status === 'success' && result;
      const isExecuting = execution.status === 'executing';

      if (!isSuccess && !isExecuting) return;

      const agentPrefix = getAgentPrefix(toolName);
      logger.ui(`${agentPrefix} Updating device state`, { toolName, result, args, status: execution.status });

      if (toolName === 'music_player') {
        // 乐观：执行中根据 action 预置播放/暂停/停止
        const action = args.action;
        const isPlaying = isSuccess
          ? result.isPlaying
          : action === 'play'
            ? true
            : action === 'pause' || action === 'stop'
              ? false
              : undefined;
        const currentTrack = isSuccess ? result.currentTrack : args.track;
        const volume = isSuccess ? result.volume : args.volume;

        if (isPlaying !== undefined || volume !== undefined || currentTrack !== undefined) {
          // 使用异步更新避免阻塞UI
          setTimeout(() => {
          setDeviceState((prev) => ({
            ...prev,
            music: {
              isPlaying: isPlaying !== undefined ? isPlaying : prev.music.isPlaying,
              currentTrack: currentTrack !== undefined ? currentTrack : prev.music.currentTrack,
              volume: volume !== undefined ? volume : prev.music.volume,
              progress: prev.music.progress,
            },
          }));
          }, 0);
        }
      } else if (toolName === 'camera') {
        const active = isSuccess ? result.active : args.action === 'start_recording' ? true : args.action === 'stop_recording' ? false : undefined;
        const recording = isSuccess ? result.recording : args.action === 'start_recording' ? true : args.action === 'stop_recording' ? false : undefined;
        const lastPhoto = isSuccess ? result.lastPhoto : undefined;
        if (active !== undefined || recording !== undefined || lastPhoto !== undefined) {
          setDeviceState((prev) => ({
            ...prev,
            camera: {
              active: active !== undefined ? active : prev.camera.active,
              lastPhoto: lastPhoto !== undefined ? lastPhoto : prev.camera.lastPhoto,
              recording: recording !== undefined ? recording : prev.camera.recording,
            },
          }));
        }
      } else if (toolName === 'flashlight') {
        const state = isSuccess ? result.state : args.state;
        if (state !== undefined) {
          setDeviceState((prev) => ({
            ...prev,
            flashlight: state,
          }));
        }
      } else if (toolName === 'voice') {
        const listening = isSuccess ? result.listening : args.listening;
        const speaking = isSuccess ? result.speaking : args.speaking;
        const volume = isSuccess ? result.volume : args.volume;
        if (listening !== undefined || speaking !== undefined || volume !== undefined) {
          setDeviceState((prev) => ({
            ...prev,
            voice: {
              listening: listening !== undefined ? listening : prev.voice.listening,
              speaking: speaking !== undefined ? speaking : prev.voice.speaking,
              volume: volume !== undefined ? volume : prev.voice.volume,
            },
          }));
          console.log('[ChatInterface] Voice state updated:', {
            listening,
            speaking,
            volume,
          });
        }
      } else if (toolName === 'navigation') {
        const active = isSuccess ? result.active : args.active;
        const destination = isSuccess ? result.destination : args.destination;
        const distance = isSuccess ? result.distance : args.distance;
        const eta = isSuccess ? result.eta : args.eta;
        if (active !== undefined || destination !== undefined || distance !== undefined || eta !== undefined) {
          setDeviceState((prev) => ({
            ...prev,
            navigation: {
              active: active !== undefined ? active : prev.navigation.active,
              destination: destination !== undefined ? destination : prev.navigation.destination,
              distance: distance !== undefined ? distance : prev.navigation.distance,
              eta: eta !== undefined ? eta : prev.navigation.eta,
            },
          }));
        }
      }
    });
  }, [executions]);

  // MessageBus 订阅 - 处理工具确认请求
  useEffect(() => {
    const handleToolConfirmationRequest = (message: ToolConfirmationRequest) => {
          logger.ui('收到工具确认请求', { toolName: message.toolCall.name });
      setConfirmationDialog({
        visible: true,
        toolCall: message.toolCall,
        correlationId: message.correlationId,
      });
    };

    messageBus.subscribe(
      MessageBusType.TOOL_CONFIRMATION_REQUEST,
      handleToolConfirmationRequest
    );

    return () => {
      messageBus.unsubscribe(
        MessageBusType.TOOL_CONFIRMATION_REQUEST,
        handleToolConfirmationRequest
      );
    };
  }, [messageBus]);

  // 自动滚动
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (stepsContainerRef.current) {
      stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
    }
  }, [messages, steps]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  // 工具确认处理函数
  const handleConfirmTool = async (correlationId: string) => {
    logger.ui('用户确认工具调用', { correlationId });
    messageBus.publish({
      type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
      correlationId,
      confirmed: true,
    });
    setConfirmationDialog(null);
  };

  const handleCancelTool = async (correlationId: string) => {
    logger.ui('用户取消工具调用', { correlationId });
    messageBus.publish({
      type: MessageBusType.TOOL_CONFIRMATION_RESPONSE,
      correlationId,
      confirmed: false,
    });
    setConfirmationDialog(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-white font-sans overflow-hidden">
      {/* 左侧面板：对话框和执行步骤 */}
      <div className="w-1/2 flex flex-col border-r border-gray-800 bg-[#0d1117]">
        {/* 头部 */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#161b22]">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h1 className="font-bold text-lg tracking-tight text-gray-200">
              个人助理
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {traceId && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-800 text-xs text-gray-300 border border-gray-700">
                <span className="font-mono">traceId: {traceId}</span>
                {promptId && <span className="font-mono text-gray-500">/ {promptId}</span>}
              </div>
            )}
            {lastUserMessage && lastUserMessage.trim() && (
              <button
                onClick={retryLast}
                className="px-3 py-1.5 text-xs text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              >
                重试上条
              </button>
            )}
            <SettingsButton />
            <button
              onClick={clearMessages}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
            >
              清空
            </button>
          </div>
        </div>

        {/* 内容区域：对话和执行步骤合并显示 */}
        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          
          {/* 任务规划清单 - 放在顶部 */}
          <TodoList todos={todos} />

          {/* 推理链可视化 */}
          <ReasoningChainVisualizer
            steps={reasoningSteps}
            tools={executions.map(e => ({
              id: e.id,
              toolName: e.toolName,
              status: e.status === 'error' ? 'failed' : e.status === 'success' ? 'completed' : e.status,
              timestamp: e.timestamp,
              duration: e.duration,
            }))}
            safetyStatus={safetyStatus}
            traceId={traceId || undefined}
            promptId={promptId || undefined}
          />

          <div className="p-6 space-y-6">
            {/* 对话消息 */}
            {messages.length > 0 && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  对话
                </div>
                <MessageList messages={messages} />
                <div ref={bottomRef} />
              </div>
            )}

            {/* 执行步骤 */}
            {steps.length > 0 && (
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  执行步骤 ({steps.length})
                </div>
                <div ref={stepsContainerRef}>
                  {steps.map((step, index) => (
                    <StepItem
                      key={step.id}
                      step={step}
                      isLast={index === steps.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 空状态 */}
            {messages.length === 0 && steps.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <p className="font-mono text-sm">开始对话...</p>
              </div>
            )}

            {/* 加载指示 */}
            {isLoading && (
              <div className="pl-8 py-4 opacity-50 flex gap-2 items-center text-xs font-mono text-gray-400">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-4 bg-[#0d1117] border-t border-gray-800">
          <InputArea
            value={input}
            onChange={setInput}
            onSend={handleSend}
            onKeyPress={handleKeyPress}
            isLoading={isInputDisabled}
          />
          <div className="mt-2 text-[10px] text-gray-600 text-center font-mono">
            Gemini 2.0 Flash • ReAct Loop Active
          </div>
        </div>
      </div>

      {/* 右侧面板：AI智能交互眼镜虚拟界面 */}
      <div className="w-1/2">
        <DevicePanel deviceState={deviceState} />
      </div>

      {/* 工具确认对话框 */}
      {confirmationDialog && (
        <ConfirmationDialog
          visible={confirmationDialog.visible}
          toolCall={confirmationDialog.toolCall}
          correlationId={confirmationDialog.correlationId}
          onConfirm={handleConfirmTool}
          onCancel={handleCancelTool}
        />
      )}
    </div>
  );
}
