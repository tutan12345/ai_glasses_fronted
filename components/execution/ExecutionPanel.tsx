/**
 * ExecutionPanel - 工具执行结果面板
 * 右侧面板，展示工具执行状态和结果
 * 改进：比 agentos-web 更现代、更清晰
 */

'use client';

import React from 'react';
import { ToolExecution } from '@/types/agent';

interface ExecutionPanelProps {
  executions: ToolExecution[];
  isProcessing: boolean;
}

export function ExecutionPanel({ executions, isProcessing }: ExecutionPanelProps) {
  const activeExecution = executions.find(e => e.status === 'executing');
  const recentExecutions = executions.slice(-5).reverse(); // 最近 5 个

  return (
    <div className="h-full flex flex-col bg-[#010409] relative overflow-hidden">
      {/* 背景网格效果 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.2)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* 内容 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 头部 */}
        <div className="h-16 border-b border-gray-800 flex items-center px-6 bg-[#161b22]">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <h2 className="font-bold text-lg tracking-tight text-gray-200">
              执行面板
            </h2>
          </div>
        </div>

        {/* 当前执行状态 */}
        {activeExecution && (
          <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-amber-500/10 to-transparent">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                正在执行
              </span>
            </div>
            <div className="bg-black/30 rounded-lg p-4 border border-amber-500/20">
              <div className="font-mono text-sm text-amber-300 mb-2">
                {activeExecution.toolName}
              </div>
              {activeExecution.args && Object.keys(activeExecution.args).length > 0 && (
                <div className="text-xs text-gray-400 mt-2">
                  <pre className="overflow-x-auto">
                    {JSON.stringify(activeExecution.args, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 执行历史 */}
        <div className="flex-1 overflow-y-auto p-6">
          {recentExecutions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <p className="font-mono text-sm">等待工具执行...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className={`rounded-lg p-4 border transition-all duration-300 ${
                    execution.status === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : execution.status === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : execution.status === 'executing'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-gray-800/40 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {execution.toolName}
                      </span>
                      {execution.status === 'success' && (
                        <span className="text-emerald-400">✓</span>
                      )}
                      {execution.status === 'error' && (
                        <span className="text-red-400">✗</span>
                      )}
                      {execution.status === 'executing' && (
                        <span className="text-amber-400 animate-pulse">⟳</span>
                      )}
                    </div>
                    {execution.duration && (
                      <span className="text-xs text-gray-500 font-mono">
                        {execution.duration}ms
                      </span>
                    )}
                  </div>

                  {execution.args && Object.keys(execution.args).length > 0 && (
                    <div className="bg-black/30 rounded p-2 mb-2 text-xs font-mono text-gray-400">
                      <pre className="overflow-x-auto">
                        {JSON.stringify(execution.args, null, 2)}
                      </pre>
                    </div>
                  )}

                  {execution.result && (
                    <div className="bg-black/30 rounded p-2 text-xs font-mono text-emerald-300/80">
                      <div className="opacity-50 mb-1">结果:</div>
                      <pre className="overflow-x-auto">
                        {typeof execution.result === 'string'
                          ? execution.result
                          : JSON.stringify(execution.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

