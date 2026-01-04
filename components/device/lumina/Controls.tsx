import React from 'react';
import type { DeviceState } from '@/types/device';
import { AIMode, AI_STATES } from './constants';
import { mapDeviceStateToAIMode } from './deviceStateMapper';

interface ControlsProps {
  deviceState: DeviceState;
}

export const Controls: React.FC<ControlsProps> = ({ deviceState }) => {
  const currentMode = mapDeviceStateToAIMode(deviceState);
  
  const activeComponents = [
    { key: 'lock', name: deviceState.vehicle.locked ? '已上锁' : '已解锁', icon: '🔒', active: deviceState.vehicle.locked },
    { key: 'ac', name: `空调 ${deviceState.ac.temperature}℃`, icon: '❄️', active: deviceState.ac.power },
    { key: 'trunk', name: '行李箱', icon: '📦', active: deviceState.vehicle.trunkOpen },
    { key: 'music', name: '多媒体', icon: '🎵', active: deviceState.music.isPlaying },
    { key: 'nav', name: '导航', icon: '🧭', active: deviceState.navigation.active },
    { key: 'energy', name: `续航 ${deviceState.energy.remainingRange}km`, icon: '🔋', active: deviceState.energy.level < 20 },
    { key: 'voice', name: '语音', icon: '🎙️', active: deviceState.voice.listening || deviceState.voice.speaking }
  ];

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-10">
      <div className="max-w-4xl mx-auto">

        {/* Status Display */}
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                    车机助手正在为您服务
                </h2>
                <p className="text-gray-400 text-sm">
                    {deviceState.vehicle.engineStarted ? '引擎已启动' : '驻车模式'} · 车内温度 {deviceState.environment.insideTemp}℃
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full animate-pulse bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                />
                <span className="text-xs font-mono text-gray-500 uppercase">车载系统已就绪</span>
            </div>
        </div>

        {/* Component Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          {activeComponents.map((component) => (
            <div
              key={component.key}
              className={`
                relative overflow-hidden group rounded-xl p-3 border transition-all duration-300
                flex flex-col items-center justify-center gap-2 h-20
                ${component.active
                  ? 'border-blue-500/30 bg-blue-500/10'
                  : 'border-white/5 bg-white/5'}
              `}
            >
              {/* Glow effect on active */}
              {component.active && (
                  <div className="absolute inset-0 opacity-10 blur-xl bg-blue-500" />
              )}

              {/* Icon */}
              <div className={`text-xl transition-transform duration-300 ${component.active ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {component.icon}
              </div>

              <span className={`text-[10px] font-medium tracking-wide text-center ${component.active ? 'text-blue-300' : 'text-gray-500'}`}>
                {component.name}
              </span>
            </div>
          ))}
        </div>

        {/* Energy Level Bar */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-400 text-xs">电量/油量:</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  deviceState.energy.level > 20 ? 'bg-blue-500' : 'bg-red-500'
                }`}
                style={{ width: `${deviceState.energy.level}%` }}
              />
            </div>
            <span className="text-white font-mono text-xs">{deviceState.energy.level}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
