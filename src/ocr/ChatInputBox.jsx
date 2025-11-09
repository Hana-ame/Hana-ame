import React, {useState, useRef, useEffect, useCallback} from 'react';

const ChatInputBox = ({ onSend }) => {
    const [text, setText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    // 封装了文本框高度自适应的逻辑 (无变化)
    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, []);

    // 处理文本输入变化 (无变化)
    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    // 当 text 状态变化后，执行高度调整的副作用 (无变化)
    useEffect(() => {
        adjustTextareaHeight();
    }, [text, adjustTextareaHeight]);
    
    // === 新增功能：处理粘贴事件 ===
    const handlePaste = useCallback((e) => {
        // 访问剪贴板数据
        const clipboardItems = e.clipboardData.items;
        
        // 遍历剪贴板中的所有项目
        for (let i = 0; i < clipboardItems.length; i++) {
            const item = clipboardItems[i];
            
            // 检查项目类型是否为图片
            if (item.type.indexOf('image') !== -1) {
                // 阻止默认的粘贴行为 (例如，粘贴图片的文件名)
                e.preventDefault();
                
                // 从项目中获取文件对象
                const file = item.getAsFile();
                
                if (file) {
                    // 如果已经有选中的文件，先移除旧的
                    if (selectedFile) {
                        removeSelectedFile();
                    }
                    // 设置新粘贴的文件
                    setSelectedFile(file);
                }
                
                // 找到并处理了第一个图片后，就停止循环
                break;
            }
        }
    }, [selectedFile]); // 依赖 selectedFile 以便在移除旧文件时有最新状态


    // 触发隐藏的文件输入框 (无变化)
    const handleImageIconClick = () => {
        fileInputRef.current.click();
    };

    // 处理文件选择 (无变化)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        }
    };
    
    // 移除已选择的文件 (无变化)
    const removeSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    // 处理发送逻辑 (无变化，它会自动处理 selectedFile)
    const handleSend = () => {
        if (typeof onSend !== 'function') return;
        let sent = false;
        if (text.trim()) {
            onSend({ type: 'text', content: text.trim() });
            sent = true;
        }
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // e.target.result 就是 Base64 编码的字符串
                onSend({ type: 'image', content: e.target.result, file: selectedFile });
            };
            reader.readAsDataURL(selectedFile);
            sent = true;
        }
        if (sent) {
            setText('');
            removeSelectedFile();
        }
    };
    
    // 处理键盘事件 (无变化)
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = text.trim() || selectedFile;

    return (
        <div className="p-4 bg-white border-t border-gray-200">
            {selectedFile && (
                <div className="relative inline-block mb-2">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-20 h-20 object-cover rounded-md"/>
                    <button onClick={removeSelectedFile} className="absolute top-0 right-0 -mt-2 -mr-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs focus:outline-none" aria-label="Remove image">&times;</button>
                </div>
            )}
        
            <div className="flex items-end space-x-3">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyPress}
                    onPaste={handlePaste} // <<< 在这里绑定粘贴事件处理器
                    placeholder="输入消息或粘贴图片..."
                    rows="1"
                    className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto"
                    style={{ maxHeight: '120px' }}
                />

                <div className="flex items-center space-x-2">
                    <button onClick={handleImageIconClick} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300" aria-label="Select image">
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                    <button onClick={handleSend} disabled={!canSend} className={`p-2 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${canSend ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`} aria-label="Send message">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInputBox;