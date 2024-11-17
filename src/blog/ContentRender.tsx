// ContentRender.tsx
import React from 'react';

interface ContentRenderProps {
    content: string; // 定义 content 的类型
}

const ContentRender: React.FC<ContentRenderProps> = ({ content }) => {
    // 按行分割内容
    const lines = content.split('\n');

    return (
        <div>
            {lines.map((line, index) => {
                // 使用正则表达式检查是否为 URL
                const urlRegex = /(https?:\/\/[^\s]+)/;

                if (urlRegex.test(line)) {
                    // 如果是 URL，则返回图像元素
                    return (
                        <img
                            key={index}
                            src={line}
                            alt={line} // 这里可以根据需要修改 alt 属性的内容
                            className="mt-2 max-w-full h-auto"
                        />
                    );
                }

                // 如果是文本，则返回段落元素
                return (
                    <p key={index} className="text-gray-700">
                        {line}
                    </p>
                );
            })}
        </div>
    );
};

export default ContentRender;