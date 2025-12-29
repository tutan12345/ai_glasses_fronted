/**
 * DevicePanel - AI智能交互眼镜虚拟界面
 * 展示各种功能模块：音乐、导航、手电筒、视频、摄像头、语音等
 */

'use client';

import React from 'react';
import type { DeviceState } from '@/types/device';
import { AIGlasses3D } from './AIGlasses3D';

interface DevicePanelProps {
  deviceState: DeviceState;
}

export function DevicePanel({ deviceState }: DevicePanelProps) {
  const { camera, voice, music, navigation, flashlight, video, bluetooth, battery } = deviceState;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
      {/* 背景网格效果 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* 头部 */}
        <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <h2 className="font-bold text-lg tracking-tight text-gray-200">
              AI智能交互眼镜
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>电池: {battery.level}%</span>
            {battery.charging && <span className="text-green-400">⚡</span>}
          </div>
        </div>

        {/* AI眼镜3D示意 */}
        <div className="h-[28rem] border-b border-gray-800 bg-gradient-to-b from-gray-900/50 to-gray-950/30 backdrop-blur-sm">
          <AIGlasses3D deviceState={deviceState} />
        </div>

        {/* 功能模块区域 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 音乐播放器 */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-500 border ${
              music.isPlaying
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/30 shadow-lg scale-[1.02]'
                : 'bg-gray-800/40 border-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${
                  music.isPlaying
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    : 'bg-gray-700'
                }`}
              >
                {music.isPlaying ? (
                  <div className="flex gap-1 h-6 items-end">
                    <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-[60%] rounded-full"></div>
                    <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-[100%] rounded-full"></div>
                    <div className="w-1 bg-white animate-[bounce_1.0s_infinite] h-[40%] rounded-full"></div>
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                  >
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate mb-1">
                  {music.currentTrack || '未播放'}
                </div>
                <div className="text-xs text-gray-300">
                  {music.isPlaying ? `音量: ${music.volume}%` : '已暂停'}
                </div>
                {music.isPlaying && (
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${music.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 导航 */}
          {navigation.active && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-sm font-bold text-blue-300">导航中</span>
              </div>
              <div className="text-xs text-gray-300">
                <div>目的地: {navigation.destination || '未知'}</div>
                {navigation.distance && (
                  <div>距离: {(navigation.distance / 1000).toFixed(1)} km</div>
                )}
                {navigation.eta && <div>预计: {navigation.eta} 分钟</div>}
              </div>
            </div>
          )}

          {/* 摄像头 - 始终显示 */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-500 border ${
              camera.active
                ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 shadow-lg scale-[1.02]'
                : 'bg-gray-800/40 border-gray-700/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${
                  camera.active
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : 'bg-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={camera.active ? 'text-white' : 'text-gray-400'}
                >
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${camera.active ? 'text-green-300' : 'text-gray-400'}`}>
                  {camera.active ? (camera.recording ? '录制中' : '摄像头开启') : '摄像头'}
                </div>
                <div className="text-xs text-gray-300">
                  {camera.active ? '准备就绪' : '待机中'}
                </div>
              </div>
            </div>
            {/* 摄像头预览框（假的） */}
            <div className={`mt-3 rounded-lg overflow-hidden border-2 transition-all duration-500 ${
              camera.active 
                ? 'border-green-500/50 bg-gray-900/50' 
                : 'border-gray-700/50 bg-gray-900/30'
            }`}>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                {camera.active ? (
                  <>
                    {/* 模拟摄像头画面 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full border-4 border-green-400/50 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-green-400/30"></div>
                      </div>
                      <div className="text-xs text-green-400 font-mono">LIVE</div>
                    </div>
                    {camera.recording && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/80 px-2 py-1 rounded text-xs text-white">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        <span>REC</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-600 text-xs">摄像头预览</div>
                )}
              </div>
            </div>
            {camera.lastPhoto && (
              <div className="mt-2 text-xs text-gray-400">
                最后拍摄: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* 视频 */}
          {video.active && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-bold text-red-300">
                  {video.recording ? '视频录制中' : '视频开启'}
                </span>
              </div>
            </div>
          )}

          {/* 语音交互 - 始终显示 */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-500 border ${
              voice.listening || voice.speaking
                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 shadow-lg scale-[1.02]'
                : 'bg-gray-800/40 border-gray-700/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${
                voice.listening || voice.speaking
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-600'
                  : 'bg-gray-700'
              }`}>
                {voice.listening ? (
                  <div className="flex gap-1">
                    <div className="w-1 bg-white rounded-full animate-[bounce_0.6s_infinite] h-4"></div>
                    <div className="w-1 bg-white rounded-full animate-[bounce_0.8s_infinite] h-6"></div>
                    <div className="w-1 bg-white rounded-full animate-[bounce_0.7s_infinite] h-5"></div>
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={voice.listening || voice.speaking ? 'text-white' : 'text-gray-400'}
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${voice.listening || voice.speaking ? 'text-yellow-300' : 'text-gray-400'}`}>
                  {voice.listening ? '正在聆听...' : voice.speaking ? '正在说话...' : '语音交互'}
                </div>
                <div className="text-xs text-gray-300">音量: {voice.volume}%</div>
              </div>
            </div>
          </div>

          {/* 手电筒 - 始终显示 */}
          <div
            className={`p-4 rounded-2xl backdrop-blur-xl transition-all duration-500 border ${
              flashlight
                ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 shadow-lg scale-[1.02]'
                : 'bg-gray-800/40 border-gray-700/50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500 ${
                  flashlight
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                    : 'bg-gray-700'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={flashlight ? 'text-yellow-900' : 'text-gray-400'}
                >
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
                  <path d="M9 18h6"></path>
                  <path d="M10 22h4"></path>
                </svg>
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold ${flashlight ? 'text-yellow-200' : 'text-gray-400'}`}>
                  {flashlight ? '手电筒已开启' : '手电筒'}
                </div>
                <div className="text-xs text-gray-300">
                  {flashlight ? '照明中' : '待机中'}
                </div>
              </div>
            </div>
          </div>

          {/* 蓝牙状态 */}
          {bluetooth.connected && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <path d="m7 7 10 10-5 5V2l5 5L7 17"></path>
                </svg>
                <span>蓝牙已连接</span>
                {bluetooth.devices.length > 0 && (
                  <span className="text-gray-400">
                    ({bluetooth.devices.length} 设备)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 空状态提示 */}
          {!music.isPlaying &&
            !navigation.active &&
            !camera.active &&
            !video.active &&
            !voice.listening &&
            !voice.speaking &&
            !flashlight && (
              <div className="h-full flex items-center justify-center text-gray-600 opacity-30">
                <div className="text-center">
                  <p className="text-xs font-mono">等待指令...</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

