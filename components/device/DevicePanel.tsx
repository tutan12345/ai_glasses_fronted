/**
 * DevicePanel - LUMINA-CAR 虚拟控车界面
 */

'use client';

import React from 'react';
import type { DeviceState } from '@/types/device';
import { AIGlasses3D } from './AIGlasses3D';

interface DevicePanelProps {
  deviceState: DeviceState;
}

export function DevicePanel({ deviceState }: DevicePanelProps) {
  const { camera, voice, music, car, battery } = deviceState;

  const isAnyDoorOpen = Object.values(car.doors).some(open => open);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full bg-blue-500 animate-pulse`}></div>
            <h2 className="font-bold text-lg tracking-tight text-gray-200 uppercase">LUMINA-CAR 智能控车</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>电量: {battery.level}%</span>
            {battery.charging && <span className="text-green-400">⚡</span>}
          </div>
        </div>

        <div className="h-[28rem] border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-gray-950/30 backdrop-blur-sm">
          <AIGlasses3D deviceState={deviceState} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 车辆控制状态 */}
          <div className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-500 border ${car.lights.headlight || car.ac.state || isAnyDoorOpen ? 'bg-blue-500/10 border-blue-500/30 shadow-lg' : 'bg-gray-800/40 border-gray-700/50'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">灯光系统</div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-[9px] border ${car.lights.headlight ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-gray-900/50 border-gray-700 text-gray-600'}`}>大灯: {car.lights.headlight ? 'ON' : 'OFF'}</span>
                  <span className={`px-2 py-1 rounded text-[9px] border ${car.lights.ambient ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'bg-gray-900/50 border-gray-700 text-gray-600'}`}>氛围灯: {car.lights.ambient ? 'ON' : 'OFF'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">空调系统</div>
                <div className={`px-2 py-1 rounded text-[9px] border flex justify-between items-center ${car.ac.state ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' : 'bg-gray-900/50 border-gray-700 text-gray-600'}`}>
                  <span>{car.ac.state ? `已开启 ${car.ac.temperature}°C` : '已关闭'}</span>
                  {car.ac.state && <span className="animate-pulse">💨</span>}
                </div>
              </div>
            </div>
          </div>

          {/* 硬件面板 */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`p-3 rounded-xl border transition-all ${isAnyDoorOpen ? 'bg-blue-500/10 border-blue-500/30' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <div className="text-[9px] text-gray-500 mb-1">车门/箱盖</div>
              <div className="text-xs font-bold text-white uppercase">{isAnyDoorOpen ? '车门开启' : '全门已锁'}</div>
            </div>
            <div className={`p-3 rounded-xl border transition-all ${car.horn ? 'bg-orange-500/10 border-orange-500/30 animate-pulse' : 'bg-gray-800/40 border-gray-700/50'}`}>
              <div className="text-[9px] text-gray-500 mb-1">扬声器</div>
              <div className="text-xs font-bold text-white uppercase">{car.horn ? '正在鸣笛' : '静音'}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-800/40 border border-gray-700/50">
            <div className="text-[10px] text-gray-500 uppercase font-bold mb-3 tracking-widest text-center">座椅倾斜角度</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>主驾</span><span>{car.seats.driver}°</span></div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((car.seats.driver + 90) / 180) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>副驾</span><span>{car.seats.passenger}°</span></div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((car.seats.passenger + 90) / 180) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* 音乐 */}
          <div className={`p-4 rounded-2xl border transition-all ${music.isPlaying ? 'bg-purple-500/10 border-purple-500/30' : 'bg-gray-800/40 border-gray-700/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${music.isPlaying ? 'bg-purple-600' : 'bg-gray-700'}`}>
                {music.isPlaying ? <div className="flex gap-1 h-4 items-end"><div className="w-1 bg-white animate-bounce h-3"></div><div className="w-1 bg-white animate-bounce h-4 [animation-delay:0.2s]"></div><div className="w-1 bg-white animate-bounce h-2 [animation-delay:0.4s]"></div></div> : <span className="text-xl">🎵</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{music.currentTrack || '未播放'}</div>
                <div className="text-[10px] text-gray-400">{music.isPlaying ? `车载音响正在播放` : '播放已暂停'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
