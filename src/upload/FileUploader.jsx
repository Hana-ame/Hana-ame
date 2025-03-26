import { useState } from 'react';
import FileInfo from './FileInfo';

export default function IFrame() {
  return <iframe
    src="https://chat.moonchan.xyz/api/files/upload"
    className="w-full h-full flex-grow border-0"
    title="Content"
  />

}

export function FileUploader() {
  const [files, setFiles] = useState([]);
  // const [uploadResults, setUploadResults] = useState([]);

  // 处理文件选择
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    // await uploadFiles(selectedFiles);
  };

  // 上传所有文件
  // const uploadFiles = async (filesToUpload) => {
  //   const uploadPromises = filesToUpload.map(async (file) => {
  //     const result = {
  //       id: null,
  //       fileName: file.name,
  //       status: 'uploading',
  //       error: null
  //     };

  //     try {
  //       const response = await fetch('https://chat.moonchan.xyz/api/files/upload', {
  //         method: 'PUT',
  //         body: file,
  //         headers: {
  //           'Content-Type': file.type,
  //         },
  //       });

  //       if (!response.ok) throw new Error('Upload failed');

  //       const data = await response.json();
  //       result.status = 'done';
  //       result.id = data.id;
  //     } catch (error) {
  //       result.status = 'error';
  //       result.error = error.message;
  //     }

  //     return result;
  //   });

  //   // 更新上传结果
  //   const results = await Promise.all(uploadPromises);
  //   setUploadResults(results);
  // };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 文件上传区域 */}
      <label className="block mb-8">
        <span className="sr-only">选择上传文件</span>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </label>

      {files.map((file, index) => {
        console.log(file)
        return <FileInfo key={index} file={file}></FileInfo>
      })}
      {/* 上传结果列表 */}
      {/* 
      {uploadResults.length > 0 && (
        <div className="space-y-4">
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{result.fileName}</span>
                <StatusBadge status={result.status} />
              </div>

              {result.status === 'done' && (
                <a
                  href={`https://chat.moonchan.xyz/api/files/${result.id}/${result.fileName}`}
                  download
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  下载
                </a>
              )}
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}

// 状态标记组件
// function StatusBadge({ status }) {
//   const statusConfig = {
//     uploading: {
//       text: '上传中...',
//       color: 'bg-yellow-100 text-yellow-800',
//     },
//     done: {
//       text: '上传成功',
//       color: 'bg-green-100 text-green-800',
//     },
//     error: {
//       text: '上传失败',
//       color: 'bg-red-100 text-red-800',
//     },
//   };

//   const { text, color } = statusConfig[status] || {};

//   return (
//     <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
//       {text}
//     </span>
//   );
// }