import React, { useState } from 'react';
import { API_ENDPOINTS } from './config';

/**
 * ImagePreview 组件
 * 目的：展示已请求成功的图片，提供保存原图按钮。同时提供 TID 设置框，一键将图片信息通过两个 POST 请求发送给月岛。
 * 上下文：作为 BV 和 Live 组件解析完成后的底层渲染与操作节点。
 * 
 * @param imageUrl 需要展示的封面原始图片链接
 * @param text 该封面所属视频/直播间的原始页面链接
 */
const ImagePreview = ({ imageUrl, text }: { imageUrl: string, text: string }) => {
  // 维护表单状态：目标贴子 TID、发送进行状态以及结果反馈
  const [tid, setTid] = useState<string>('');
  const[isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  /**
   * handleSendToMoonchan 异步函数
   * 目的：根据输入的 TID，将封面数据分别发送至月岛的两个独立 API 接口，并处理防抖与异常。
   */
  const handleSendToMoonchan = async () => {
    // 简单的非空检验
    if (!tid.trim()) {
      setSendResult({ type: 'error', msg: '请先输入有效的 TID！' });
      return;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      // --- 第一道 POST 请求 ---
      const res1 = await fetch(API_ENDPOINTS.MOONCHAN_POST_URL_1, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tid: tid,
          p: imageUrl,
          txt: text
          // 请根据你的实际业务要求在这里补齐 payload 参数
        })
      });
      if (!res1.ok) throw new Error(`请求1失败: 状态码 ${res1.status}`);

      // --- 第二道 POST 请求 ---
      const res2 = await fetch(API_ENDPOINTS.MOONCHAN_POST_URL_2, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: imageUrl.replace(/^https:/, 'http:')
      });
      if (!res2.ok) throw new Error(`请求2失败: 状态码 ${res2.status}`);

      // 全部请求成功后的界面反馈
      setSendResult({ type: 'success', msg: '成功将封面数据同步至月岛！' });
    } catch (err: unknown) {
      setSendResult({ type: 'error', msg: `发送中止: ${err instanceof Error ? err.message : '未知错误'}` });
    } finally {
      setIsSending(false);
    }
  };

  if (!imageUrl) return null;

  return (
    <div className="flex flex-col items-center w-full animate-fadeIn">
      {/* 封面图片预览 */}
      <img 
        src={imageUrl} 
        alt="Bilibili Cover Preview" 
        className="max-w-full h-auto rounded-lg shadow-lg mb-6 object-contain max-h-[500px]"
      />
      
      {/* 底部功能操作区 */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        
        {/* 查看原图按钮 */}
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-full text-center px-6 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-md transition-colors shadow-sm"
        >
          在新标签页中查看/保存原图
        </a>
        
        {/* 发送至月岛专属面板 */}
        <div className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner border border-gray-200 dark:border-gray-700 flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            发送到月岛 (配置 TID)
          </label>
          
          <input 
            type="text" 
            placeholder="输入目标帖子 TID..." 
            value={tid}
            onChange={(e) => setTid(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white transition-all"
          />
          
          <button
            onClick={handleSendToMoonchan}
            disabled={isSending}
            className={`w-full py-2 rounded-md text-white font-medium transition-colors ${
              isSending 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 shadow-sm'
            }`}
          >
            {isSending ? '正在同步发送中...' : '确认发送至月岛'}
          </button>

          {/* 发送结果反馈提示 */}
          {sendResult && (
            <div className={`text-sm text-center font-medium ${
              sendResult.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
            }`}>
              {sendResult.msg}
            </div>
          )}
        </div>

        {/* 原始来源 URL 提示 */}
        <p className="text-xs text-gray-400 mt-2 break-all text-center">
          来源链接: {text}
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;