/**
 * ChatInterface - 主聊天界面组件
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
import { motion } from 'framer-motion';

export function ChatInterface() {
  const { messages, steps, executions, todos, traceId, promptId, lastUserMessage, reasoningSteps, safetyStatus, sendMessage, retryLast, clearMessages, isLoading, executionContext } = useAgent();
  const [input, setInput] = useState('');

  const isInputDisabled = isLoading && !executionContext?.currentExecution;

  const getAgentPrefix = (toolName?: string): string => {
    if (toolName) {
      if (toolName.includes('music') || toolName === 'music_player') return '[车载娱乐助手]';
      if (toolName === 'car_control' || toolName === 'light_control' || toolName === 'ac_control') return '[车辆控制中心]';
      if (toolName === 'camera') return '[车内监控系统]';
    }
    return '[智能车机]';
  };

  const [deviceState, setDeviceState] = useState<DeviceState>(initialDeviceState);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    visible: boolean;
    toolCall: any;
    correlationId: string;
  } | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  const messageBus = useMessageBus();

  useEffect(() => {
    executions.forEach((execution) => {
      const toolName = execution.toolName.toLowerCase();
      const result = execution.result;
      const args = execution.args || {};

      const isSuccess = execution.status === 'success' && result;
      const isExecuting = execution.status === 'executing';

      if (!isSuccess && !isExecuting) return;

      if (toolName === 'music' || toolName === 'music_player' || toolName === 'play_music') {
        const action = args.action;
        const isPlaying = isSuccess ? result.isPlaying : action === 'play' ? true : action === 'pause' || action === 'stop' ? false : undefined;
        const currentTrack = isSuccess ? result.currentTrack : args.track;
        const volume = isSuccess ? result.volume : args.volume;

        if (isPlaying !== undefined || volume !== undefined || currentTrack !== undefined) {
          setTimeout(() => {
            setDeviceState((prev) => ({
              ...prev,
              music: {
                ...prev.music,
                isPlaying: isPlaying !== undefined ? isPlaying : prev.music.isPlaying,
                currentTrack: currentTrack !== undefined ? currentTrack : prev.music.currentTrack,
                volume: volume !== undefined ? volume : prev.music.volume,
              },
            }));
          }, 0);
        }
      } else if (toolName === 'car_control') {
        const { action, target, value } = args;
        setTimeout(() => {
          setDeviceState((prev) => {
            const newCar = { ...prev.car };
            if (action === 'door') {
              if (target === 'front_left') newCar.doors.frontLeft = value;
              else if (target === 'front_right') newCar.doors.frontRight = value;
              else if (target === 'rear_left') newCar.doors.rearLeft = value;
              else if (target === 'rear_right') newCar.doors.rearRight = value;
              else if (!target) newCar.doors = { frontLeft: value, frontRight: value, rearLeft: value, rearRight: value };
            } else if (action === 'trunk') newCar.trunk = value;
            else if (action === 'frunk') newCar.frunk = value;
            else if (action === 'sunroof') newCar.sunroof = value;
            else if (action === 'seat') {
              if (target === 'driver') newCar.seats.driver = value;
              else if (target === 'passenger') newCar.seats.passenger = value;
            } else if (action === 'horn') newCar.horn = value;
            return { ...prev, car: newCar };
          });
        }, 0);
      } else if (toolName === 'light_control') {
        const { action, state, color } = args;
        setTimeout(() => {
          setDeviceState(prev => {
            const newLights = { ...prev.car.lights };
            if (action === 'headlight') newLights.headlight = state;
            else if (action === 'hazard') newLights.hazard = state;
            else if (action === 'ambient') {
              newLights.ambient = state;
              if (color) newLights.ambientColor = color;
            }
            return { ...prev, car: { ...prev.car, lights: newLights } };
          });
        }, 0);
      } else if (toolName === 'ac_control') {
        const { state, temperature, fanSpeed } = args;
        setTimeout(() => {
          setDeviceState(prev => ({
            ...prev,
            car: {
              ...prev.car,
              ac: {
                state: state !== undefined ? state : prev.car.ac.state,
                temperature: temperature || prev.car.ac.temperature,
                fanSpeed: fanSpeed || prev.car.ac.fanSpeed,
              }
            }
          }));
        }, 0);
      }
    });
  }, [executions]);

  useEffect(() => {
    const handleToolConfirmationRequest = (message: ToolConfirmationRequest) => {
      setConfirmationDialog({ visible: true, toolCall: message.toolCall, correlationId: message.correlationId });
    };
    messageBus.subscribe(MessageBusType.TOOL_CONFIRMATION_REQUEST, handleToolConfirmationRequest);
    return () => messageBus.unsubscribe(MessageBusType.TOOL_CONFIRMATION_REQUEST, handleToolConfirmationRequest);
  }, [messageBus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (stepsContainerRef.current) stepsContainerRef.current.scrollTop = stepsContainerRef.current.scrollHeight;
  }, [messages, steps]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleConfirmTool = async (correlationId: string) => {
    messageBus.publish({ type: MessageBusType.TOOL_CONFIRMATION_RESPONSE, correlationId, confirmed: true });
    setConfirmationDialog(null);
  };

  const handleCancelTool = async (correlationId: string) => {
    messageBus.publish({ type: MessageBusType.TOOL_CONFIRMATION_RESPONSE, correlationId, confirmed: false });
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
      <div className="w-1/2 flex flex-col border-r border-gray-800 bg-[#0d1117]">
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#161b22]">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h1 className="font-bold text-lg tracking-tight text-gray-200 uppercase">LUMINA-CAR 智能控车</h1>
          </div>
          <div className="flex items-center gap-3">
            {traceId && <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-gray-800 text-xs text-gray-300 border border-gray-700"><span className="font-mono">ID: {traceId}</span></div>}
            <SettingsButton />
            <button onClick={clearMessages} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors">清空</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          <TodoList todos={todos} />
          <ReasoningChainVisualizer steps={reasoningSteps} tools={executions.map(e => ({ id: e.id, toolName: e.toolName, status: e.status === 'error' ? 'failed' : e.status === 'success' ? 'completed' : e.status, timestamp: e.timestamp, duration: e.duration }))} safetyStatus={safetyStatus} traceId={traceId || undefined} promptId={promptId || undefined} />
          <div className="p-6 space-y-6">
            {messages.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">指令历史</div>
                <MessageList messages={messages} />
                <div ref={bottomRef} />
              </motion.div>
            )}
            {steps.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">执行链路 ({steps.length})</div>
                <div ref={stepsContainerRef}>
                  {steps.map((step, index) => (<StepItem key={step.id} step={step} isLast={index === steps.length - 1} />))}
                </div>
              </motion.div>
            )}
            {messages.length === 0 && steps.length === 0 && (<div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50"><div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 12.3"></path><path d="M12 12l9.9 0.3"></path></svg></div><p className="font-mono text-sm uppercase">Waiting for vehicle command...</p></div>)}
          </div>
        </div>

        <div className="p-4 bg-[#0d1117] border-t border-gray-800">
          <InputArea value={input} onChange={setInput} onSend={handleSend} onKeyPress={handleKeyPress} isLoading={isInputDisabled} />
          <div className="mt-2 text-[10px] text-gray-600 text-center font-mono">LUMINA-CAR CONTROL • VOICE AI ACTIVE</div>
        </div>
      </div>
      <div className="w-1/2">
        <DevicePanel deviceState={deviceState} />
      </div>
      {confirmationDialog && (<ConfirmationDialog visible={confirmationDialog.visible} toolCall={confirmationDialog.toolCall} correlationId={correlationId} onConfirm={handleConfirmTool} onCancel={handleCancelTool} />)}
    </div>
  );
}
