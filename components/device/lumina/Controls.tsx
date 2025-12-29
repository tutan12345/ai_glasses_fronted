import React from 'react';
import type { DeviceState } from '@/types/device';
import { AIMode, AI_STATES } from './constants';
import { mapDeviceStateToAIMode } from './deviceStateMapper';

interface ControlsProps {
  deviceState: DeviceState;
}

export const Controls: React.FC<ControlsProps> = ({ deviceState }) => {
  const currentMode = mapDeviceStateToAIMode(deviceState);
  const activeComponents = {
    camera: deviceState.camera.active || deviceState.video.active,
    microphone: deviceState.voice.listening,
    speaker: deviceState.music.isPlaying || deviceState.voice.speaking,
    flashlight: deviceState.flashlight,
    bluetooth: deviceState.bluetooth.connected,
    battery: deviceState.battery.charging || deviceState.battery.level < 20,
    navigation: deviceState.navigation.active,
  };

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
      <div className="max-w-4xl mx-auto">

        {/* Status Display */}
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                    {AI_STATES[currentMode].label}
                </h2>
                <p className="text-gray-400 text-sm">
                    {AI_STATES[currentMode].description}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: AI_STATES[currentMode].color, boxShadow: `0 0 10px ${AI_STATES[currentMode].color}` }}
                />
                <span className="text-xs font-mono text-gray-500 uppercase">系统激活</span>
            </div>
        </div>

        {/* Component Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
          {[
            { key: 'camera', name: '摄像头', icon: '📷', active: activeComponents.camera },
            { key: 'microphone', name: '麦克风', icon: '🎙️', active: activeComponents.microphone },
            { key: 'speaker', name: '扬声器', icon: '🔊', active: activeComponents.speaker },
            { key: 'flashlight', name: '手电筒', icon: '🔦', active: activeComponents.flashlight },
            { key: 'bluetooth', name: '蓝牙', icon: '📱', active: activeComponents.bluetooth },
            { key: 'battery', name: '电池', icon: '🔋', active: activeComponents.battery },
            { key: 'navigation', name: '导航', icon: '🧭', active: activeComponents.navigation }
          ].map((component) => (
            <div
              key={component.key}
              className={`
                relative overflow-hidden group rounded-xl p-3 border transition-all duration-300
                flex flex-col items-center justify-center gap-2 h-20
                ${component.active
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/5 bg-white/5'}
              `}
            >
              {/* Glow effect on active */}
              {component.active && (
                  <div
                      className="absolute inset-0 opacity-20 blur-xl transition-colors duration-500"
                      style={{ backgroundColor: AI_STATES[currentMode].color }}
                  />
              )}

              {/* Icon */}
              <div
                  className={`text-xl transition-transform duration-300 ${component.active ? 'scale-110' : 'group-hover:scale-110'}`}
                  style={{ color: component.active ? AI_STATES[currentMode].color : '#666' }}
              >
                  {component.icon}
              </div>

              <span className={`text-xs font-medium tracking-wide text-center ${component.active ? 'text-white' : 'text-gray-500'}`}>
                {component.name}
              </span>
            </div>
          ))}
        </div>

        {/* Battery Level */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-400">电池电量:</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  deviceState.battery.level > 20 ? 'bg-green-400' : 'bg-red-400'
                }`}
                style={{ width: `${deviceState.battery.level}%` }}
              />
            </div>
            <span className="text-white font-mono">{deviceState.battery.level}%</span>
            {deviceState.battery.charging && (
              <span className="text-yellow-400 animate-pulse">⚡</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
