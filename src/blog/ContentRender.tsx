// ContentRender.tsx
import React from 'react';
import CustomImage from '../Tools/CustomImage'

interface ContentRenderProps {
    content: string; // 定义 content 的类型
}

const ContentRender: React.FC<ContentRenderProps> = ({ content }) => {
    // 按行分割内容
    const lines = content.split('\n');

    return (
        <div>
            {lines.map((line, index) => {
                if (/^#+/.test(line)) {
                    const match = /^(#+)\s*(.*)$/.exec(line);
                    if (match) {
                        switch (match[1].length) {
                            case 1:
                                return <h1><ContentRender content={match[2]} /></h1>;
                            case 2:
                                return <h2><ContentRender content={match[2]} /></h2>;
                            case 3:
                                return <h3><ContentRender content={match[2]} /></h3>;
                            case 4:
                                return <h4><ContentRender content={match[2]} /></h4>;
                            case 5:
                                return <h5><ContentRender content={match[2]} /></h5>;
                            default:
                                return <h6><ContentRender content={match[2]} /></h6>;
                        }
                    }
                }

                if (/^\[(.*)\]\((https?:\/\/[^\s]+)\)/.test(line)) {
                    // 算了匹配两次就两次吧。
                    const match = /\[(.*)\]\((https?:\/\/[^\s]+)\)/.exec(line);
                    if (match)
                        return (
                            <a href={match[2]!}
                                className="text-blue-500 hover:text-green-500 underline"
                            >
                                {match[1]!}
                            </a>
                        );
                }


                if (/^\!\[(.*)\]\((https?:\/\/[^\s]+)\)/.test(line)) {
                    // 算了匹配两次就两次吧。
                    const match = /^!\[(.*)\]\((https?:\/\/[^\s]+)\)/.exec(line);
                    if (match)
                        return (
                            <CustomImage
                                key={index}
                                src={match[2]!}
                                alt={match[1]!} // 这里可以根据需要修改 alt 属性的内容
                                referrerPolicy='no-referrer'
                                className="mt-2 max-w-full h-auto"
                            />
                        );
                }

                if (/^(https?:\/\/[^\s]+)/.test(line)) {
                    // 如果是 URL，则返回图像元素
                    return (
                        <CustomImage
                            key={index}
                            src={line}
                            alt={line} // 这里可以根据需要修改 alt 属性的内容
                            referrerPolicy='no-referrer'
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