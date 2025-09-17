import React, { useState, ChangeEvent, KeyboardEvent } from 'react';

// 1. 首先定义组件的 Props 接口
interface InputBarProps {
    // onSubmit 是一个函数类型，它接收一个 string 类型的参数 (url)，并且没有返回值 (void)
    onSubmit?: (url: string) => void;
}

// 2. 使用 React.FC (FunctionComponent) 泛型类型并传入上面定义的 Props 类型
// 同时为 onSubmit 提供一个默认值，确保即使未传入该 prop 也能正常工作
const InputBar: React.FC<InputBarProps> = ({
    onSubmit = (url: string) => { console.log("Submitted URL: " + url) }
}) => {
    // 3. 使用 useState 来管理输入框的值，并明确其类型为 string
    const [inputValue, setInputValue] = useState<string>('');

    // 4. 处理输入框变化事件，使用 React.ChangeEvent 泛型类型指定事件目标为 HTMLInputElement
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    // 5. 处理按键事件，特别是回车键提交
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    // 6. 提交处理函数
    const handleSubmit = () => {
        if (inputValue.trim()) { // 简单的非空验证
            onSubmit(inputValue.trim()); // 调用从 props 传入的 onSubmit 函数
            setInputValue(''); // 清空输入框
        }
    };

    return (
        <div className="flex p-2.5"> {/* 使用flex和padding工具类 */}
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message or URL..."
                className="flex-grow mr-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" /* 替换所有内联样式并添加边框、圆角、焦点样式 */
            />
            <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50" /* 替换内联样式并添加背景色、悬停、焦点等交互样式 */
            >
                Submit
            </button>
        </div>
    );

};

export default InputBar;