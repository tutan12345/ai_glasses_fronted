import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceState } from '@/types/device';

const PARTS = [
  { name: 'EXT', path: '/data/lynkco09/model/Lynkco09_EXT_d.glb' },
  { name: 'INT', path: '/data/lynkco09/model/Lynkco09_INT_d.glb' },
  { name: 'Sunproof', path: '/data/lynkco09/model/Lynkco09_Sunproof_d.glb' },
  { name: 'Trunk', path: '/data/lynkco09/model/Lynkco09_Trunk_d.glb' },
  { name: 'Tires', path: '/data/lynkco09/model/Lynkco09_Tires_d.glb' },
  { name: 'LBDoor', path: '/data/lynkco09/model/Lynkco09_LBDoor_d.glb' },
  { name: 'LFDoor', path: '/data/lynkco09/model/Lynkco09_LFDoor_d.glb' },
  { name: 'RFDoor', path: '/data/lynkco09/model/Lynkco09_RFDoor_d.glb' },
  { name: 'RBDoor', path: '/data/lynkco09/model/Lynkco09_RBDoor_d.glb' }
];

/**
 * 车门与箱盖组件
 */
const AnimatedDoor = ({ name, scene, materials, carState }: any) => {
  const groupRef = useRef<THREE.Group>(null);
  const pivotPos: [number, number, number] = useMemo(() => {
    if (name === 'LFDoor') return [0.78, 0, 0.75];
    if (name === 'RFDoor') return [-0.78, 0, 0.75];
    if (name === 'LBDoor') return [0.77, 0, -0.12];
    if (name === 'RBDoor') return [-0.77, 0, -0.12];
    if (name === 'Trunk') return [0, 1.42, -1.45];
    return [0, 0, 0];
  }, [name]);

  useEffect(() => {
    scene.traverse((c: any) => {
      if (c.isMesh) {
        const n = c.name;
        if (n.includes('01') || n.includes('05') || n.includes('92')) c.material = materials.body;
        else if (n.includes('03') || n.includes('08')) c.material = materials.glass;
        else c.material = materials.blackMat;
      }
    });
  }, [scene, materials]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { doors, trunk } = carState;
    const lerpSpeed = 4 * delta;
    let target = 0;
    let axis: 'x' | 'y' = 'y';

    if (name === 'LFDoor') target = doors.frontLeft ? -0.9 : 0;
    if (name === 'RFDoor') target = doors.frontRight ? 0.9 : 0;
    if (name === 'LBDoor') target = doors.rearLeft ? -1.0 : 0;
    if (name === 'RBDoor') target = doors.rearRight ? 1.0 : 0;
    if (name === 'Trunk') { target = trunk ? 1.4 : 0; axis = 'x'; }

    groupRef.current.rotation[axis] = THREE.MathUtils.lerp(groupRef.current.rotation[axis], target, lerpSpeed);
  });

  return (
    <group position={pivotPos} ref={groupRef}>
      <primitive object={scene} position={pivotPos.map(v => -v)} />
    </group>
  );
};

export const CarModel: React.FC<{ deviceState: DeviceState; scale?: number }> = ({ deviceState, scale = 1 }) => {
  const carGroup = useRef<THREE.Group>(null);
  const { scene: threeScene } = useThree();
  
  // 使用场景的环境贴图（由 Environment 组件提供）
  // 如果没有环境贴图，使用 null，材质仍然可以正常工作
  const cubeMap = useMemo(() => {
    return threeScene.environment || null;
  }, [threeScene.environment]);

  const materials = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: 0xBF0012, roughness: 0.1, metalness: 0.7, envMap: cubeMap, envMapIntensity: 1.5 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0, metalness: 0.5, envMap: cubeMap, transparent: true, opacity: 0.45 }),
    blackMat: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8, metalness: 0.1, envMap: cubeMap }),
    blackGloss: new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.1, metalness: 0.8, envMap: cubeMap })
  }), [cubeMap]);

  const models: any = {};
  PARTS.forEach(p => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    models[p.name] = useGLTF(p.path, '/draco/').scene;
  });

  useFrame((state, delta) => {
    // 鸣笛震动
    if (carGroup.current && deviceState.car.horn) {
      carGroup.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 50) * 0.01;
    }
  });

  return (
    <group ref={carGroup} scale={scale * 1.6} position={[0, -0.5, 0]}>
      <Suspense fallback={null}>
        <primitive object={models['EXT']} onUpdate={(s: any) => s.traverse((c: any) => {
          if (c.isMesh) {
            const n = c.name;
            if (n.includes('EXT_51') || n.includes('EXT_01') || n.includes('EXT_03')) c.material = materials.body;
            else if (n.includes('EXT_06') || n.includes('EXT_07') || n.includes('EXT_34')) c.material = materials.glass;
            else if (n.includes('EXT_11') || n.includes('EXT_21')) c.material = materials.blackGloss;
            else c.material = materials.blackMat;
          }
        })} />
        <primitive object={models['INT']} onUpdate={(s: any) => s.traverse((c: any) => { if (c.isMesh) c.material = materials.blackMat; })} />
        <primitive object={models['Sunproof']} onUpdate={(s: any) => s.traverse((c: any) => { if (c.isMesh) c.material = c.name.includes('01') ? materials.glass : materials.blackMat; })} />
        <primitive object={models['Tires']} onUpdate={(s: any) => s.traverse((c: any) => {
          if (c.isMesh) {
            const n = c.name;
            if (n.includes('Tire_01') || n.includes('Tire_14')) c.material = materials.body;
            else if (n.includes('Tire_10') || n.includes('Tire_11')) c.material = materials.blackGloss;
            else c.material = materials.blackMat;
          }
        })} />
        {['LFDoor', 'RFDoor', 'LBDoor', 'RBDoor', 'Trunk'].map(n => (
          <AnimatedDoor key={n} name={n} scene={models[n]} materials={materials} carState={deviceState.car} />
        ))}
      </Suspense>
      {deviceState.car.lights.headlight && (
        <group position={[0, 0.45, 2.1]}>
          <pointLight distance={10} intensity={20} color="#ffffff" position={[-0.8, 0, 0.5]} />
          <pointLight distance={10} intensity={20} color="#ffffff" position={[0.8, 0, 0.5]} />
        </group>
      )}
    </group>
  );
};
