/**
 * AIGlassesSVG - AI智能交互眼镜 SVG 组件
 * 蓝图风格设计，支持动态高亮显示激活的功能
 * 参考: 蓝图风格线稿图
 */

'use client';

import React from 'react';
import type { DeviceState } from '@/types/device';

interface AIGlassesSVGProps {
  deviceState: DeviceState;
}

export function AIGlassesSVG({ deviceState }: AIGlassesSVGProps) {
  const { camera, voice, music, flashlight, video, bluetooth, battery } = deviceState;

  // 蓝图风格颜色
  const blueprintColor = '#60a5fa'; // light blue-400
  const activeColor = '#3b82f6'; // blue-500 (激活时)
  const inactiveColor = '#94a3b8'; // slate-400 (未激活时)
  const textColor = '#64748b'; // slate-500

  return (
    <div className="flex items-center justify-center p-4 bg-white/5 rounded-2xl">
      <svg
        width="600"
        height="280"
        viewBox="0 0 600 280"
        className="drop-shadow-lg"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      >
        {/* 定义虚线样式 */}
        <defs>
          <pattern id="dashPattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="8" y2="0" stroke={blueprintColor} strokeWidth="1" opacity="0.4" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* 左镜框 - 矩形设计，更大更厚实 */}
        <rect
          x="60"
          y="60"
          width="120"
          height="90"
          rx="10"
          fill="none"
          stroke={flashlight ? activeColor : blueprintColor}
          strokeWidth="4"
          className="transition-all duration-300"
          style={{
            filter: flashlight ? 'drop-shadow(0 0 10px #3b82f6)' : 'none',
          }}
        />

        {/* 左镜片 */}
        <rect
          x="72"
          y="72"
          width="96"
          height="66"
          rx="6"
          fill="none"
          stroke={flashlight ? activeColor : blueprintColor}
          strokeWidth="2.5"
          strokeDasharray="5,5"
          opacity="0.6"
          className="transition-all duration-300"
        />

        {/* 右镜框 - 矩形设计，更大 */}
        <rect
          x="420"
          y="60"
          width="120"
          height="90"
          rx="10"
          fill="none"
          stroke={flashlight ? activeColor : blueprintColor}
          strokeWidth="4"
          className="transition-all duration-300"
          style={{
            filter: flashlight ? 'drop-shadow(0 0 10px #3b82f6)' : 'none',
          }}
        />

        {/* 右镜片 */}
        <rect
          x="432"
          y="72"
          width="96"
          height="66"
          rx="6"
          fill="none"
          stroke={flashlight ? activeColor : blueprintColor}
          strokeWidth="2.5"
          strokeDasharray="5,5"
          opacity="0.6"
          className="transition-all duration-300"
        />

        {/* 鼻梁 - 连接两个镜框，更厚实 */}
        <rect
          x="180"
          y="80"
          width="240"
          height="50"
          rx="4"
          fill="none"
          stroke={blueprintColor}
          strokeWidth="3"
        />
        
        {/* 鼻梁连接线 */}
        <line
          x1="180"
          y1="105"
          x2="420"
          y2="105"
          stroke={blueprintColor}
          strokeWidth="3"
        />

        {/* 鼻托 */}
        <ellipse
          cx="200"
          cy="130"
          rx="5"
          ry="4"
          fill="none"
          stroke={blueprintColor}
          strokeWidth="2"
        />
        <ellipse
          cx="220"
          cy="130"
          rx="5"
          ry="4"
          fill="none"
          stroke={blueprintColor}
          strokeWidth="2"
        />

        {/* 左镜腿 - 厚实设计，连接到左镜框 */}
        <line
          x1="60"
          y1="105"
          x2="30"
          y2="105"
          stroke={bluetooth.connected ? activeColor : blueprintColor}
          strokeWidth="4"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <rect
          x="20"
          y="90"
          width="25"
          height="30"
          rx="3"
          fill="none"
          stroke={bluetooth.connected ? activeColor : blueprintColor}
          strokeWidth="3"
          className="transition-all duration-300"
        />
        {/* 左镜腿铰链加强 */}
        <rect
          x="50"
          y="95"
          width="15"
          height="20"
          fill="none"
          stroke={bluetooth.connected ? activeColor : blueprintColor}
          strokeWidth="3"
          className="transition-all duration-300"
        />

        {/* 右镜腿 - 连接到右镜框 */}
        <line
          x1="540"
          y1="105"
          x2="570"
          y2="105"
          stroke={bluetooth.connected ? activeColor : blueprintColor}
          strokeWidth="4"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <rect
          x="555"
          y="90"
          width="25"
          height="30"
          rx="3"
          fill="none"
          stroke={bluetooth.connected ? activeColor : blueprintColor}
          strokeWidth="3"
          className="transition-all duration-300"
        />
        {/* 右镜腿铰链加强 */}
        <rect
          x="525"
          y="95"
          width="15"
          height="20"
          fill="none"
          stroke={bluetooth.connected ? activeColor : blueprintColor}
          strokeWidth="3"
          className="transition-all duration-300"
        />

        {/* 功能点标注 - 摄像头（左镜框上方外侧）- 点亮效果 */}
        <g>
          {/* 虚线连接 */}
          <line
            x1="120"
            y1="50"
            x2="120"
            y2="60"
            stroke={camera.active || video.active ? activeColor : blueprintColor}
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity={camera.active || video.active ? 1 : 0.5}
            className="transition-all duration-300"
          />
          {/* 功能点圆点 - 激活时点亮 */}
          <circle
            cx="120"
            cy="50"
            r={camera.active || video.active ? "8" : "6"}
            fill={camera.active || video.active ? activeColor : blueprintColor}
            stroke="white"
            strokeWidth={camera.active || video.active ? "3" : "2"}
            className="transition-all duration-300"
            style={{
              filter: camera.active || video.active ? 'drop-shadow(0 0 12px #3b82f6)' : 'none',
            }}
          >
            {(camera.active || video.active) && (
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          {/* 标注文字 */}
          <text
            x="120"
            y="40"
            textAnchor="middle"
            fill={camera.active || video.active ? activeColor : textColor}
            fontSize="11"
            fontFamily="monospace"
            fontWeight={camera.active || video.active ? "600" : "500"}
            className="transition-all duration-300"
          >
            Camera
          </text>
        </g>

        {/* 功能点标注 - 环境光传感器（左镜框上方内侧） */}
        <g>
          <line
            x1="160"
            y1="55"
            x2="160"
            y2="60"
            stroke={blueprintColor}
            strokeWidth="1.5"
            strokeDasharray="3,3"
            opacity="0.4"
          />
          <circle
            cx="160"
            cy="55"
            r="4"
            fill={blueprintColor}
            stroke="white"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <text
            x="160"
            y="50"
            textAnchor="middle"
            fill={textColor}
            fontSize="8"
            fontFamily="monospace"
            opacity="0.7"
          >
            ALS
          </text>
        </g>

        {/* 功能点标注 - 麦克风（左镜腿下方外侧）- 点亮效果 */}
        <g>
          <line
            x1="40"
            y1="120"
            x2="40"
            y2="150"
            stroke={voice.listening ? activeColor : blueprintColor}
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity={voice.listening ? 1 : 0.5}
            className="transition-all duration-300"
          />
          <circle
            cx="40"
            cy="150"
            r={voice.listening ? "7" : "5"}
            fill={voice.listening ? activeColor : blueprintColor}
            stroke="white"
            strokeWidth={voice.listening ? "3" : "2"}
            className="transition-all duration-300"
            style={{
              filter: voice.listening ? 'drop-shadow(0 0 10px #3b82f6)' : 'none',
            }}
          >
            {voice.listening && (
              <animate
                attributeName="r"
                values="7;9;7"
                dur="0.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <text
            x="40"
            y="165"
            textAnchor="middle"
            fill={voice.listening ? activeColor : textColor}
            fontSize="11"
            fontFamily="monospace"
            fontWeight={voice.listening ? "600" : "500"}
            className="transition-all duration-300"
          >
            Mic
          </text>
        </g>

        {/* 功能点标注 - 摄像头（右镜腿前方，两个点）- 点亮效果 */}
        <g>
          <line
            x1="560"
            y1="105"
            x2="575"
            y2="90"
            stroke={camera.active || video.active ? activeColor : blueprintColor}
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity={camera.active || video.active ? 1 : 0.5}
            className="transition-all duration-300"
          />
          {/* 摄像头镜头 - 激活时点亮 */}
          <circle
            cx="575"
            cy="90"
            r={camera.active || video.active ? "7" : "5"}
            fill={camera.active || video.active ? activeColor : blueprintColor}
            stroke="white"
            strokeWidth={camera.active || video.active ? "3" : "2"}
            className="transition-all duration-300"
            style={{
              filter: camera.active || video.active ? 'drop-shadow(0 0 12px #3b82f6)' : 'none',
            }}
          >
            {(camera.active || video.active) && (
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="1s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          {/* LED 指示灯 - 激活时点亮 */}
          <circle
            cx="585"
            cy="85"
            r={camera.active || video.active ? "4" : "3"}
            fill={camera.active || video.active ? '#ef4444' : blueprintColor}
            stroke="white"
            strokeWidth={camera.active || video.active ? "2" : "1.5"}
            opacity={camera.active || video.active ? 1 : 0.4}
            className="transition-all duration-300"
          >
            {(camera.active || video.active) && (
              <animate
                attributeName="opacity"
                values="1;0.3;1"
                dur="0.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <text
            x="580"
            y="80"
            textAnchor="middle"
            fill={camera.active || video.active ? activeColor : textColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight={camera.active || video.active ? "600" : "500"}
            className="transition-all duration-300"
          >
            Cam
          </text>
        </g>

        {/* 功能点标注 - 扬声器（右镜腿中后部）- 点亮效果 */}
        <g>
          <line
            x1="570"
            y1="120"
            x2="570"
            y2="150"
            stroke={music.isPlaying || voice.speaking ? activeColor : blueprintColor}
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity={music.isPlaying || voice.speaking ? 1 : 0.5}
            className="transition-all duration-300"
          />
          <circle
            cx="570"
            cy="150"
            r={music.isPlaying || voice.speaking ? "7" : "5"}
            fill={music.isPlaying || voice.speaking ? activeColor : blueprintColor}
            stroke="white"
            strokeWidth={music.isPlaying || voice.speaking ? "3" : "2"}
            className="transition-all duration-300"
            style={{
              filter: music.isPlaying || voice.speaking ? 'drop-shadow(0 0 10px #3b82f6)' : 'none',
            }}
          >
            {(music.isPlaying || voice.speaking) && (
              <animate
                attributeName="r"
                values="7;9;7"
                dur="0.6s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <text
            x="570"
            y="165"
            textAnchor="middle"
            fill={music.isPlaying || voice.speaking ? activeColor : textColor}
            fontSize="11"
            fontFamily="monospace"
            fontWeight={music.isPlaying || voice.speaking ? "600" : "500"}
            className="transition-all duration-300"
          >
            Speaker
          </text>
        </g>

        {/* 功能点标注 - 电池/状态指示（右镜框上方） */}
        <g>
          <line
            x1="480"
            y1="50"
            x2="480"
            y2="60"
            stroke={battery.charging ? '#10b981' : battery.level < 20 ? '#ef4444' : blueprintColor}
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity={battery.charging || battery.level < 20 ? 1 : 0.5}
            className="transition-all duration-300"
          />
          <circle
            cx="480"
            cy="50"
            r={battery.charging || battery.level < 20 ? "5" : "4"}
            fill={battery.charging ? '#10b981' : battery.level < 20 ? '#ef4444' : blueprintColor}
            stroke="white"
            strokeWidth={battery.charging || battery.level < 20 ? "2.5" : "1.5"}
            className="transition-all duration-300"
            style={{
              filter: battery.charging ? 'drop-shadow(0 0 8px #10b981)' : battery.level < 20 ? 'drop-shadow(0 0 8px #ef4444)' : 'none',
            }}
          >
            {battery.charging && (
              <animate
                attributeName="opacity"
                values="1;0.4;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <text
            x="480"
            y="40"
            textAnchor="middle"
            fill={battery.charging ? '#10b981' : battery.level < 20 ? '#ef4444' : textColor}
            fontSize="10"
            fontFamily="monospace"
            fontWeight={battery.charging || battery.level < 20 ? "600" : "500"}
            className="transition-all duration-300"
          >
            {battery.level}%
          </text>
        </g>

        {/* 功能点标注 - 控制按钮/触摸区（左镜腿上方） */}
        <g>
          <line
            x1="50"
            y1="75"
            x2="50"
            y2="90"
            stroke={blueprintColor}
            strokeWidth="1.5"
            strokeDasharray="3,3"
            opacity="0.4"
          />
          <circle
            cx="50"
            cy="75"
            r="4"
            fill={blueprintColor}
            stroke="white"
            strokeWidth="1.5"
            opacity="0.6"
          />
          <text
            x="50"
            y="68"
            textAnchor="middle"
            fill={textColor}
            fontSize="8"
            fontFamily="monospace"
            opacity="0.7"
          >
            Ctrl
          </text>
        </g>

        {/* 手电筒效果（镜片高亮） */}
        {flashlight && (
          <>
            <rect
              x="72"
              y="72"
              width="96"
              height="66"
              rx="6"
              fill="white"
              opacity="0.4"
              className="animate-pulse"
            />
            <rect
              x="432"
              y="72"
              width="96"
              height="66"
              rx="6"
              fill="white"
              opacity="0.4"
              className="animate-pulse"
            />
          </>
        )}

        {/* 蓝牙连接指示（左镜腿上方）- 点亮效果 */}
        {bluetooth.connected && (
          <g>
            <path
              d="M 40 75 Q 45 70 50 75 Q 55 80 60 75"
              stroke={activeColor}
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="2,2"
              style={{
                filter: 'drop-shadow(0 0 6px #3b82f6)',
              }}
            />
            <circle
              cx="50"
              cy="75"
              r="5"
              fill={activeColor}
              stroke="white"
              strokeWidth="2"
              style={{
                filter: 'drop-shadow(0 0 8px #3b82f6)',
              }}
            >
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x="50"
              y="68"
              textAnchor="middle"
              fill={activeColor}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="600"
            >
              BT
            </text>
          </g>
        )}

        {/* 产品标识 */}
        <text
          x="300"
          y="200"
          textAnchor="middle"
          fill={textColor}
          fontSize="12"
          fontFamily="monospace"
          fontWeight="600"
          opacity="0.5"
        >
          AI Smart Glasses
        </text>
      </svg>
    </div>
  );
}


