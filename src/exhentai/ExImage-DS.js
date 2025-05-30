// 能用，但不想改了
import React, { useEffect, useState } from "react";
import { delay } from "@/Tools/utils.ts";

const ExImage = ({ path, showNext }) => {
    // 基础域名配置
    const host = "https://ehwv.moonchan.xyz";

    // 组件状态管理
    const [imageSrc, setImageSrc] = useState(null);        // 当前图片地址
    const [onErrorPath, setOnErrorPath] = useState(null);  // 错误备用路径
    const [nextPath, setNextPath] = useState(null);        // 下一页路径
    const [error, setError] = useState(null);              // 错误信息
    const [retryCount, setRetryCount] = useState(0);       // 重试计数器
    const [timerId, setTimerId] = useState(-1);            // 超时定时器ID
    const [abort, setAbort] = useState(false);             // 中止加载标志
    const [loaded, setLoaded] = useState(false);           // 加载完成状态
    
    // 配置参数
    const maxRetries = 3000;  // 最大重试次数（可能需要调整）

    // DOM解析工具函数
    const extractImageSrc = (doc) => doc.getElementById("img")?.src;
    const extractOnErrorPath = (doc) => {
        const element = doc.getElementById("loadfail");
        const onclickHandler = element?.getAttribute('onclick') || '';
        const pathParam = onclickHandler.replace(/^return nl\('/, "").replace(/'\)$/, "");
        
        const url = new URL(path, host);
        url.searchParams.append("nl", pathParam);
        return url.pathname + url.search;
    };
    const extractNextPath = async (doc) => {
        try {
            const url = new URL(doc.getElementById("next")?.href || '');
            // await delay(1000);  // 人为延迟防止请求风暴
            return url.pathname;
        } catch {
            return null;
        }
    };

    // 核心数据获取逻辑
    useEffect(() => {
        const fetchHtml = async () => {
            if (abort) return;

            try {
                // 获取页面HTML
                const response = await fetch(host + path);
                if (!response.ok) throw new Error("请求失败");
                
                // 解析DOM元素
                const doc = new DOMParser().parseFromString(
                    await response.text(),
                    "text/html"
                );

                // 提取关键路径
                setImageSrc(extractImageSrc(doc));
                setOnErrorPath(extractOnErrorPath(doc));
                extractNextPath(doc).then(setNextPath);
                
                // 设置10秒超时检测
                if (timerId >= 0) clearInterval(timerId);
                setTimerId(setInterval(() => setError("加载超时"), 10000));

            } catch (err) {
                setError(err.message);
                if (retryCount < maxRetries) setRetryCount(v => v + 1);
            }
        };

        fetchHtml();
        return () => clearInterval(timerId);  // 清理定时器
    }, [path, retryCount, abort]);

    // 渲染逻辑
    return (
        <>
            {/* 主内容显示区 */}
            {!abort && imageSrc && (
                <div className="image-container">
                    <img
                        className="w-full"
                        src={imageSrc}
                        alt="加载失败，请点击重新加载并等待至多10秒"
                        onLoad={() => {
                            clearInterval(timerId);
                            setLoaded(true);
                        }}
                        onError={() => setError("图片加载失败")}
                    />
                    
                    {/* 加载中状态显示 */}
                    {!loaded && <div className="loading-controls">
                        <button
                            onClick={() => setAbort(true)}
                            // className="reload-button"
                            className="px-6 py-3 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                        >
                            重新加载
                        </button>
                        <a href={host + path} className="source-link">
                            {host + path}
                        </a>
                    </div>}
                </div>
            )}

            {/* 错误降级显示 */}
            {abort && onErrorPath && !nextPath && (
                <ExImage path={onErrorPath} showNext={false} />
            )}

            {/* 自动分页显示 */}
            {showNext && nextPath && nextPath !== path && (
                <ExImage path={nextPath} showNext={true} />
            )}
        </>
    );
};

export default ExImage;