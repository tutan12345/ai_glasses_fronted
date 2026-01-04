/**
 * 3D 测试页面
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AIGlasses3D = dynamic(
  () => import('@/components/device/AIGlasses3D').then((mod) => mod.AIGlasses3D),
  { ssr: false }
);

export default function Test3DPage() {
  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-white text-2xl mb-8">3D 模型测试</h1>
      <div className="w-full max-w-4xl h-[600px] bg-black rounded-xl overflow-hidden shadow-2xl">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">加载 3D 模型中...</div>}>
          <AIGlasses3D />
        </Suspense>
      </div>
    </div>
  );
}
