/**
 * SettingsDialog - 设置对话框组件
 * 右上角齿轮图标，点击打开设置
 */

'use client';

import { useState, useEffect } from 'react';
import { ConfigStorage, type LLMConfig } from '@/lib/utils/configStorage';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: LLMConfig) => void;
}

export function SettingsDialog({ isOpen, onClose, onSave }: SettingsDialogProps) {
  const [config, setConfig] = useState<LLMConfig>(ConfigStorage.getDefault());

  useEffect(() => {
    if (isOpen) {
      // 打开对话框时加载配置
      const saved = ConfigStorage.load();
      if (saved) {
        setConfig(saved);
      } else {
        setConfig(ConfigStorage.getDefault());
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    ConfigStorage.save(config);
    onSave(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">LLM 配置</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="输入 API Key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              支持 Google Gemini、Kimi、OpenAI 等兼容 OpenAI API 的模型
            </p>
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={config.baseUrl || ''}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="https://api.moonshot.cn/v1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-1">
              支持自定义 Base URL（如 Kimi、OpenAI 等兼容 OpenAI API 的接口）
            </p>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model Name
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={config.modelName}
                onChange={(e) => setConfig({ ...config, modelName: e.target.value })}
                placeholder="kimi-k2-thinking"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, modelName: 'kimi-k2-thinking' })}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  Kimi K2
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, modelName: 'gemini-2.0-flash-exp' })}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  Gemini 2.0
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, modelName: 'gpt-4o' })}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  GPT-4o
                </button>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, modelName: 'claude-3-5-sonnet-20241022' })}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  Claude 3.5
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              输入模型名称，或点击快捷按钮
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!config.apiKey.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

