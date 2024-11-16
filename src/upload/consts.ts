import React from "react";
import {worker} from '../Tools/concurrent/concurrent'


export const UPLOAD_URL = "https://upload.moonchan.xyz/api/upload"


export async function uploadFileInChunks(
    file: File, 
    endpoint: string, 
    setProgress: React.Dispatch<React.SetStateAction<number>>,
) {
    const MAX_CONCURRENT_UPLOADS = 1;
    const MAX_RETRIES = 3;
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

    // 上传单个分块的函数
    async function uploadChunk(i: number) {
        const start = i*CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const fileChunk = file.slice(start, end);

        let err: Error | null = null; // 允许 err 为 null
        for (let i=0; i<MAX_RETRIES; i++) {
            try {
                const response = await fetch(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Length': (start - end).toString(),
                        'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
                    },
                    body: fileChunk,
                });
    
                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }
    
                const responseData = await response.json() ;
                // process[i] = true
                setProgress((process: number)=>{ return process+1; })
                return responseData
            } catch (error) {
                err = error as Error
            }
        }

        if (err) {
            throw err
        }
    }


    const length = Math.ceil(file.size/CHUNK_SIZE)
    setProgress(0)

    const tasks = Array.from({ length: length }, (_, i) => async () => {
        return await uploadChunk(i);
    });

    const results = await Promise.all(
        Array.from({length: MAX_CONCURRENT_UPLOADS}, () => worker(tasks))
    )

    return results.flat().find(x => x.id)
}