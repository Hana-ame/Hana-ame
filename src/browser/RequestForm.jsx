import React, { useState } from 'react';
import { fetchWithProxy } from '../Tools/Proxy/utils';

const RequestForm = () => {
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('');
    const [useProxy, setUseProxy] = useState(false);
    const [headers, setHeaders] = useState([{ key: '', value: '' }]);
    const [body, setBody] = useState('');
    const [response, setResponse] = useState({
        body: '这是响应的主体内容。',
        headers: '这是响应的头部信息。',
    });
    const [showBody, setShowBody] = useState(true); // 默认显示 Body

    const handleAddHeader = () => {
        setHeaders([...headers, { key: '', value: '' }]);
    };

    const handleHeaderChange = (index, field, value) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
    };

    const handleSubmit = async () => {
        // 发送请求的逻辑
        console.log('Sending request:', { method, url, useProxy, headers, body });
        // TODO: 使用 fetch 或 axios 发送请求并处理响应
        try {
            let requestHeaders = {}
            headers.map(header => { if (header.key) requestHeaders[header.key] = header.value })
            let response
            if (useProxy) {
                response = await fetchWithProxy(url, {
                    method: method,
                    headers: requestHeaders,
                    body: method === "GET" ? null : body,
                })
            } else {
                response = await fetch(url, {
                    method: method,
                    headers: requestHeaders,
                    body: method === "GET" ? null : body,
                })
            }
            let respHeaders = {}
            response.headers.forEach((v, k) => { respHeaders[k] = v })
            setResponse({
                headers: respHeaders,
                body: await response.text(),
            })
        } catch (err) {
            console.log(err)
        }
    };

    return (
        <div className="p-4">
            <div className="flex mb-4">
                <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="border rounded p-2 mr-2"
                >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL"
                    className="border rounded p-2 flex-grow mr-2"
                />
                <label className="flex items-center mr-4">
                    <input
                        type="checkbox"
                        checked={useProxy}
                        onChange={(e) => setUseProxy(e.target.checked)}
                    />
                    Use Proxy
                </label>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white rounded p-2"
                >
                    Send Request
                </button>
            </div>
            <div className="mb-4">
                {headers.map((header, index) => (
                    <div key={index} className="flex mb-2">
                        <input
                            type="text"
                            value={header.key}
                            onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                            placeholder="Header"
                            className="border rounded p-2 mr-2"
                        />
                        <input
                            type="text"
                            value={header.value}
                            onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="border rounded p-2 mr-2 flex-1"
                        />
                    </div>
                ))}
                <button
                    onClick={handleAddHeader}
                    className="bg-green-500 text-white rounded p-2"
                >
                    Add Header
                </button>
            </div>
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Request Body"
                className="border rounded p-2 w-full h-32 mb-4"
            />
            <div className="border rounded p-4 bg-gray-100 mt-4">
                <h3 className="font-bold">Response:</h3>
                <div className="mb-2">
                    <button
                        onClick={() => setShowBody(!showBody)}
                        className={`mr-2 p-2 rounded ${showBody ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                        显示 Body
                    </button>
                    <button
                        onClick={() => setShowBody(!showBody)}
                        className={`p-2 rounded ${!showBody ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                    >
                        显示 Header
                    </button>
                </div>
                <pre>
                    {showBody ? response.body : JSON.stringify(response.headers, null, 2)}
                </pre>
            </div>

        </div>
    );
};

export default RequestForm;