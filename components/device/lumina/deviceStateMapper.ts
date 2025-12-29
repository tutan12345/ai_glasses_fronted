import type { DeviceState } from '@/types/device';
import { AIMode } from './types';

/**
 * 将智能眼镜的设备状态映射到AI模式
 */
export function mapDeviceStateToAIMode(deviceState: DeviceState): AIMode {
  // 优先级：camera > listening > navigation > warning > idle

  // 摄像头或视频录制激活
  if (deviceState.camera.active || deviceState.video.active || deviceState.camera.recording || deviceState.video.recording) {
    return 'camera';
  }

  // 语音监听或说话中
  if (deviceState.voice.listening || deviceState.voice.speaking) {
    return 'listening';
  }

  // 导航激活
  if (deviceState.navigation.active) {
    return 'navigation';
  }

  // 音乐播放（处理状态）
  if (deviceState.music.isPlaying) {
    return 'processing';
  }

  // 警告状态：电池电量低或充电中
  if (deviceState.battery.level < 20 || deviceState.battery.charging) {
    return 'warning';
  }

  // 默认空闲状态
  return 'idle';
}

/**
 * 获取激活的组件列表（用于发光效果）
 */
export function getActiveComponents(deviceState: DeviceState): Record<string, boolean> {
  return {
    // 摄像头相关
    camera: deviceState.camera.active || deviceState.video.active,

    // 麦克风（语音监听）
    microphone: deviceState.voice.listening,

    // 扬声器（音乐播放或语音输出）
    speaker: deviceState.music.isPlaying || deviceState.voice.speaking,

    // 手电筒
    flashlight: deviceState.flashlight,

    // 蓝牙
    bluetooth: deviceState.bluetooth.connected,

    // 电池（低电量或充电时）
    battery: deviceState.battery.charging || deviceState.battery.level < 20,

    // 导航
    navigation: deviceState.navigation.active,

    // 视频录制
    video: deviceState.video.recording,

    // 屏幕亮度相关
    screen: deviceState.screenBrightness > 50
  };
}
