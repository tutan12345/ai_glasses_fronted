/**
 * 3D 简单测试
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const AIGlassesSVG = dynamic(
  () => import('@/components/device/AIGlassesSVG').then((mod) => mod.AIGlassesSVG),
  { ssr: false }
);

export default function Test3DSimplePage() {
  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl mb-8">2D/SVG 模型备选测试</h1>
      <div className="w-64 h-64">
        <Suspense fallback={<div>加载中...</div>}>
          <AIGlassesSVG />
        </Suspense>
      </div>
    </div>
  );
}
