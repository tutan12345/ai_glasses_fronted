import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Extrude, Cylinder, RoundedBox, Torus, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { DeviceState } from '@/types/device';
import { AI_STATES, AIMode } from './constants';
import { mapDeviceStateToAIMode, getActiveComponents } from './deviceStateMapper';

interface GlassesProps {
  deviceState: DeviceState;
  scale?: number;
}

export const GlassesModel: React.FC<GlassesProps> = ({ deviceState, scale = 1 }) => {
  const group = useRef<THREE.Group>(null);

  // 根据设备状态确定AI模式
  const aiMode = useMemo(() => mapDeviceStateToAIMode(deviceState), [deviceState]);
  const activeComponents = useMemo(() => getActiveComponents(deviceState), [deviceState]);
  const stateConfig = AI_STATES[aiMode];

  // 动态颜色
  const targetColor = useMemo(() => new THREE.Color(stateConfig.color), [stateConfig.color]);
  const pulseRef = useRef(0);

  // --- Materials ---

  // 根据AI模式动态生成材质颜色
  const getFrameColor = () => {
    switch (aiMode) {
      case 'listening': return '#3b82f6'; // 蓝色
      case 'processing': return '#a855f7'; // 紫色
      case 'camera': return '#ef4444'; // 红色
      case 'navigation': return '#22c55e'; // 绿色
      case 'warning': return '#f97316'; // 橙色
      default: return '#1a1c1f'; // 默认黑色
    }
  };

  // 使用动态颜色的高对比材质组合
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: getFrameColor(),
    roughness: 0.25,
    metalness: 0.9,
    envMapIntensity: 1.2
  }), [aiMode]);

  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: aiMode === 'idle' ? '#d9e2ec' : getFrameColor(),
    roughness: 0.15,
    metalness: 1.0,
    envMapIntensity: 1.5
  }), [aiMode]);

  const lensMaterial = useMemo(() => {
    // 计算镜片颜色：基础颜色和白色的插值
    const baseColor = aiMode === 'idle' ? '#e6f3ff' : getFrameColor();
    const lensColor = aiMode === 'idle'
      ? baseColor
      : new THREE.Color(baseColor).lerp(new THREE.Color('#ffffff'), 0.4);

    const material = new THREE.MeshStandardMaterial({
      color: lensColor,
      transparent: true,
      opacity: 0.7, // 始终透明
      roughness: 0.02,
      metalness: 0.1,
      envMapIntensity: 1.0
    });
    // 强制透明设置
    material.transparent = true;
    material.opacity = 0.7;
    material.needsUpdate = true;
    return material;
  }, [aiMode]);

  const rubberMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#2c2f33',
    roughness: 0.85,
    metalness: 0.05,
  }), []);

  // --- Animation Loop ---
  useFrame((state, delta) => {
    pulseRef.current += delta * 3;
    const sineWave = (Math.sin(pulseRef.current) + 1) / 2;

    // 动态发光强度逻辑
    const baseIntensity = stateConfig.emissionIntensity;
    const intensity = aiMode === 'idle'
      ? baseIntensity
      : baseIntensity + (sineWave * 1.5);

    if (group.current) {
      group.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.isLight) {
          const mat = child.material;

          // 安全检查：仅在材质支持的情况下尝试lerp
          if (mat && 'emissive' in mat) {
            const standardMat = mat as THREE.MeshStandardMaterial;
            standardMat.emissive.lerp(targetColor, 0.15);
            standardMat.emissiveIntensity = THREE.MathUtils.lerp(standardMat.emissiveIntensity, intensity, 0.1);
          }
        }
      });
    }
  });

  // --- Geometry Generation ---

  const { rimShape, lensShape } = useMemo(() => {
    // 使用贝塞尔曲线生成"Wayfarer"风格形状
    const createPath = (offset = 0) => {
      const s = new THREE.Shape();
      const w = 1.6 - offset;
      const h = 1.3 - offset;

      // 顶部左侧开始
      s.moveTo(-w/2, h/2 - 0.2);

      // 顶部拱形
      s.bezierCurveTo(
          -w/4, h/2 + 0.1,
           w/4, h/2 + 0.1,
           w/2, h/2 - 0.1
      );

      // 顶部右侧拐角
      s.quadraticCurveTo(w/2 + 0.2, h/2 - 0.2, w/2 + 0.1, h/2 - 0.5);

      // 右侧和底部右侧曲线
      s.bezierCurveTo(
          w/2, -h/2 + 0.3,
          w/2 - 0.2, -h/2,
          w/4, -h/2
      );

      // 底部边缘
      s.lineTo(-w/4, -h/2);

      // 底部左侧曲线
      s.bezierCurveTo(
          -w/2 + 0.2, -h/2,
          -w/2 - 0.1, -h/2 + 0.3,
          -w/2 - 0.1, 0
      );

      // 闭合到顶部左侧
      s.lineTo(-w/2, h/2 - 0.2);

      return s;
    };

    const outerShape = createPath(0);
    const innerHole = new THREE.Path(createPath(0.15).getPoints()); // 细镜框
    outerShape.holes.push(innerHole);

    const lens = createPath(0.12); // 比孔稍小以适合镜槽内

    return { rimShape: outerShape, lensShape: lens };
  }, []);

  const extrudeSettings = {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 32 // 平滑曲线
  };

  const lensExtrudeSettings = {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 3
  };

  return (
    <group ref={group} scale={scale} dispose={null}>

      {/* --- LEFT SIDE --- */}
      <group position={[-0.95, 0, 0]}>
        {/* Rim with Glow Border */}
        <Extrude args={[rimShape, extrudeSettings]} position={[0, 0, 0]}>
          <primitive object={frameMaterial} />
        </Extrude>
        {/* Rim Glow Border */}
        <Extrude args={[rimShape, { ...extrudeSettings, depth: 0.02 }]} position={[0, 0, 0.01]}>
          <meshStandardMaterial
            color={getFrameColor()}
            emissive={getFrameColor()}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </Extrude>
        {/* Lens */}
        <Extrude args={[lensShape, lensExtrudeSettings]} position={[0, 0, 0.05]}>
          <primitive object={lensMaterial} />
        </Extrude>

        {/* Proximity Sensor (Top Inner) */}
        <Cylinder args={[0.02, 0.02, 0.03, 8]} position={[-0.3, 0.35, 0.08]} userData={{ isLight: activeComponents.camera }}>
          <meshStandardMaterial
            color="#000"
            emissive={activeComponents.camera ? "#ff4444" : "#000"}
            emissiveIntensity={activeComponents.camera ? 1.5 : 0}
          />
        </Cylinder>

        {/* Hinge detail */}
        <RoundedBox args={[0.18, 0.12, 0.08]} position={[-0.9, 0.4, -0.05]} radius={0.02}>
          <primitive object={metalMaterial} />
        </RoundedBox>

        {/* Left Temple Connection LED with decorative ring */}
        <Cylinder args={[0.015, 0.015, 0.02, 6]} position={[-0.75, 0.35, -0.02]} userData={{ isLight: activeComponents.bluetooth }}>
          <meshStandardMaterial
            color="#000"
            emissive={activeComponents.bluetooth ? "#0088ff" : "#000"}
            emissiveIntensity={activeComponents.bluetooth ? 1 : 0}
          />
        </Cylinder>
        {/* Decorative ring around LED */}
        <Torus args={[0.02, 0.005, 8, 16]} position={[-0.75, 0.35, -0.01]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial
            color={getFrameColor()}
            emissive={activeComponents.bluetooth ? "#0088ff" : getFrameColor()}
            emissiveIntensity={activeComponents.bluetooth ? 0.5 : 0.2}
            transparent
            opacity={0.8}
          />
        </Torus>
      </group>

      {/* --- RIGHT SIDE --- */}
      <group position={[0.95, 0, 0]}>
        {/* Rim with Glow Border */}
        <Extrude args={[rimShape, extrudeSettings]} position={[0, 0, 0]}>
          <primitive object={frameMaterial} />
        </Extrude>
        {/* Rim Glow Border */}
        <Extrude args={[rimShape, { ...extrudeSettings, depth: 0.02 }]} position={[0, 0, 0.01]}>
          <meshStandardMaterial
            color={getFrameColor()}
            emissive={getFrameColor()}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </Extrude>
        {/* Lens */}
        <Extrude args={[lensShape, lensExtrudeSettings]} position={[0, 0, 0.05]}>
          <meshStandardMaterial
            color={aiMode === 'idle' ? '#e6f3ff' : new THREE.Color(getFrameColor()).lerp(new THREE.Color('#ffffff'), 0.4)}
            transparent={true}
            opacity={0.7}
            roughness={0.02}
            metalness={0.1}
            envMapIntensity={1.0}
          />
        </Extrude>

        {/* Advanced Camera System (Top Corner) */}
        <group position={[0.85, 0.5, 0.12]} rotation={[0, -0.1, 0]}>
             {/* Camera Housing - Premium Design */}
             <Cylinder args={[0.09, 0.11, 0.12]} rotation={[Math.PI/2, 0, 0]}>
                 <primitive object={frameMaterial} />
             </Cylinder>
             {/* Primary Camera Lens */}
             <Cylinder args={[0.05, 0.05, 0.06]} rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.07]}>
                 <meshStandardMaterial color="#000" roughness={0.1} metalness={0.9} />
             </Cylinder>
             {/* IR Sensor */}
             <Cylinder args={[0.02, 0.02, 0.03, 8]} position={[0.03, -0.02, 0.08]} userData={{ isLight: activeComponents.camera }}>
                <meshStandardMaterial color="#000" emissive={activeComponents.camera ? "#ff0000" : "#000"} emissiveIntensity={activeComponents.camera ? 1.2 : 0} />
             </Cylinder>
             {/* Status Indicator Ring */}
             <Torus args={[0.07, 0.01, 16, 32]} rotation={[0, 0, 0]} position={[0, 0, 0.07]} userData={{ isLight: activeComponents.camera }}>
                <meshStandardMaterial color="#0a0a0a" emissive={activeComponents.camera ? stateConfig.color : "#000"} emissiveIntensity={activeComponents.camera ? 1.8 : 0} />
             </Torus>
        </group>

        {/* Micro LED Display Indicator (Bottom Inner) */}
        <Cylinder args={[0.025, 0.025, 0.02, 8]} position={[0.4, -0.25, 0.08]} userData={{ isLight: activeComponents.lock }}>
          <meshStandardMaterial
            color="#000"
            emissive={activeComponents.lock ? "#00ff88" : "#000"}
            emissiveIntensity={activeComponents.lock ? 1.8 : 0}
          />
        </Cylinder>

        {/* Hinge detail */}
        <RoundedBox args={[0.18, 0.12, 0.08]} position={[0.9, 0.4, -0.05]} radius={0.02}>
           <primitive object={metalMaterial} />
        </RoundedBox>

        {/* Battery Status LED */}
        <Cylinder args={[0.02, 0.02, 0.015, 6]} position={[0.65, 0.45, -0.02]} userData={{ isLight: activeComponents.energy }}>
          <meshStandardMaterial
            color="#000"
            emissive={activeComponents.energy ? (deviceState.energy.level > 20 ? "#00ff00" : "#ff0000") : "#000"}
            emissiveIntensity={activeComponents.energy ? 1.5 : 0}
          />
        </Cylinder>

        {/* Right Temple Status Indicator */}
        <Cylinder args={[0.015, 0.015, 0.02, 6]} position={[0.75, 0.35, -0.02]} userData={{ isLight: activeComponents.ac }}>
          <meshStandardMaterial
            color="#000"
            emissive={activeComponents.ac ? "#ffd700" : "#000"}
            emissiveIntensity={activeComponents.ac ? 1 : 0}
          />
        </Cylinder>
        {/* Decorative ring around status indicator */}
        <Torus args={[0.02, 0.005, 8, 16]} position={[0.75, 0.35, -0.01]} rotation={[Math.PI/2, 0, 0]}>
          <meshStandardMaterial
            color={getFrameColor()}
            emissive={activeComponents.ac ? "#ffd700" : getFrameColor()}
            emissiveIntensity={activeComponents.ac ? 0.5 : 0.2}
            transparent
            opacity={0.8}
          />
        </Torus>
      </group>

      {/* --- BRIDGE --- */}
      {/* Premium curved bridge with integrated sensors */}
      <group position={[0, 0.25, 0.05]}>
         {/* Main Bridge Bar */}
         <RoundedBox args={[1.0, 0.08, 0.12]} radius={0.04}>
            <meshStandardMaterial
              color={aiMode === 'idle' ? '#1a1c1f' : getFrameColor()}
              emissive={aiMode === 'idle' ? '#000000' : getFrameColor()}
              emissiveIntensity={aiMode === 'idle' ? 0 : 0.4}
              roughness={0.2}
              metalness={0.95}
              envMapIntensity={1.4}
            />
         </RoundedBox>

         {/* Bridge Center Detail */}
         <RoundedBox args={[0.15, 0.12, 0.08]} position={[0, 0.02, 0.03]} radius={0.03}>
            <meshStandardMaterial
              color={aiMode === 'idle' ? '#d9e2ec' : new THREE.Color(getFrameColor()).lerp(new THREE.Color('#ffffff'), 0.2)}
              roughness={0.1}
              metalness={1.0}
              envMapIntensity={1.6}
            />
         </RoundedBox>

         {/* Third Microphone - Center bridge back */}
         <Cylinder args={[0.012, 0.012, 0.008, 16]} position={[0, 0.08, -0.08]} rotation={[0, Math.PI, 0]}>
            <meshStandardMaterial
              color="#facc15" // Yellow color
              emissive={activeComponents.microphone ? "#fbbf24" : "#facc15"}
              emissiveIntensity={activeComponents.microphone ? 0.8 : 0.3}
              roughness={0.2}
              metalness={0.3}
            />
         </Cylinder>

         {/* Integrated Bridge Sensors */}
         <Cylinder args={[0.015, 0.015, 0.02, 6]} position={[0, 0.08, 0.08]} userData={{ isLight: activeComponents.navigation }}>
           <meshStandardMaterial
             color="#000"
             emissive={activeComponents.navigation ? "#00ffff" : "#000"}
             emissiveIntensity={activeComponents.navigation ? 1.3 : 0}
           />
         </Cylinder>

         {/* Premium Nose pads with adjustable design */}
         <group position={[0, -0.22, -0.18]}>
            <RoundedBox args={[0.06, 0.32, 0.18]} position={[-0.32, 0, 0]} rotation={[0, 0.6, 0.25]} radius={0.03}>
                 <meshStandardMaterial
                   color={aiMode === 'idle' ? '#2c2f33' : new THREE.Color(getFrameColor()).multiplyScalar(0.6)}
                   roughness={0.9}
                   metalness={0.1}
                 />
            </RoundedBox>
            <RoundedBox args={[0.06, 0.32, 0.18]} position={[0.32, 0, 0]} rotation={[0, -0.6, -0.25]} radius={0.03}>
                 <meshStandardMaterial
                   color={aiMode === 'idle' ? '#2c2f33' : new THREE.Color(getFrameColor()).multiplyScalar(0.6)}
                   roughness={0.9}
                   metalness={0.1}
                 />
            </RoundedBox>

            {/* Nose pad adjustment mechanism */}
            <Cylinder args={[0.01, 0.01, 0.03, 4]} position={[-0.32, 0.15, 0.05]}>
              <primitive object={metalMaterial} />
            </Cylinder>
            <Cylinder args={[0.01, 0.01, 0.03, 4]} position={[0.32, 0.15, 0.05]}>
              <primitive object={metalMaterial} />
            </Cylinder>
         </group>
      </group>


      {/* --- TEMPLES (ARMS) --- */}

      {/* Left Temple - Audio & Connectivity Side */}
      <group position={[-1.75, 0.4, -0.1]} rotation={[0, 0, -0.05]}>
         {/* Main Arm Shape with ergonomic curve */}
         <mesh position={[-0.1, -0.1, -1.8]}>
            <boxGeometry args={[0.16, 0.32, 3.6]} />
            <meshStandardMaterial
              color={aiMode === 'idle' ? '#1a1c1f' : getFrameColor()}
              emissive={aiMode === 'idle' ? '#000000' : getFrameColor()}
              emissiveIntensity={aiMode === 'idle' ? 0 : 0.2}
              roughness={0.25}
              metalness={0.9}
              envMapIntensity={1.2}
            />
         </mesh>

         {/* Microphone Hole - Yellow circular opening */}
         <Cylinder args={[0.015, 0.015, 0.01, 16]} position={[-0.08, 0.08, -0.8]}>
            <meshStandardMaterial
              color="#facc15" // Yellow color
              emissive={activeComponents.microphone ? "#fbbf24" : "#facc15"}
              emissiveIntensity={activeComponents.microphone ? 0.8 : 0.3}
              roughness={0.2}
              metalness={0.3}
            />
         </Cylinder>

         {/* Speaker Grill - Bottom of temple */}
         <group position={[-0.08, -0.25, -2.0]}>
            {/* Speaker housing */}
            <RoundedBox args={[0.28, 0.10, 0.18]} radius={0.02}>
               <meshStandardMaterial
                 color="#6b7280"
                 roughness={0.3}
                 metalness={0.7}
                 envMapIntensity={1.0}
               />
            </RoundedBox>
            {/* Speaker grill mesh */}
            {Array.from({ length: 8 }, (_, i) => (
               <RoundedBox
                 key={i}
                 args={[0.22, 0.008, 0.012]}
                 position={[
                   (i % 4 - 1.5) * 0.05,
                   Math.floor(i / 4) * 0.025 - 0.02,
                   0.09
                 ]}
                 radius={0.001}
               >
                 <meshStandardMaterial
                   color="#4b5563"
                   roughness={0.3}
                   metalness={0.9}
                   envMapIntensity={1.2}
                 />
               </RoundedBox>
            ))}
         </group>

         {/* Ear Hook with Comfort Padding */}
         <group position={[-0.1, -0.65, -3.8]}>
             <mesh rotation={[Math.PI/4, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.10, 1.0, 8]} /> {/* 减少顶点数 */}
                <meshStandardMaterial
                  color={aiMode === 'idle' ? '#2c2f33' : new THREE.Color(getFrameColor()).multiplyScalar(0.7)}
                  roughness={0.85}
                  metalness={0.05}
                />
             </mesh>
         </group>
      </group>

      {/* Right Temple - Smart Control & Power Side */}
      <group position={[1.75, 0.4, -0.1]} rotation={[0, 0, 0.05]}>
         {/* Main Arm with Premium Build */}
         <group position={[0.1, -0.1, -1.8]}>
             <RoundedBox args={[0.20, 0.38, 3.6]} radius={0.06}>
                <meshStandardMaterial
                  color={aiMode === 'idle' ? '#1a1c1f' : getFrameColor()}
                  emissive={aiMode === 'idle' ? '#000000' : getFrameColor()}
                  emissiveIntensity={aiMode === 'idle' ? 0 : 0.2}
                  roughness={0.25}
                  metalness={0.9}
                  envMapIntensity={1.2}
                />
             </RoundedBox>

             {/* Microphone Hole - Yellow circular opening */}
             <Cylinder args={[0.015, 0.015, 0.01, 16]} position={[0.1, 0.08, -0.5]}>
                <meshStandardMaterial
                  color="#facc15" // Yellow color
                  emissive={activeComponents.microphone ? "#fbbf24" : "#facc15"}
                  emissiveIntensity={activeComponents.microphone ? 0.8 : 0.3}
                  roughness={0.2}
                  metalness={0.3}
                />
             </Cylinder>

             {/* Speaker Status Indicator */}
             <Cylinder args={[0.02, 0.02, 0.03, 6]} position={[0.1, 0.08, -1.0]} userData={{ isLight: activeComponents.speaker }}>
                <meshStandardMaterial
                  color="#000"
                  emissive={activeComponents.speaker ? "#00ff88" : "#000"}
                  emissiveIntensity={activeComponents.speaker ? 1.2 : 0}
                />
             </Cylinder>

             <Cylinder args={[0.02, 0.02, 0.03, 6]} position={[0.1, 0.08, -1.0]} userData={{ isLight: activeComponents.navigation }}>
                <meshStandardMaterial
                  color="#000"
                  emissive={activeComponents.navigation ? "#ff0088" : "#000"}
                  emissiveIntensity={activeComponents.navigation ? 1.2 : 0}
                />
             </Cylinder>

             {/* Battery Level Indicator */}
             <Cylinder args={[0.022, 0.022, 0.012, 8]} position={[0.1, -0.15, -0.5]} userData={{ isLight: activeComponents.energy }}>
                <meshStandardMaterial
                  color="#000"
                  emissive={activeComponents.energy ? (deviceState.energy.level > 20 ? "#00ff00" : "#ff0000") : "#000"}
                  emissiveIntensity={activeComponents.energy ? 1.0 : 0}
                />
             </Cylinder>

             {/* Flashlight Indicator */}
             <Cylinder args={[0.025, 0.025, 0.015, 8]} position={[0.1, -0.28, -0.8]} userData={{ isLight: activeComponents.ac }}>
                <meshStandardMaterial
                  color="#000"
                  emissive={activeComponents.ac ? "#ffffff" : "#000"}
                  emissiveIntensity={activeComponents.ac ? 1.5 : 0}
                />
             </Cylinder>
         </group>

         {/* Speaker Grill - Bottom of temple */}
         <group position={[0.1, -0.25, -2.0]}>
            {/* Speaker housing */}
            <RoundedBox args={[0.28, 0.10, 0.18]} radius={0.02}>
               <meshStandardMaterial
                 color="#6b7280"
                 roughness={0.3}
                 metalness={0.7}
                 envMapIntensity={1.0}
               />
            </RoundedBox>
            {/* Speaker grill mesh */}
            {Array.from({ length: 8 }, (_, i) => (
               <RoundedBox
                 key={i}
                 args={[0.22, 0.008, 0.012]}
                 position={[
                   (i % 4 - 1.5) * 0.05,
                   Math.floor(i / 4) * 0.025 - 0.02,
                   0.09
                 ]}
                 radius={0.001}
               >
                 <meshStandardMaterial
                   color="#4b5563"
                   roughness={0.3}
                   metalness={0.9}
                   envMapIntensity={1.2}
                 />
               </RoundedBox>
            ))}
         </group>

         {/* Premium Ear Hook */}
         <group position={[0.1, -0.65, -3.8]}>
             <mesh rotation={[Math.PI/4, 0, 0]}>
                <cylinderGeometry args={[0.08, 0.10, 1.0, 8]} /> {/* 减少顶点数 */}
                <meshStandardMaterial
                  color={aiMode === 'idle' ? '#2c2f33' : new THREE.Color(getFrameColor()).multiplyScalar(0.7)}
                  roughness={0.85}
                  metalness={0.05}
                />
             </mesh>
         </group>
      </group>

    </group>
  );
};
