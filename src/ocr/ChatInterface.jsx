import React, { useEffect, useRef } from 'react';

const ChatInterface = ({
    messages = [],
    width = '100%',
    height = '100%'
}) => {
    const messagesEndRef = useRef(null);

    // Automatically scroll to the bottom when new messages are added
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    

    // Renders the content of a message based on its type ('text' or 'image')
    const renderMessageContent = (message) => {
        const { type = 'text', content } = message; // Default to 'text' if type is not specified

        switch (type) {
            case 'image':
                return (
                    <img 
                        src={content} 
                        alt="" 
                        className="max-w-xs max-h-60 rounded-md object-cover cursor-pointer transition-transform duration-200 hover:scale-105"
                        // You could add an onClick handler here to open a modal with the full image
                        // onClick={() => onImageClick(content)} 
                    />
                );
            case 'text':
            default:
                // For text, we wrap it in a <p> tag to ensure consistent styling
                // This also handles cases where content might already be a React element (though less ideal)
                if (typeof content === 'string') {
                    return <p className="text-gray-800 text-sm whitespace-pre-line">{content}</p>;
                }
                // return content; // Render as is if it's already an element
        }
    };

    // Renders a single message bubble
    const renderMessage = (message, index) => {
        const { id, align, avatar, username, timestamp } = message;

        const messageAlignments = {
            left: (
                <div className="flex items-start space-x-3 mb-4">
                    <img src={avatar} alt={username} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="max-w-[70%]">
                        <div className="flex items-baseline space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-700">{username}</span>
                            <span className="text-xs text-gray-500">{timestamp}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                            {renderMessageContent(message)}
                        </div>
                    </div>
                </div>
            ),
            right: (
                <div className="flex items-start space-x-3 justify-end mb-4">
                    <div className="max-w-[70%]">
                        <div className="flex items-baseline space-x-2 mb-1 justify-end">
                            <span className="text-xs text-gray-500">{timestamp}</span>
                            <span className="text-sm font-medium text-gray-700">{username}</span>
                        </div>
                        {/* For images sent by the user, the padding creates a nice frame */}
                        <div className="bg-blue-100 p-2 rounded-lg rounded-tr-none shadow-sm border border-blue-200 inline-block">
                            {renderMessageContent(message)}
                        </div>
                    </div>
                    <img src={avatar} alt={username} className="w-8 h-8 rounded-full flex-shrink-0" />
                </div>
            ),
            center: (
                <div className="flex justify-center my-4">
                    <div className="max-w-[80%] text-center">
                        <div className="bg-gray-100 px-3 py-2 rounded-lg shadow-sm">
                            <span className="text-xs text-gray-600 font-medium">{username}</span>
                            <span className="text-xs text-gray-500 mx-2">{timestamp}</span>
                            <div className="text-gray-700 text-sm mt-1">{renderMessageContent(message)}</div>
                        </div>
                    </div>
                </div>
            )
        };

        return (
            <div key={id || index}>
                {messageAlignments[align] || messageAlignments.left}
            </div>
        );
    };

    return (
        <div
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
            style={{ width, height }}
        >
            <div
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
            >
                <div className="space-y-1">
                    {messages.map((message, index) => renderMessage(message, index))}
                    {/* Add a reference div at the end of the messages for auto-scrolling */}
                    <div ref={messagesEndRef} />
                </div>
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        暂无消息
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface;