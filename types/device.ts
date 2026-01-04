/**
 * 设备状态类型定义
 * 参考: LUMINA-CAR 智能控车功能
 */

export interface DeviceState {
  // 车内摄像头
  camera: {
    active: boolean;
    lastPhoto: string | null;
    recording: boolean;
  };
  
  // 语音交互 (车内/外语音)
  voice: {
    listening: boolean;
    speaking: boolean;
    volume: number;
  };
  
  // 音乐播放器 (车载音响)
  music: {
    isPlaying: boolean;
    currentTrack: string | null;
    volume: number;
    progress: number; // 0-100
  };
  
  // 汽车硬件控制
  car: {
    doors: {
      frontLeft: boolean;
      frontRight: boolean;
      rearLeft: boolean;
      rearRight: boolean;
    };
    trunk: boolean; // 后备箱
    frunk: boolean; // 前备箱 (空投/Frunk)
    sunroof: boolean; // 天窗
    seats: {
      driver: number; // 座椅角度 -90 到 90
      passenger: number;
    };
    horn: boolean; // 车喇叭/外部扬声器
    lights: {
      headlight: boolean;
      ambient: boolean;
      ambientColor: string;
      hazard: boolean;
    };
    ac: {
      state: boolean;
      temperature: number;
      fanSpeed: number;
    };
  };

  // 导航
  navigation: {
    active: boolean;
    destination: string | null;
    distance: number | null;
    eta: number | null;
  };
  
  // 蓝牙
  bluetooth: {
    connected: boolean;
    devices: string[];
  };
  
  // 电池
  battery: {
    level: number;
    charging: boolean;
  };
  
  // 屏幕亮度
  screenBrightness: number;
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
  car: {
    doors: {
      frontLeft: false,
      frontRight: false,
      rearLeft: false,
      rearRight: false,
    },
    trunk: false,
    frunk: false,
    sunroof: false,
    seats: {
      driver: 0, // 直立
      passenger: 0,
    },
    horn: false,
    lights: {
      headlight: false,
      ambient: false,
      ambientColor: '#3b82f6',
      hazard: false,
    },
    ac: {
      state: false,
      temperature: 24,
      fanSpeed: 2,
    },
  },
  navigation: {
    active: false,
    destination: null,
    distance: null,
    eta: null,
  },
  bluetooth: {
    connected: false,
    devices: [],
  },
  battery: {
    level: 85,
    charging: false,
  },
  screenBrightness: 80,
};
