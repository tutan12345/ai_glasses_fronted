import type { DeviceState } from '@/types/device';
import { AIMode } from './types';

/**
 * 将车辆的设备状态映射到 AI 模式
 */
export function mapDeviceStateToAIMode(deviceState: DeviceState): AIMode {
  // 优先级：camera > listening > controlling > processing > warning > idle

  if (deviceState.camera.active || deviceState.camera.recording) {
    return 'camera';
  }

  if (deviceState.voice.listening || deviceState.voice.speaking) {
    return 'listening';
  }

  const isAnyDoorOpen = Object.values(deviceState.car.doors).some(open => open);
  if (isAnyDoorOpen || deviceState.car.trunk || deviceState.car.frunk || deviceState.car.sunroof || deviceState.car.horn || deviceState.car.lights.headlight || deviceState.car.ac.state) {
    return 'controlling';
  }

  if (deviceState.music.isPlaying) {
    return 'processing';
  }

  if (deviceState.battery.level < 20 || deviceState.battery.charging) {
    return 'warning';
  }

  return 'idle';
}

/**
 * 获取激活的组件列表（用于发光效果）
 */
export function getActiveComponents(deviceState: DeviceState): Record<string, boolean> {
  return {
    camera: deviceState.camera.active,
    microphone: deviceState.voice.listening,
    speaker: deviceState.music.isPlaying || deviceState.voice.speaking,
    car: true,
    doors: Object.values(deviceState.car.doors).some(open => open),
    trunk: deviceState.car.trunk,
    frunk: deviceState.car.frunk,
    sunroof: deviceState.car.sunroof,
    horn: deviceState.car.horn,
    headlight: deviceState.car.lights.headlight,
    ac: deviceState.car.ac.state,
    bluetooth: deviceState.bluetooth.connected,
    battery: deviceState.battery.charging || deviceState.battery.level < 20,
  };
}
