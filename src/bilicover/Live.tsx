import React from 'react';
import { useBiliCover } from './useBiliCover';
import ImagePreview from './ImagePreview';

/**
 * Live 组件
 * 目的：通过直播间 ID 号获取对应直播间的当前封面图片。
 * 上下文：被 BiliCover 或 B23 唤起调用。
 *
 * @param id 直播间号
 * @param text 原始输入关联的文本
 */
const Live = ({ id, text }: { id: string, text: string }) => {
  const { data: imageUrl, loading, error } = useBiliCover('live', id);

  if (loading) return <div className="text-gray-500 animate-pulse">正在获取直播间封面...</div>;
  if (error) return <div className="text-red-500">直播间封面获取失败: {error}</div>;

  return <ImagePreview imageUrl={imageUrl} text={text} />;
};

export default Live;