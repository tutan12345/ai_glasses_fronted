/**
 * 主页面
 */

'use client';

import { ChatInterface } from '@/components/chat/ChatInterface';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // 在开发模式下，记录页面加载时间
    if (process.env.NODE_ENV === 'development') {
      const loadTime = performance.now();
      console.log(`[Page] Home page loaded at ${new Date().toISOString()}, load time: ${loadTime.toFixed(2)}ms`);
      
      // 监听文件变化（通过检查模块热更新）
      if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
        console.log('[Page] Next.js HMR (Hot Module Replacement) is active');
      }
    }
  }, []);

  return <ChatInterface />;
}
