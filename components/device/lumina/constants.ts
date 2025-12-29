import { AIStateConfig } from './types';

export type AIMode = 'idle' | 'listening' | 'processing' | 'camera' | 'navigation' | 'warning';

export const AI_STATES: Record<AIMode, AIStateConfig> = {
  idle: {
    mode: 'idle',
    color: '#64748b', // Slate-500 - 更现代的灰色
    label: '待机',
    description: '系统就绪，低功耗模式',
    emissionIntensity: 0.2
  },
  listening: {
    mode: 'listening',
    color: '#06b6d4', // Cyan-500 - 更亮的青色
    label: '聆听中',
    description: '麦克风阵列激活，语音处理中',
    emissionIntensity: 2.5
  },
  processing: {
    mode: 'processing',
    color: '#8b5cf6', // Violet-500 - 更亮的紫色
    label: '思考中',
    description: 'LLM推理进行中',
    emissionIntensity: 3.0
  },
  camera: {
    mode: 'camera',
    color: '#f59e0b', // Amber-500 - 金色，更现代
    label: '录制中',
    description: '视觉传感器激活，正在分析场景',
    emissionIntensity: 4.0
  },
  navigation: {
    mode: 'navigation',
    color: '#10b981', // Emerald-500 - 更亮的绿色
    label: '导航中',
    description: 'AR叠加激活，方向指引',
    emissionIntensity: 2.0
  },
  warning: {
    mode: 'warning',
    color: '#f97316', // Orange-500 - 保持
    label: '警报',
    description: '接近警告或电池电量低',
    emissionIntensity: 3.0
  }
};
