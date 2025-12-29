/**
 * 设备状态类型定义
 * 参考: AI智能交互眼镜功能
 */

export interface DeviceState {
  // 摄像头
  camera: {
    active: boolean;
    lastPhoto: string | null;
    recording: boolean;
  };
  
  // 语音交互
  voice: {
    listening: boolean;
    speaking: boolean;
    volume: number;
  };
  
  // 音乐播放器
  music: {
    isPlaying: boolean;
    currentTrack: string | null;
    volume: number;
    progress: number; // 0-100
  };
  
  // 导航
  navigation: {
    active: boolean;
    destination: string | null;
    distance: number | null; // 米
    eta: number | null; // 分钟
  };
  
  // 手电筒
  flashlight: boolean;
  
  // 视频
  video: {
    active: boolean;
    recording: boolean;
  };
  
  // 蓝牙
  bluetooth: {
    connected: boolean;
    devices: string[];
  };
  
  // 电池
  battery: {
    level: number; // 0-100
    charging: boolean;
  };
  
  // 屏幕亮度
  screenBrightness: number; // 0-100
}

export const initialDeviceState: DeviceState = {
  camera: {
    active: false,
    lastPhoto: null,
    recording: false,
  },
  voice: {
    listening: false,
    speaking: false,
    volume: 50,
  },
  music: {
    isPlaying: false,
    currentTrack: null,
    volume: 50,
    progress: 0,
  },
  navigation: {
    active: false,
    destination: null,
    distance: null,
    eta: null,
  },
  flashlight: false,
  video: {
    active: false,
    recording: false,
  },
  bluetooth: {
    connected: false,
    devices: [],
  },
  battery: {
    level: 100,
    charging: false,
  },
  screenBrightness: 80,
};

