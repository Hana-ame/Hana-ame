import React from 'react';
import { useBiliCover } from './useBiliCover';
import BV from './BV';
import Live from './Live';

/**
 * B23 组件
 * 目的：专门处理短链接 (b23.tv) 的获取。首先获取重定向后的真实长 URL，然后通过判定将其分发给 BV 或 Live 子组件进行封面解析。
 * 上下文：被 BiliCover 组件调用。
 * 
 * @param id b23 短链接的特征码标识符
 * @param text 用户输入的原始文本
 */
const B23 = ({ id, text }: { id: string, text: string }) => {
  const { data: urlString, loading, error } = useBiliCover('b23', id);

  if (loading) return <div className="text-gray-500 animate-pulse">正在解析 B23 短链接...</div>;
  if (error) return <div className="text-red-500">短链接解析失败: {error}</div>;
  if (!urlString) return null;

  try {
    const url = new URL(urlString);
    
    // 从真实的重定向路径中，判断是视频链接还是直播间链接
    if (url.pathname.includes('/video/')) {
      const bv = url.pathname.split('/video/')[1]?.replace('/', '');
      return <BV id={bv} text={text} />;
    } else {
      const live = url.pathname.split('/')[1];
      return <Live id={live} text={text} />;
    }
  } catch {
    return <div className="text-red-500">URL 格式解析错误</div>;
  }
};

export default B23;