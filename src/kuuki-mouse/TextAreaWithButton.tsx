// 三种模式之一,只有输入框,并且停用鼠标
import React, { useState } from 'react';

export default function TextAreaWithButton({ onSubmit }: { onSubmit?: (text: string) => void }) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        onSubmit?.(text);
        setText('');
    };

    return (
        <div className="p-4 space-y-3 bg-white rounded-lg shadow-sm"> {/* 容器添加内边距、元素间距和背景样式 */}
            <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4} // 设置默认行数
                placeholder="请输入文本..." // 添加占位符提示
            />
            <button
                className="w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={!text.trim()} // 当文本为空时禁用按钮
            >
                Submit
            </button>
        </div>
    );
}