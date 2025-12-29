/**
 * AIGlasses3D - AI智能交互眼镜 3D React Three Fiber 组件
 * 基于 React Three Fiber 的精致 3D 眼镜模型
 * 集成 lumina-ai-glasses 的高级材质和发光效果
 */

'use client';

import React, { useState, Suspense, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei';
import type { DeviceState } from '@/types/device';
import { GlassesModel } from './lumina/GlassesModel';
import { Controls } from './lumina/Controls';

// Error Boundary for WebGL errors
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('WebGL Error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('WebGL Context Error Details:', error, errorInfo);

    // 记录 WebGL Context Lost 埋点
    import('@/lib/utils/telemetry').then(({ telemetry }) => {
      telemetry.recordContextLost();
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}


// Fallback UI for WebGL errors
const WebGLErrorFallback = () => (
  <div className="flex items-center justify-center h-full bg-gray-900 rounded-2xl">
    <div className="text-center p-6 max-w-sm">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">3D渲染失败</h3>
      <p className="text-sm text-gray-400 mb-4">
        WebGL上下文丢失或浏览器不支持3D渲染
      </p>
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 尝试刷新页面</p>
        <p>• 检查浏览器兼容性</p>
        <p>• 关闭其他标签页释放内存</p>
      </div>
    </div>
  </div>
);

interface AIGlasses3DProps {
  deviceState: DeviceState;
}

const LoadingFallback = () => (
  <div className="absolute inset-0 flex items-center justify-center text-white bg-black z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-mono tracking-wider">初始化系统...</span>
    </div>
  </div>
);

export function AIGlasses3D({ deviceState }: AIGlasses3DProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-100 via-sky-50 to-white overflow-hidden">
      {/* Error Boundary for WebGL Context Loss */}
      <ErrorBoundary fallback={<WebGLErrorFallback />}>
        {/* 3D Scene */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<LoadingFallback />}>
            <Canvas
              style={{
                width: '100%',
                height: '100%',
                cursor: 'grab',
                touchAction: 'none',
                outline: 'none'
              }}
              dpr={1} // 固定像素比
              shadows={false} // 禁用阴影
            >
              {/* 背景天光 */}
              <color attach="background" args={['#dbeafe']} />

              <PerspectiveCamera makeDefault position={[3, 2, 5]} fov={35} />

              {/* Simple Lighting */}
              <ambientLight intensity={0.35} />
              <directionalLight position={[6, 6, 6]} intensity={1.2} color="#ffffff" />
              <directionalLight position={[-6, 3, 4]} intensity={0.6} color="#88ccff" />

              {/* The Product */}
              <group rotation={[0, -Math.PI / 7, 0]}>
                 <GlassesModel deviceState={deviceState} />
              </group>

              {/* Interaction */}
              <OrbitControls
                enableRotate={true}
                enablePan={false}
                enableZoom={true}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.8}
                minDistance={2.8}
                maxDistance={7}
                autoRotate={false}
                enableDamping={true}
                dampingFactor={0.08}
              />
            </Canvas>
          </Suspense>
        </div>
      </ErrorBoundary>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 pointer-events-none">

        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-slate-900">LUMINA</h1>
                <p className="text-xs text-sky-600 font-mono mt-1">AI智能眼镜 V-02</p>
            </div>
            <div className="text-right hidden sm:block">
                <div className="text-xs text-slate-600 font-mono">电量</div>
                <div className="text-sm font-bold text-emerald-600">{deviceState.battery.level}%</div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <Controls deviceState={deviceState} />

    </div>
  );
}

// 光照设置函数
function setupLights(scene: THREE.Scene): void {
  // 环境光 - 柔和的基础照明
  const ambientLight = new THREE.AmbientLight(0x666666, 0.5);
  scene.add(ambientLight);

  // 主方向光 - 左侧打光，突出眼镜轮廓
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight1.position.set(-3, 3, 5);
  directionalLight1.castShadow = true;
  directionalLight1.shadow.mapSize.width = 2048;
  directionalLight1.shadow.mapSize.height = 2048;
  directionalLight1.shadow.camera.near = 0.5;
  directionalLight1.shadow.camera.far = 50;
  scene.add(directionalLight1);

  // 辅助方向光 - 右侧补充照明
  const directionalLight2 = new THREE.DirectionalLight(0xaaccff, 0.4);
  directionalLight2.position.set(3, -1, 3);
  scene.add(directionalLight2);

  // 点光源 - 眼镜前方重点照明
  const pointLight = new THREE.PointLight(0xffffff, 0.6, 100);
  pointLight.position.set(0, 0, 4);
  scene.add(pointLight);

  // 暖色点光源 - 增加立体感
  const warmPointLight = new THREE.PointLight(0xffddaa, 0.3, 50);
  warmPointLight.position.set(2, 2, 2);
  scene.add(warmPointLight);
}