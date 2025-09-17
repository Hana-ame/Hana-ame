import React, { useEffect, useState, useRef, useCallback } from "react";

const ExImage = ({ path, showNext }) => {
    // 基础域名配置
    const host = "https://ehwv.moonchan.xyz"; // 确保host是协议+域名，不带尾部斜杠

    // 组件状态管理
    const [imageSrc, setImageSrc] = useState(null);
    const [onErrorPath, setOnErrorPath] = useState(null);
    const [nextPath, setNextPath] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const timeoutIdRef = useRef(null); // 使用ref存储timeout ID
    const [loaded, setLoaded] = useState(false); // 图片加载完成状态 (指<img>标签)

    // 配置参数
    const maxRetries = 3; // 合理的重试次数

    // DOM解析工具函数
    const extractImageSrc = (doc) => doc.getElementById("img")?.src;

    // 使用 useCallback 避免不必要的函数重建
    const extractOnErrorPath = useCallback((doc) => {
        const element = doc.getElementById("loadfail");
        const onclickHandler = element?.getAttribute('onclick') || '';
        const pathParam = onclickHandler.replace(/^return nl\('/, "").replace(/'\)$/, "");

        if (pathParam) {
            const url = new URL(path, host);
            url.searchParams.set("nl", pathParam);
            return url.pathname + url.search + url.hash;
        }
        return null;
    }, [path, host]); // 依赖项

    // 使用 useCallback 避免不必要的函数重建
    const extractNextPath = useCallback((doc) => {
        try {
            let nextLink = doc.getElementById("next")?.href;
            if (!nextLink) {
                console.log("[ExtractNextPath] nextLink is null or empty from DOM.");
                return null;
            }

            console.log("[ExtractNextPath] Original nextLink from DOM:", nextLink);

            // **核心修复：使用正则表达式强制提取预期路径**
            // 假设下一页链接的路径部分总是以 /s/ 开头，
            // 后接一串十六进制字符 ( galleryId )，然后是 /，再接数字-数字 ( imageId-page )。
            // 例如: /s/370175d071/3375766-2
            const pathRegex = /(\/s\/[a-f0-9]+\/\d+-\d+(?:\?.*)?(?:#.*)?)/; // 匹配 /s/path 并包含可选的查询参数和哈希
            const match = nextLink.match(pathRegex);

            if (match && match[1]) {
                const extractedPath = match[1];
                console.log("[ExtractNextPath] Successfully extracted path using regex:", extractedPath);

                // 此时 extractedPath 已经是 '/s/...' 格式了，可以安全地与 host 拼接
                // 但为了统一性，我们仍然使用 URL 构造器来确保它是一个有效的相对路径。
                const url = new URL(extractedPath, host);
                const finalPath = url.pathname + url.search + url.hash;

                console.log("[ExtractNextPath] Final nextPath after regex & URL construction:", finalPath);

                // 最后一步：确保 finalPath 不是当前 path，避免无限递归
                if (finalPath === path) {
                    console.warn(`[ExtractNextPath] Extracted nextPath is same as current path (${finalPath}). Skipping.`);
                    return null;
                }

                return finalPath;
            } else {
                console.warn("[ExtractNextPath] Could not extract a valid /s/ path using regex from nextLink:", nextLink);
                // 如果正则匹配失败，可能是其他不期望的格式
                return null;
            }

        } catch (e) {
            console.error("[ExtractNextPath] Critical error in extractNextPath:", e);
            return null;
        }
    }, [host, path]); // 依赖项中添加 path，用于 nextPath !== path 的判断

    // 核心数据获取逻辑
    useEffect(() => {
        const controller = new AbortController(); // 用于取消fetch请求
        const signal = controller.signal;

        const fetchData = async () => {
            setError(null);           // 清理之前的错误
            setLoaded(false);         // 重置图片加载状态
            setImageSrc(null);        // 清空当前图片，避免显示旧图

            if (retryCount >= maxRetries) {
                setError(`达到最大重试次数 (${maxRetries})，请检查网络或稍后重试。`);
                console.warn("[FetchData] Max retries reached for path:", path);
                return; // 停止进一步尝试
            }

            // 清理之前的超时定时器
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
                console.log("[FetchData] Cleared previous timeout.");
            }

            // 设置超时定时器 (使用 setTimeout)
            timeoutIdRef.current = setTimeout(() => {
                setError("加载超时，请检查网络");
                controller.abort(); // 超时时取消fetch请求
                console.warn("[FetchData] Fetch timed out for path:", host + path);
            }, 15000); // 增加超时时间到15秒

            try {
                const fullUrl = host + path;
                console.log("[FetchData] Fetching URL:", fullUrl, "Attempt:", retryCount + 1);

                const response = await fetch(fullUrl, { signal });

                // 请求成功，清除定时器
                if (timeoutIdRef.current) {
                    clearTimeout(timeoutIdRef.current);
                    timeoutIdRef.current = null;
                    console.log("[FetchData] Fetch successful, cleared timeout.");
                }

                if (!response.ok) {
                    throw new Error(`请求失败，状态码: ${response.status}`);
                }

                const responseText = await response.text();
                // 仅在需要调试时打印整个响应HTML，生产环境慎用，可能过大
                // console.log("[FetchData] Full HTML Response (for debugging):", responseText);

                const doc = new DOMParser().parseFromString(
                    responseText,
                    "text/html"
                );

                setImageSrc(extractImageSrc(doc));
                setOnErrorPath(extractOnErrorPath(doc));
                setNextPath(extractNextPath(doc)); // 这会触发 extractNextPath 中的 console.log

                console.log("[FetchData] Data extraction complete for path:", path);
                console.log("[FetchData] Final imageSrc:", extractImageSrc(doc));
                console.log("[FetchData] Final onErrorPath:", extractOnErrorPath(doc));
                // nextPath 已在 extractNextPath 中打印，无需重复

            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('[FetchData] Fetch aborted (timeout or manual).');
                    // 错误信息已由定时器设置，或由cleanup触发
                } else {
                    setError(err.message || "未知错误");
                    console.error("[FetchData] Fetch error for path:", host + path, err);
                }
                // 增加重试计数，触发下一次useEffect运行（如果retryCount < maxRetries）
                setRetryCount(prev => prev + 1);
            }
        };

        fetchData();

        // 清理函数：组件卸载或effect重新运行时清除定时器和取消请求
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
                timeoutIdRef.current = null;
                console.log("[Cleanup] Cleared timeout.");
            }
            // 无论fetch是否完成，都尝试中止。
            // 这确保了当组件卸载或依赖项改变时，任何悬而未决的请求都被取消。
            // 如果请求已经完成，abort()是无害的。
            controller.abort();
            console.log("[Cleanup] Aborted ongoing fetch if any.");
        };
    }, [path, retryCount, host, maxRetries, extractOnErrorPath, extractNextPath]); // 依赖项中添加所有使用的函数和变量

    // 处理图片加载失败的回调
    const handleImageError = () => {
        setError("图片文件加载失败");
        setLoaded(false); // 确保加载状态为 false
        console.error("[ImageLoad] Image element failed to load:", imageSrc);
        // 如果当前图片加载失败，考虑是否需要重试或显示备用图片。
        // 不在这里自动重试HTML fetch，因为HTML本身可能已成功获取。
        // 如果想在图片加载失败时尝试加载 onErrorPath，可以在这里增加逻辑
    };

    // 重新加载按钮的点击事件
    const handleReload = () => {
        console.log("[UserAction] Reloading current path:", path);
        setError(null);           // 清除错误信息
        setImageSrc(null);        // 清空当前图片，强制重新渲染
        setLoaded(false);         // 重置加载状态
        setRetryCount(0);         // 重置重试计数器，从头开始尝试
        setOnErrorPath(null);     // 清空备用路径
        setNextPath(null);        // 清空下一页路径
        // 由于 retryCount 被重置，useEffect 会重新触发 fetchData
    };

    // 渲染逻辑
    return (
        <div className={`flex flex-col items-center justify-center p-4`}>
            {/* 加载中/错误/图片显示区 */}
            {imageSrc ? (
                <div className="image-container w-full max-w-screen-lg">
                    <img
                        className="w-full h-auto object-contain"
                        src={imageSrc}
                        alt={error || "图片加载中或加载失败"}
                        onLoad={() => {
                            if (timeoutIdRef.current) { // 图片加载成功，清除超时定时器
                                clearTimeout(timeoutIdRef.current);
                                timeoutIdRef.current = null;
                                console.log("[ImageLoad] Image loaded successfully, cleared timeout.");
                            }
                            setLoaded(true);
                            setError(null); // 图片加载成功，清除任何之前的错误
                            console.log("[ImageLoad] Image loaded successfully:", imageSrc);
                        }}
                        onError={handleImageError}
                    />

                    {/* 加载中状态显示 */}
                    {!loaded && (
                        <div className="loading-overlay flex flex-col items-center justify-center p-4">
                            <p className="text-gray-600 mb-2">正在加载图片...</p>
                            <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500 border-t-transparent"></div>
                        </div>
                    )}
                </div>
            ) : (
                // 初始状态或图片SRC为空时显示
                <div className="status-message p-4 text-center">
                    {error ? (
                        <p className="text-red-600 font-semibold mb-4">{error}</p>
                    ) : (
                        <p className="text-gray-600 mb-4">正在获取图片信息...</p>
                    )}
                    <button
                        onClick={handleReload}
                        className="px-6 py-3 bg-blue-500 text-white font-bold rounded shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 mr-2"
                    >
                        重新加载当前页
                    </button>
                    {onErrorPath && (
                        <button
                            onClick={() => {
                                console.log("[UserAction] Attempting to load onErrorPath:", host + onErrorPath);
                                // 如何处理 onErrorPath 取决于你的需求：
                                // 1. 如果 ExImage 作为一个独立的图片加载器，可以将 onErrorPath 作为新的 path prop 传递给它。
                                // 2. 如果希望当前组件直接加载备用路径，你需要改变组件的 path state。
                                //    例如，如果 path 是由 useState 管理的：setPath(onErrorPath);
                            }}
                            className="px-6 py-3 bg-yellow-500 text-white font-bold rounded shadow hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200"
                        >
                            加载备用路径
                        </button>
                    )}
                    <a href={host + path} target="_blank" rel="noopener noreferrer" className="block mt-4 text-sm text-blue-500 hover:underline">
                        查看原始页面 ({host + path})
                    </a>
                </div>
            )}

            {/* 自动分页显示 (递归渲染) */}
            {/* 仅当 showNext 为 true，nextPath 存在且不同于当前 path，并且当前图片已加载成功时才渲染下一页 */}
            {showNext && nextPath && nextPath !== path && loaded && (
                <ExImage path={nextPath} showNext={true} />
            )}
        </div>
    );
};

export default ExImage;