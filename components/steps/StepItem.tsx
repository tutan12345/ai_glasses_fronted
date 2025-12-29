/**
 * StepItem - 执行步骤展示组件
 * 参考: agentos-web/components/StepItem.tsx
 * 改进：更现代的样式和更好的可读性
 */

'use client';

import React from 'react';
import { AgentStep, StepType } from '@/types/agent';

interface StepItemProps {
  step: AgentStep;
  isLast: boolean;
}

export function StepItem({ step, isLast }: StepItemProps) {
  const isTool = step.type === StepType.TOOL_CALL;
  const isResult = step.type === StepType.TOOL_RESULT;
  const isUser = step.type === StepType.USER_INPUT;
  const isModel = step.type === StepType.MODEL_RESPONSE;
  const isThought = step.type === StepType.THOUGHT;
  const isError = step.type === StepType.ERROR;

  let contentObj = null;
  // 尝试解析 JSON（用于工具调用）
  if (isTool || isResult) {
    try {
      contentObj = typeof step.content === 'string' ? JSON.parse(step.content) : step.content;
    } catch (e) {
      contentObj = step.content;
    }
  }

  // 根据步骤类型确定样式
  const getStyles = () => {
    switch (step.type) {
      case StepType.USER_INPUT:
        return {
          dot: 'border-blue-500 bg-blue-500/20 shadow-blue-500/50',
          box: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
          label: '用户输入',
          icon: '👤',
        };
      case StepType.MODEL_RESPONSE:
        return {
          dot: 'border-purple-500 bg-purple-500/20 shadow-purple-500/50',
          box: 'bg-purple-500/10 border-purple-500/30 text-purple-100',
          label: '助手回复',
          icon: '🤖',
        };
      case StepType.TOOL_CALL:
        return {
          dot: 'border-amber-500 bg-amber-500/20 shadow-amber-500/50',
          box: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
          label: '执行工具',
          icon: '⚙️',
        };
      case StepType.TOOL_RESULT:
        return {
          dot: 'border-emerald-500 bg-emerald-500/20 shadow-emerald-500/50',
          box: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100',
          label: '工具结果',
          icon: '✅',
        };
      case StepType.THOUGHT:
        return {
          dot: 'border-gray-500 bg-gray-500/20',
          box: 'bg-gray-800/40 border-gray-700/50 text-gray-400 italic',
          label: '思考中',
          icon: '💭',
        };
      case StepType.ERROR:
        return {
          dot: 'border-red-500 bg-red-500/20 shadow-red-500/50',
          box: 'bg-red-500/10 border-red-500/30 text-red-300',
          label: '错误',
          icon: '❌',
        };
      default:
        return {
          dot: 'border-gray-500',
          box: 'bg-gray-800',
          label: '未知',
          icon: '❓',
        };
    }
  };

  const style = getStyles();

  return (
    <div className={`group relative pl-8 pb-6 ${isLast ? '' : 'border-l-2 border-gray-800'}`}>
      {/* 时间线圆点 */}
      <div className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full border-2 z-10 bg-[#0d1117] transition-all duration-300 ${style.dot}`}></div>

      <div className={`relative flex flex-col gap-2 rounded-lg p-4 text-sm border transition-all duration-300 hover:scale-[1.01] ${style.box}`}>
        {/* 头部 */}
        <div className="flex items-center justify-between text-xs font-bold tracking-wider opacity-80 uppercase mb-1">
          <span className="flex items-center gap-2">
            <span>{style.icon}</span>
            <span>{style.label}</span>
          </span>
          <span className="font-mono opacity-60 text-[10px]">
            {new Date(step.timestamp).toLocaleTimeString([], { 
              hour12: false, 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </span>
        </div>

        {/* 内容 */}
        <div className="leading-relaxed whitespace-pre-wrap break-words">
          {/* 工具调用渲染 */}
          {isTool && contentObj ? (
            <div className="font-mono text-xs">
              <div className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                <span className="text-amber-500/50">❯</span>
                <span className="text-amber-300">{contentObj.name || step.content}</span>
              </div>
              {contentObj.args && Object.keys(contentObj.args).length > 0 && (
                <div className="bg-black/30 p-3 rounded border border-white/5 overflow-x-auto text-amber-200/70">
                  <pre className="text-xs">{JSON.stringify(contentObj.args, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : 
          /* 工具结果渲染 */
          isResult && contentObj ? (
            <div className="font-mono text-xs text-emerald-300/80 bg-black/30 p-3 rounded border border-white/5 overflow-x-auto">
              <span className="opacity-50 select-none mr-2">➜</span>
              <pre className="text-xs">
                {typeof contentObj === 'string' ? contentObj : JSON.stringify(contentObj, null, 2)}
              </pre>
            </div>
          ) : 
          /* 标准文本渲染 */
          (
            <span className={isThought ? "opacity-90 font-mono text-xs" : ""}>
              {step.content}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

