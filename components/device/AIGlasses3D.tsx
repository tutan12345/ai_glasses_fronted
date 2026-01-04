/**
 * AIGlasses3D - 车辆 3D 渲染组件
 */

'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { CarModel } from './lumina/CarModel';
import type { DeviceState } from '@/types/device';

interface AIGlasses3DProps {
  deviceState: DeviceState;
}

export const AIGlasses3D: React.FC<AIGlasses3DProps> = ({ deviceState }) => {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[4, 2, 4]} fov={45} />
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 15, 10]} intensity={3.0} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={2.0} />
        
        <Suspense fallback={null}>
          <CarModel deviceState={deviceState} scale={0.6} />
          <Environment preset="apartment" background={false} />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={20} blur={2.5} far={1.5} />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={2} 
          maxDistance={8}
          autoRotate={!Object.values(deviceState.car.doors).some(v => v) && !deviceState.car.trunk}
          autoRotateSpeed={0.2}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${deviceState.car.horn ? 'bg-orange-500 animate-ping' : 'bg-gray-500'}`} />
          <span className="text-[10px] font-mono text-gray-400">VEHICLE SYSTEM ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
