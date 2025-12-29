/**
 * ReasoningChainVisualizer - 推理链可视化面板
 * 展示 ReAct 推理过程：阶段进度、工具队列、安全状态、traceId
 */

'use client';

import React from 'react';
import { GeminiEventType } from '@/lib/core/types';

interface ReasoningStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp: number;
  duration?: number;
}

interface ToolExecution {
  id: string;
  toolName: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  timestamp: number;
  duration?: number;
}

interface ReasoningChainVisualizerProps {
  steps: ReasoningStep[];
  tools: ToolExecution[];
  safetyStatus: 'safe' | 'warning' | 'error';
  traceId?: string;
  promptId?: string;
  isVisible?: boolean;
}

const REASONING_STEPS = [
  { id: 'intent', name: '意图分析', icon: '🎯' },
  { id: 'clarification', name: '澄清确认', icon: '❓' },
  { id: 'tool_select', name: '工具选择', icon: '🔧' },
  { id: 'safety', name: '安全检查', icon: '🛡️' },
  { id: 'execute', name: '执行工具', icon: '⚡' },
  { id: 'result', name: '结果处理', icon: '📋' },
  { id: 'followup', name: '跟进推理', icon: '🔄' },
];

export function ReasoningChainVisualizer({
  steps,
  tools,
  safetyStatus,
  traceId,
  promptId,
  isVisible = true,
}: ReasoningChainVisualizerProps) {
  if (!isVisible) return null;

  const getStepStatus = (stepId: string) => {
    return steps.find(s => s.id === stepId)?.status || 'pending';
  };

  const getStepDuration = (stepId: string) => {
    return steps.find(s => s.id === stepId)?.duration;
  };

  const getSafetyColor = () => {
    switch (safetyStatus) {
      case 'safe': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/40';
      case 'active': return 'text-blue-400 bg-blue-500/20 border-blue-500/40 animate-pulse';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/40';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="bg-[#010409] border border-gray-800 rounded-lg p-4 space-y-4">
      {/* 头部：traceId 和安全状态 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${getSafetyColor()}`}>
            {safetyStatus === 'safe' ? '安全' : safetyStatus === 'warning' ? '警告' : '危险'}
          </div>
          {traceId && (
            <div className="text-xs text-gray-400 font-mono">
              trace: {traceId.slice(0, 8)}...
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          推理链可视化
        </div>
      </div>

      {/* 推理阶段进度条 */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          推理阶段
        </div>
        <div className="grid grid-cols-4 gap-2">
          {REASONING_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const duration = getStepDuration(step.id);

            return (
              <div
                key={step.id}
                className={`relative p-2 rounded border text-xs transition-all ${getStatusColor(status)}`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span>{step.icon}</span>
                  <span className="font-medium">{step.name}</span>
                </div>
                {duration && (
                  <div className="text-[10px] text-gray-400 font-mono">
                    {duration}ms
                  </div>
                )}

                {/* 连接线 */}
                {index < REASONING_STEPS.length - 1 && (
                  <div className="absolute top-1/2 -right-1 w-2 h-px bg-gray-600"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 工具执行队列 */}
      {tools.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            工具执行队列 ({tools.length})
          </div>
          <div className="space-y-1">
            {tools.slice(-3).map((tool) => (
              <div
                key={tool.id}
                className={`flex items-center justify-between p-2 rounded border text-xs ${getStatusColor(tool.status)}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono">{tool.toolName}</span>
                  {tool.status === 'executing' && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  )}
                  {tool.status === 'completed' && (
                    <span className="text-green-400">✓</span>
                  )}
                  {tool.status === 'failed' && (
                    <span className="text-red-400">✗</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  {tool.duration && (
                    <span className="font-mono">{tool.duration}ms</span>
                  )}
                  <span>{new Date(tool.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {steps.length === 0 && tools.length === 0 && (
        <div className="text-center py-4 text-gray-600 opacity-50">
          <div className="text-xs">等待推理开始...</div>
        </div>
      )}
    </div>
  );
}