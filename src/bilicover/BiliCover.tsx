import React, { useEffect, useState } from 'react';
import B23 from "./B23";
import BV from "./BV";
import Live from './Live';

/**
 * BiliCover 组件 (主入口组件)
 * 目的：提供现代化 UI 交互界面，允许用户通过输入、粘贴 (Ctrl+V) 或拖拽填入 B 站链接；
 *       自动利用正则匹配链接类型 (B23/BV/Live) 并加载对应子组件。
 * 上下文：作为此独立功能的最高层页面容器。
 */
const BiliCover = () => {
  const [url, setUrl] = useState<string>("");
  const [b23id, setB23id] = useState<string>("");
  const [bvid, setBvid] = useState<string>("");
  const[liveid, setLiveid] = useState<string>("");

  /**
   * extractIds 内部函数
   * 目的：使用正则表达式检测并拆解用户输入的 URL 类型，提取并分发 ID 到对应状态，供后续渲染判断。
   * 上下文：在 onChange、onDrop、onPaste 等交互事件中调用。
   * @param inputUrl 用户输入的完整 URL 字符串
   */
  const extractIds = (inputUrl: string) => {
    const b23Regex = /https?:\/\/(?:www\.)?b23\.tv\/(\w+)/;
    const bvidRegex = /https?:\/\/(?:www\.)?bilibili\.com\/video\/(\w+)/;
    const liveRegex = /https?:\/\/live\.bilibili\.com\/(\w+)/;

    const b23Match = inputUrl.match(b23Regex);
    const bvidMatch = inputUrl.match(bvidRegex);
    const liveMatch = inputUrl.match(liveRegex);

    setB23id(b23Match ? b23Match[1] : "");
    setBvid(bvidMatch ? bvidMatch[1] : "");
    setLiveid(liveMatch ? liveMatch[1] : "");
  };

  /**
   * handleChange 内部函数
   * 目的：捕获输入框的内容变化，驱动状态更新并解析。
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    extractIds(newUrl);
  };

  /**
   * handlePaste 内部函数
   * 目的：监听页面级别的粘贴事件，即使用户未聚焦输入框，只要按下 Ctrl+V 也能识别并解析 URL。
   */
  const handlePaste = (event: ClipboardEvent) => {
    const clipboardData = event.clipboardData || (window as unknown as { clipboardData: DataTransfer }).clipboardData;
    if (!clipboardData) return;
    const pastedData = clipboardData.getData('Text');
    
    if (pastedData) {
      setUrl(pastedData);
      extractIds(pastedData);
    }
  };

  /**
   * handleMouseEnter 内部函数
   * 目的：当鼠标悬停于输入框时自动全选文本，方便用户直接粘贴覆盖。
   */
  const handleMouseEnter = (event: React.MouseEvent<HTMLInputElement>) => {
    (event.target as HTMLInputElement).select();
  };

  /**
   * handleDrop 内部函数
   * 目的：处理拖放事件，获取用户拖拽进来的链接内容文本并自动解析。
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // 阻止浏览器默认直接打开链接的跳转行为
    const data = event.dataTransfer.getData('text');
    if (data) {
      setUrl(data);
      extractIds(data);
    }
  };

  /**
   * handleDragOver 内部函数
   * 目的：必须阻止默认的 DragOver 行为，否则无法触发之后的 Drop 释放事件。
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // 挂载全局粘贴事件的监听器 (修复了原代码未加[] 导致内存泄露重复绑定的 Bug)
  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  },[]);

  return (
    <main>
      {/* 居中响应式卡片布局 */}
      <div 
        className="h-full flex flex-col items-center justify-start p-4 md:p-8"
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
      >
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
            获取 BiliBili 封面图
          </h2>
          
          <input
            type="text"
            value={url}
            onChange={handleChange}
            onMouseEnter={handleMouseEnter}
            placeholder="粘贴 B站 URL (支持直接按 Ctrl+V 或拖拽链接)"
            className="w-full p-4 text-base border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
          />
          
          <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>支持的格式：b23.tv / BV号 / 直播间链接</span>
            <span>
              后端支持(无断): <a className="text-blue-500 hover:text-blue-600 underline transition-colors" href="https://bilicover.magecorn.com/help" target="_blank" rel="noreferrer">查看接口说明</a>
            </span>
          </div>

          {/* 封面渲染展示区域 */}
          <div className="mt-8 min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 transition-all">
            {b23id && <B23 id={b23id} text={url} />}
            {bvid && <BV id={bvid} text={url} />}
            {liveid && <Live id={liveid} text={url} />}
            
            {/* 空状态占位提示 */}
            {!b23id && !bvid && !liveid && (
              <span className="text-gray-400 select-none">等待输入或拖入有效链接...</span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BiliCover;