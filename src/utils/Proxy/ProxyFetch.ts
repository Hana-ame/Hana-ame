// 文件路径: Tools/Proxy/ProxyFetch.ts

/**
 * createProxyFetch - 代理 Fetch 工厂函数
 * 目的：生成一个接口签名与原生 fetch 完全保持一致的函数，可以作为 drop-in replacement 替代默认 fetch。
 * 上下文：由于被墙或跨域问题，将请求通过制定的 Proxy Endpoint (如 ex.moonchan.xyz) 进行转发。
 * 
 * @param endpoint 代理服务器的主机名
 * @returns {typeof fetch} 返回一个符合原生 fetch 签名的异步请求函数
 */
export default function createProxyFetch(endpoint: string): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let requestUrl: string;

    // 1. 规范化处理传入的 input (支持 string, URL 或 Request 对象)
    if (typeof input === 'string') {
      requestUrl = input;
    } else if (input instanceof URL) {
      requestUrl = input.toString();
    } else {
      // 若传入的是一个 Request 对象，拆解它
      requestUrl = input.url;
      init = {
        method: input.method,
        headers: input.headers,
        body: input.body,
        mode: input.mode,
        credentials: input.credentials,
        cache: input.cache,
        redirect: input.redirect,
        referrer: input.referrer,
        integrity: input.integrity,
        ...init, // 优先使用新传入的 init 配置覆盖
      };
    }

    const originalUrl = new URL(requestUrl);

    // 2. 构建新的目标URL：使用 https 协议和指定的 endpoint 主机
    const targetUrl = new URL(originalUrl.href);
    targetUrl.protocol = 'https:';
    targetUrl.host = endpoint;

    // 3. 准备请求配置
    const requestInit: RequestInit = { ...init };

    // 4. 处理 headers，增加代理所需的标识
    const headers = new Headers(requestInit.headers);
    headers.set('X-Host', originalUrl.hostname);
    headers.set('X-Scheme', originalUrl.protocol.replace(':', '')); // 移除末尾的冒号

    requestInit.headers = headers;

    // 5. 就像用原生 fetch 一样发起请求
    return fetch(targetUrl.toString(), requestInit);
  };
}