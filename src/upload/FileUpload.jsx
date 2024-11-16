import React, { useState, useCallback } from 'react';
import { UPLOAD_URL, uploadFileInChunks } from './consts';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [progress, setProgress] = useState([false]);
  const [link, setLink] = useState('');

  // 重置状态
  const resetState = () => {
    setFile(null);
    setUploading(false);
    setProgress(0);
    setMessage({ type: '', text: '' });
    setLink('');
  };

  // 验证文件
  const validateFile = (file) => {
    // const maxSize = 100 * 1024 * 1024; // 100MB
    // if (file.size > maxSize) {
    //   setMessage({ type: 'error', text: '文件大小不能超过100MB' });
    //   return false;
    // }
    return true;
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setMessage({ type: '', text: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'error', text: '请先选择一个文件' });
      return;
    }

    setUploading(true);
    setMessage({ type: '', text: '' });
    setProgress(0);

    try {
      const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('获取上传 URL 失败');
      }

      const data = await response.json();

      const context = await uploadFileInChunks(file, data.uploadUrl, setProgress);

      setMessage({ type: 'success', text: '文件上传成功！' });
      setLink(`https://upload.moonchan.xyz/api/${context.id}/${file.name}`);
    } catch (error) {
      console.error('上传失败:', error);
      setMessage({ type: 'error', text: '文件上传失败，请重试' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border border-gray-300 rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">文件上传</h2>
      
      <div className="mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-md file:border-0 
                     file:text-sm file:font-semibold 
                     file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100
                     focus:outline-none"
          disabled={uploading}
        />
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            已选择: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}
      </div>

      {uploading && (
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress / (file.size / 1024 / 1024) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-sm text-gray-600 text-right">
            {(progress / (file.size / 1024 / 1024) * 100).toFixed(2)}%
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`w-full py-2 px-4 rounded-md 
                   ${
                     uploading || !file
                       ? 'bg-gray-400 cursor-not-allowed'
                       : 'bg-blue-600 hover:bg-blue-700'
                   }
                   text-white font-semibold transition-colors`}
      >
        {uploading ? '上传中...' : '上传文件'}
      </button>

      {message.text && (
        <div className={`mt-3 p-3 rounded-md text-sm
                        ${
                          message.type === 'error'
                            ? 'bg-red-100 text-red-700'
                            : message.type === 'success'
                            ? 'bg-green-100 text-green-700'
                            : ''
                        }`}>
          {message.text}
        </div>
      )}

      {link && (
        <div className="mt-4">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 break-all text-sm"
          >
            {link}
          </a>
        </div>
      )}

      {/* <div className="flex flex-wrap">
        {progress.map((value, index) => (
          <div
            key={index}
            className={`w-5 h-5 ${value ? 'bg-green-500' : 'bg-red-500'} mx-2`}
          />
        ))}
      </div> */}


    </div>
  );
};

export default FileUpload;