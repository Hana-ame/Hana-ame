import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExImage from './ExImage';

const SComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname; // 获取当前路径
    // const searchParams = new URLSearchParams(location.search); // 获取查询参数

    // 示例：获取特定的查询参数
    // const paramValue = searchParams.get('paramName');

    // 状态管理：用于存储输入框的值
    const [inputValue, setInputValue] = useState('');

    // 处理输入框变化
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    // 处理提交
    const handleSubmit = (event) => {
        event.preventDefault(); // 防止表单默认提交
        navigate(`${inputValue}`); // 使用 navigate 改变 URL
    };


    useEffect(() => {
        // 当 location 变化时执行的操作
        console.log('Location has changed:', location.pathname);
    }, [location]); // 依赖项为 location



    return (
        <div>
            <h1>当前路径: {currentPath}</h1>
            {/* <h2>查询参数值: {paramValue}</h2> */}
            {/* <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="输入参数值"
                />
                <button type="submit">提交</button>
            </form> */}
            <ExImage path={currentPath} showNext={true} />
        </div>
    );
};

export default SComponent;