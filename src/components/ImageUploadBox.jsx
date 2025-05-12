import React, { useRef, useState } from 'react';
import clsx from 'clsx';
// 假设你有一个名为 uploadFile 的函数，用于处理文件上传
// 这个函数应该接收一个 File 对象，并返回一个 Promise，
// Promise resolve 时带上图片的 URL。
// 例如：
// const uploadFile = async (file) => {
//   // 实际上传逻辑，例如使用 FormData 和 fetch/axios
//   console.log("Uploading file:", file.name);
//   // 模拟上传延迟
//   await new Promise(resolve => setTimeout(resolve, 2000));
//   // 模拟返回一个图片 URL
//   // 注意：在实际应用中，你需要一个真实的图片 URL
//   const dummyUrl = URL.createObjectURL(file); // 使用 createObjectURL 作为临时预览
//   console.log("Upload successful, URL:", dummyUrl);
//   return dummyUrl;
// };
import { uploadFile } from '../utils/upload';

const ImageUploadBox = ({ emit = (url = "") => { } }) => { // 接受 uploadFile 函数作为 prop

    // console.log(uploadfile);

    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    // uploadedImageUrl 现在用于存储上传成功后的图片 URL，用于<img>的src
    const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
    const [error, setError] = useState(null);

    // 处理文件输入框变化 或 拖拽释放
    const handleFileSelect = async (file) => {
        if (file && uploadFile) {
            setSelectedFile(file);
            setUploadedImageUrl(null); // 清除之前的图片/错误
            setError(null);
            setIsUploading(true);

            try {
                const url = await uploadFile(file);
                setUploadedImageUrl(url); // 设置上传成功后的 URL
                setSelectedFile(null); // 清除选中的文件对象    
                emit(url);
            } catch (err) {
                console.error("Upload failed:", err);
                setError("文件上传失败");
                setUploadedImageUrl(null);
                setSelectedFile(null);
            } finally {
                setIsUploading(false);
            }
        } else if (!uploadFile) {
             console.error("uploadFile function is not provided.");
             setError("缺少上传处理函数");
        }
    };

    // 处理文件输入框变化（用户点击选择文件）
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleFileSelect(file);
        event.target.value = null; // 清空 input 的 value
    };

    // 处理方框点击事件
    const handleBoxClick = () => {
        if (!isUploading) {
            fileInputRef.current.click();
        }
    };

    // 处理拖拽事件：当文件拖拽到方框上方时
    const handleDragOver = (event) => {
        event.preventDefault();
        if (!isUploading) {
           setIsDragging(true);
        }
    };

    // 处理拖拽事件：当文件离开方框时
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // 处理拖拽事件：当文件在方框内释放时
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        if (!isUploading) {
            const file = event.dataTransfer.files[0];
            handleFileSelect(file);
        }
    };

    // 使用 clsx 构建 className
    const boxClassName = clsx(
        // 基础布局和尺寸
        "flex flex-col items-center justify-center", // 仍然需要居中内部内容
        "w-full h-full p-6",
        "border-2 border-dashed rounded-lg",
        "transition-colors duration-200 ease-in-out",
        // "overflow-hidden", // 当显示内部<img>时，可能不需要这个，除非内容真的溢出

        // 条件类名对象
        {
            // 默认外观 (边框, 背景, 悬停效果) - 仅在没有特定状态覆盖时应用
            // Note: The default background is needed when there's no image
            "border-gray-400 bg-white hover:border-blue-500 hover:bg-gray-50":
               !isUploading && !isDragging && !error && !uploadedImageUrl,

            // 光标样式
            "cursor-pointer": !isUploading, // 默认光标，除非上传中
            "cursor-not-allowed": isUploading, // 上传中时禁用光标

            // 状态相关的边框/背景颜色 (更高优先级的条件放在后面)
            "border-blue-500 bg-blue-50": isUploading || isDragging, // 上传中或拖拽中 (最高视觉优先级)
            "border-red-500 bg-red-50": error && !(isUploading || isDragging), // 错误 (高优先级，低于上传/拖拽)
            // 当有 uploadedImageUrl 时，我们可以设置一个绿色边框，但背景由默认或拖拽/上传状态决定
            "border-green-500": uploadedImageUrl && !(isUploading || isDragging) && !error, // 上传成功有图片时 (中等优先级，仅边框)
            // bg-green-50 移除了，因为背景不是图片
        }
    );

    return (
        // 外层容器：使用 Flexbox 居中所有内容，并占满视口高度
        <div className="flex flex-1 items-center justify-center bg-gray-100">
            {/* 上传方框 */}
            <div
                className={boxClassName} // 使用 clsx 生成的类名
                onClick={handleBoxClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* 隐藏的文件输入框 */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*" // 限制文件类型为图片
                />

                {/* 方框内的内容：根据状态显示不同内容 */}
                {isUploading ? (
                    // 上传中显示
                    <div className="flex flex-col items-center text-center">
                         <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2.049-2.049z"></path>
                        </svg>
                        <p className="mt-2 text-sm text-blue-600">上传中...</p>
                        {/* 如果需要，可以在这里显示文件名或其他信息 */}
                         {/* {selectedFile && <p className="mt-1 text-xs text-gray-500 truncate w-full text-center">{selectedFile.name}</p>} */}
                    </div>
                ) : error ? (
                     // 错误时显示
                    <div className="flex flex-col items-center text-center text-red-600">
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-sm">{error}</p>
                         <p className="mt-1 text-xs text-gray-500">点击重试</p>
                    </div>
                ) : uploadedImageUrl ? (
                     // 上传成功有图片时，显示图片
                     <img
                         src={uploadedImageUrl}
                         alt="Uploaded preview"
                         // 使用 max-w-full 和 max-h-full 确保图片不超出父容器
                         // object-contain 确保图片保持长宽比并完整显示在容器内
                         className="max-w-full max-h-full object-contain"
                     />
                ) : (
                     // 默认状态：没有上传，没有图片，没有错误
                     <>
                        {/* 一个简单的上传图标 */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">拖拽图片到此处</p>
                        <p className="mt-1 text-xs text-gray-500">或点击选择文件</p>
                     </>
                )}
            </div>
        </div>
    );
};

export default ImageUploadBox;