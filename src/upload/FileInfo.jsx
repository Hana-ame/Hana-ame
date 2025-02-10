import React, { useState, useEffect } from 'react';

const FileInfo = ({ file }) => {
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, done, error
  const [fileUrl, setFileUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file]); // 当 file 发生变化时自动触发上传

  if (!file) {
    return <div>没有选择文件</div>;
  }

  // 上传文件
  const handleUpload = async () => {
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const response = await fetch('https://wsl.moonchan.xyz/api/files/upload', {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const data = await response.json();
      setFileUrl(`https://chat.moonchan.xyz/api/files/${data.id}/${file.name}`);
      setUploadStatus('done');
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error.message);
    }
  };

  // 复制链接到剪贴板
  const handleCopyLink = () => {
    if (fileUrl) {
      navigator.clipboard.writeText(fileUrl).then(() => {
        // alert('链接已复制到剪贴板！');
      });
    }
  };

  // 文件大小格式化
  const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="p-6 max-w mx-auto bg-white rounded-xl shadow-md space-y-4">
      <ul className="list-disc ml-5 space-y-2">
        <li>文件名: <span className="font-mono">{file.name}</span></li>
        <li>文件类型: <span className="font-mono">{file.type || '未知'}</span></li>
        <li>文件大小: <span className="font-mono">{fileSizeInMB} MB</span></li>
      </ul>

      {/* 上传状态显示 */}
      <div className="flex items-center space-x-4">
        {uploadStatus === 'uploading' && (
          <span className="text-blue-500">上传中...</span>
        )}

        {uploadStatus === 'done' && (
          <div className="flex items-center space-x-2">
            <span className="text-green-500">上传成功！</span>
            <a
              href={fileUrl}
              download
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              下载文件
            </a>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              复制链接
            </button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <span className="text-red-500">{errorMessage}</span>
        )}
      </div>
    </div>
  );
};

export default FileInfo;