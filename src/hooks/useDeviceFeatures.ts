// hooks/useDeviceFeatures.ts
import { useEffect } from 'react';

export function useDeviceFeatures() {
  useEffect(() => {
    // 检测设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // iOS特殊处理
    if (isMobile && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const iOSVersion = parseInt(
        navigator.userAgent.match(/OS (\d+)_/)?.[1] || '0',
        10
      );
      
      if (iOSVersion >= 16 && !window.matchMedia('(display-mode: standalone)').matches) {
        // 显示安装提示
        showInstallPrompt();
      }
    }

    // 安卓振动反馈
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }, []);
}

function showInstallPrompt() {
  // 显示自定义的PWA安装提示组件
}