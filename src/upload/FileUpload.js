import React, { useState } from 'react';
import { UPLOAD_URL, uploadFileInChunks } from './consts';


const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('请先选择一个文件。');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage('');

        try {
            const response = await fetch(UPLOAD_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type, // 设置 MIME 类型
                },            
            });

            if (!response.ok) {
                throw new Error('文件上传失败');
            }

            const data = await response.json();

            console.log(data); // 打印服务器响应

            const context = await uploadFileInChunks(file, data.uploadUrl)

            setMessage('文件上传成功！');
            setLink(`https://upload.moonchan.xyz/api/`+context.id+`/`+file.name);
            
        } catch (error) {
            console.error('上传失败:', error);
            setMessage('文件上传失败，请重试。');
        } finally {
            // setUploading(false);
        }

    };

    return (
        <div className="max-w-md mx-auto p-4 border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">文件上传</h2>
            <input 
                type="file" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 
                           file:mr-4 file:py-2 file:px-4 
                           file:rounded-md file:border-0 
                           file:text-sm file:font-semibold 
                           file:bg-blue-50 file:text-blue-700 
                           hover:file:bg-blue-100"
            />
            <button 
                onClick={handleUpload} 
                disabled={uploading} 
                className={`mt-4 w-full py-2 rounded-md 
                            ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
                            text-white font-semibold`}
            >
                {uploading ? '上传中...' : '上传文件'}
            </button>
            {message && <p className="mt-2 text-red-500">{message}</p>}
            {link && <a className="mt-2 text-red-500" href={link}>{link}</a>}
        </div>
    );
};

export default FileUpload;