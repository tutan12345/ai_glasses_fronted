/**
 * SettingsButton - 设置按钮（右上角齿轮图标）
 */

'use client';

import { useState } from 'react';
import { SettingsDialog } from './SettingsDialog';
import type { LLMConfig } from '@/lib/utils/configStorage';

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (config: LLMConfig) => {
    // 配置已保存到 LocalStorage，这里可以触发页面刷新或通知
    console.log('Config saved:', config);
    // 可以触发事件通知其他组件配置已更新
    window.dispatchEvent(new CustomEvent('llmConfigUpdated', { detail: config }));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="设置"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <SettingsDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onSave={handleSave} />
    </>
  );
}

