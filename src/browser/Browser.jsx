import React, { useState } from 'react';
import { fetchWithProxy } from '../Tools/utils'
import FileIframe from './FileIframe';

const Browser = () => {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileContent, setFileContent] = useState('<h1>Hello, World!</h1>'); // 默认内容
    const [fileType, setFileType] = useState('text/html'); // 默认类型

    const onKeyDown = async (event) => {
        if (event.key === 'Enter') {
            // 在这里处理回车键按下的逻辑
            console.log('回车键被按下，输入的值是:', url);
            // 例如，可以清空输入框
            if (!/^https:\/\//.test(url)) {
                setError({ messsage: "需要是https开头" })
                return
            }


            try {
                setLoading(true);
                setError(null);

                const response = await fetchWithProxy(url, {
                    method: "GET",
                })

                if (!response.ok) {
                    setError({ message: response.statusText })
                }

                const html = await response.text();
                // const fileType = response.type; //cors
                const contentType = response.headers.get('Content-Type');

                // const blob = new Blob([html], { type: fileType });
                // const src = URL.createObjectURL(blob);
        
                setFileContent(html);
                setFileType(contentType);

            } catch (err) {
                setError(err)
            } finally {
                setLoading(false);
            }
        }

    }

    return (
        <div className="flex flex-col items-center h-full">
            <input
                type="text"
                value={url} // 将输入框的值绑定到状态
                onChange={e => setUrl(e.target.value)} // 更新状态
                onKeyDown={onKeyDown} // 或者使用 onKeyDown
                className={`border border-gray-300 p-2 rounded mb-2 w-full`} // 根据状态改变背景色
            />
            {loading && <div>加载中...</div>}
            {error && <div>错误: {JSON.stringify(error)}</div>}
            {!(loading || error) && <FileIframe fileContent={fileContent} fileType={fileType} />}

        </div>
    );

};

export default Browser;