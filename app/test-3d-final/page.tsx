/**
 * 3D 最终效果测试
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AIGlasses3D = dynamic(
  () => import('@/components/device/AIGlasses3D').then((mod) => mod.AIGlasses3D),
  { ssr: false }
);

export default function Test3DFinalPage() {
  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full h-full">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">模型加载中...</div>}>
          <AIGlasses3D />
        </Suspense>
      </div>
    </div>
  );
}
