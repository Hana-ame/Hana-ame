import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import ChatInputBox from './ChatInputBox';
import { describeImage, freeOCR, translateContent } from './api.ts'
// import { time } from 'console';

// ... (假设 ChatInterface 和 ChatInputBox 组件已定义)

const AVATAR_DEEPSEEK = "https://upload.moonchan.xyz/api/01LLWEUUZ3X77353ZOQBAZFEVAEMZVGU43/image.webp";
const AVATAR_QWEN = "https://upload.moonchan.xyz/api/01LLWEUU4IFRWXLR5X2JF37YR7KICEX7U6/image.webp"

function isImageUrl(content) {
    // 支持的图片后缀名列表
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];

    try {
        // 使用 URL 对象解析字符串，可以自动分离路径和参数
        const urlObj = new URL(content);
        // 获取路径名（例如 '/path/to/image.png'）
        const pathname = urlObj.pathname;
        // 获取最后一个点号后的部分作为扩展名，并转换为小写
        const extension = pathname.split('.').pop().toLowerCase();

        // 检查扩展名是否在列表中
        return imageExtensions.includes(extension) || true;
    } catch (error) {
        // 如果 content 不是有效的完整URL，解析会失败，返回 false
        return false;
    }
}

const ChatApp = () => {


    const [searchParams] = useSearchParams();
    // 安全的布尔值转换
    console.log(searchParams)
    const ocr = searchParams.get('ocr') === 'true';
    const translate = searchParams.get('translate') === 'true';
    const describe = searchParams.get('describe') === 'true';
    const describe_zh = searchParams.get('describe_zh') === 'true';

    const [messages, setMessages] = useState([
        { id: "ocr", align: "left", avatar: AVATAR_DEEPSEEK, username: "free OCR", content: ocr ? "OCR 功能开启" : "OCR 功能关闭", timestamp: "" },
        { id: "translate", align: "left", avatar: AVATAR_QWEN, username: "translate", content: translate ? "translate 功能开启" : "translate 功能关闭", timestamp: "" },
        { id: "describe", align: "left", avatar: AVATAR_DEEPSEEK, username: "describe", content: describe ? "describe 功能开启" : "describe 功能关闭", timestamp: "" },
        { id: "describe_zh", align: "left", avatar: AVATAR_QWEN, username: "describe 中文", content: describe_zh ? "describe 自动翻译功能开启" : "describe 自动翻译功能关闭", timestamp: "" },
    ]);


    const handleSendMessage = async (messageData) => {
        console.log("Send message:", messageData);
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: Date.now(),
                avatar: "https://moonchan.xyz/favicon.ico",
                username: "You",
                align: "right",
                type: messageData.type,
                content: messageData.content,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        // ... 添加新消息到 messages 状态的逻辑
        if (messageData.type === "image" || (messageData.type === "text" && isImageUrl(messageData.content))) {
            if (ocr || translate) {
                const result = await freeOCR(messageData.content)
                console.log(result);
                if (ocr) setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        avatar: AVATAR_DEEPSEEK,
                        username: "Free OCR",
                        align: "left",
                        content: result,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }])
                if (translate) {
                    const translated = await translateContent(result);
                    console.log(translated);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            id: Date.now(),
                            avatar: AVATAR_QWEN,
                            username: "Translate",
                            align: "left",
                            content: translated,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }])
                }
            }
            if (describe || describe_zh) {
                const result = await describeImage(messageData.content);
                console.log(result);
                if (describe) setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        id: Date.now(),
                        avatar: AVATAR_DEEPSEEK,
                        username: "Describe",
                        align: "left",
                        content: result,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }])
                if (describe_zh) {
                    const translated = await translateContent(result);
                    console.log(translated);
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            id: Date.now(),
                            avatar: AVATAR_QWEN,
                            username: "Describe",
                            align: "left",
                            content: translated,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }])
                }
            }
        }
    };

    return (
        // 1. 设置主容器为垂直flex布局，并占满全屏
        <main className="flex flex-col h-screen bg-gray-100">
            {/* 2. ChatInterface 包裹器：让它占据所有剩余空间 */}
            <div className="flex-1 min-h-0">
                <ChatInterface
                    messages={messages}
                    onPageDown={() => { console.log("on page down") }}
                    onPageUp={() => { console.log("on page up") }}
                />
            </div>

            {/* 3. ChatInputBox：高度由其自身内容决定 */}
            <div>
                <ChatInputBox onSend={handleSendMessage} />
            </div>
        </main>
    );
};

export default ChatApp;