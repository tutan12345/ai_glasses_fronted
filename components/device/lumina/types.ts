import type { DeviceState } from '@/types/device';

export type AIMode = 'idle' | 'listening' | 'processing' | 'camera' | 'navigation' | 'warning';

export interface AIStateConfig {
  mode: AIMode;
  color: string;
  label: string;
  description: string;
  emissionIntensity: number;
}

export interface GlassesProps {
  deviceState: DeviceState;
  scale?: number;
}

export interface IndicatorProps {
  active: boolean;
  color: string;
  intensity: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}
