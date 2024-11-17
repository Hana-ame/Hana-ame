import { useState } from "react";
import ContentRender from "./ContentRender"

export interface Blog {
    title?: string;
    content: string;
    tags?: string[];
}

interface BlogCardProps {
    blog: Blog; // 使用 Blog 类型注解
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={
                `mb-4 p-4 border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${blog.content.length > 100? 'cursor-pointer': ''}`
            }
            onClick={toggleExpand}
        >
            {blog.title && <h2 className="text-xl font-semibold">{blog.title}</h2>}
            {blog.tags && blog.tags.length > 0 && (
                <div className="mt-2 mb-2">
                    {blog.tags.map((tag, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <pre className="text-gray-700">
                {isExpanded ? <ContentRender content={blog.content} /> : `${blog.content.substring(0, 100)}${blog.content.length > 100? '...': ''}`}
            </pre>
            {blog.content.length > 100 && (
                <button
                    className="mt-2 text-blue-500 hover:underline"
                >
                    {isExpanded ? "收起" : "阅读全文"}
                </button>
            )}
        </div>
    );
};

export default BlogCard;