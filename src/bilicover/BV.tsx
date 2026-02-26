import React from 'react';
import { useBiliCover } from './useBiliCover';
import ImagePreview from './ImagePreview';

/**
 * BV 组件
 * 目的：通过普通视频的 BV 号获取视频封面，并移交给 ImagePreview 进行渲染预览。
 * 上下文：被 BiliCover 或 B23(重定向后) 唤起调用。
 *
 * @param id 视频的 BV 号
 * @param text 原始输入关联的文本（用于展示来源）
 */
const BV = ({ id, text }: { id: string, text: string }) => {
  const { data: imageUrl, loading, error } = useBiliCover('bv', id);

  if (loading) return <div className="text-gray-500 animate-pulse">正在获取视频封面...</div>;
  if (error) return <div className="text-red-500">视频封面获取失败: {error}</div>;

  return <ImagePreview imageUrl={imageUrl} text={text} />;
};

export default BV;