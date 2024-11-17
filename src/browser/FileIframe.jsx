import React, { useEffect, useRef } from 'react';

const FileIframe = ({ fileContent, fileType }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        // 创建blob URL
        const blob = new Blob([fileContent], { type: fileType });
        const url = URL.createObjectURL(blob);

        // 设置iframe的src为blob URL
        if (iframeRef.current) {
            iframeRef.current.src = url;
        }

        // 清理工作
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [fileContent, fileType]);

    return (
        <iframe
            ref={iframeRef}
            width="100%"
            height="100%"
            title="File Iframe"
            sandbox="allow-same-origin allow-scripts" // 根据需要设置 sandbox 属性
        />
        // <div dangerouslySetInnerHTML={{ __html: fileContent }} />

    );
};

// // 示例使用
// const App = () => {
//     const fileContent = `<h1>Hello, World!</h1><p>This is a test.</p>`; // 示例内容
//     const fileType = 'text/html'; // 文件类型

//     return (
//         <div>
//             <h1>通过文件内容显示 Iframe</h1>
//             <FileIframe fileContent={fileContent} fileType={fileType} />
//         </div>
//     );
// };

export default FileIframe;