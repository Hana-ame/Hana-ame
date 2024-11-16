export const UPLOAD_URL = "https://upload.moonchan.xyz/api/upload"

export async function uploadFileInChunks(file: File, endpoint: string) {
    let lastResponse;
    const chunkSize = 1024 * 1024; // 256 KB
    // const totalChunks = Math.ceil(file.size / chunkSize);
    for (let i = 0; i < file.size; i+=chunkSize) {
        const start = i;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end); // 获取文件块

        const contentRange = `bytes ${start}-${end - 1}/${file.size}`;
        const contentLength = chunk.size;

        try {
            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Length': contentLength.toString(),
                    'Content-Range': contentRange,
                },
                body: chunk,
            });

            if (!response.ok) {
                throw new Error(`上传失败: ${response.statusText}`);
            }

            // 如果是最后一个块，记录响应
            if (end >= file.size) {
                lastResponse = await response.json(); // 获取最后一个请求的 JSON 响应
            }


            console.log(`成功上传块 ${i + 1} / ${Math.ceil(file.size / chunkSize)}`);
        } catch (error) {
            console.error(error);
            break; // 发生错误时停止上传
        }
    }
        
    console.log('所有块上传完成');
    return lastResponse;
}

// async function uploadChunk(chunk: ,chunkSize: number, fileSize: number, endpoint: string) {
//     for (let i = 0; i < 10; i++) {
//         try {
//             const response = await fetch(endpoint, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Length': contentLength.toString(),
//                     'Content-Range': contentRange,
//                 },
//                 body: chunk,
//             });

//             if (!response.ok) {
//                 throw new Error(`上传失败: ${response.statusText}`);
//             }

//             console.log(`成功上传块 ${i + 1} / ${totalChunks}`);
//         } catch (error) {
//             console.error(error);
//             continue;
//         }

//     }
// }