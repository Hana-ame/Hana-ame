import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ExImage from './ExImage-DS';

const SComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname; // 获取当前路径
    // const searchParams = new URLSearchParams(location.search); // 获取查询参数
    const [className, setClassName] = useState('');

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

    const widthOptions = [
        { label: 'auto', value: 'max-w-auto' },
        { label: 'xs', value: 'max-w-xs' }, // 针对一些预定义的最大宽度 (需要自定义配置)
        { label: 'sm', value: 'max-w-sm' },
        { label: 'md', value: 'max-w-md' },
        { label: 'lg', value: 'max-w-lg' },
        { label: 'xl', value: 'max-w-xl' },
        { label: '2xl', value: 'max-w-2xl' },
        { label: '3xl', value: 'max-w-3xl' },
        { label: '4xl', value: 'max-w-4xl' },
        { label: '5xl', value: 'max-w-5xl' },
        { label: '6xl', value: 'max-w-6xl' },
        { label: '7xl', value: 'max-w-7xl' },
    ];


    return (
        <div className={className}>
            <h1 className='block-inline'>当前路径: {currentPath}</h1>
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
            {widthOptions.map(value => (
                <button className='px-6 py-3 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200'
                    key={value.label}
                    onClick={() => { setClassName(value.value) }}
                >
                    {value.label}
                </button>
            ))}
            <ExImage path={currentPath} showNext={true} />
        </div>
    );
};

export default SComponent;