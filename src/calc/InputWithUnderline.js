import React, { useState } from 'react';
import { myFormat } from './utils.ts';


// import { reverseString } from '@/Tools/utils'
const InputWithUnderline = ({ value, placeholder }) => {
    // const [inputValue, setInputValue] = useState('');
    const [isCopied, setIsCopied] = useState(false); // 新增状态

    // const handleChange = (e) => {
    //     setInputValue(e.target.value);
    // };

    // // 24-11-17
    // const reverseString = (str) => {
    //     return str.split('').reverse().join(''); // 反转字符串
    // };

    // const formatInputValue = (value) => {
    //     // 从右往左每隔 4 个字符插入一个下划线
    //     const reversed = reverseString(value);
    //     const formatted = reversed.replace(/(.{4})/g, '$1_'); // 每4个字符后插入下划线
    //     return reverseString(formatted).replace(/_$/, ''); // 反转并去掉最后一个下划线（如果存在）
    // };

  
    const copyToClipboard = () => {
        const formattedValue = myFormat(value);
        navigator.clipboard.writeText(formattedValue)
            .then(() => {
                // 输入框亮一下
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 200); // 1秒后恢复原样
            })
            .catch(err => {
                console.error("复制失败:", err);
            });
    };

    return (
        <input
            type="text"
            value={myFormat(value)}
            // onChange={handleChange}
            onClick={copyToClipboard}
            placeholder={placeholder}
            className={`border border-gray-300 p-2 rounded mb-2 w-full ${isCopied ? 'bg-green-200' : ''}`} // 根据状态改变背景色
        />
    );
};

export default InputWithUnderline;