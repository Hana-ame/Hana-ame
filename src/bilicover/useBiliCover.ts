import { useState, useEffect } from 'react';
import createProxyFetch from '../utils/Proxy/ProxyFetch'; // 根据你的实际路径调整
import { API_ENDPOINTS } from './config';

// 实例化出签名与全局 fetch 一模一样的代理 fetch 函数
const proxyFetch = createProxyFetch(API_ENDPOINTS.PROXY_HOST);

/**
 * useBiliCover 自定义 Hook
 * 目的：抽象并复用获取 B 站封面的网络请求逻辑，包含请求、加载状态(loading)和错误处理(error)
 * 上下文：被 B23.tsx, BV.tsx, Live.tsx 调用，减少各组件中繁琐的 useEffect 重复代码。
 *
 * @param type 请求的类型 ('b23' | 'bv' | 'live')
 * @param id 对应的 B站视频 ID 或 直播间 ID 或 短链接尾号
 * @returns { data, loading, error } 返回请求到的核心数据、加载状态和错误信息
 */
export const useBiliCover = (type: string, id: string) => {
  const [data, setData] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    let processedId = id;
    if (type.toLocaleLowerCase() == "bv") {
        if (processedId.toUpperCase().startsWith("BV")) {
            processedId = processedId.substring(2);
        }
    }
    /**
     * fetchData 异步函数
     * 目的：执行实际的 API 请求并处理 JSON 响应数据格式
     */
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 拼接最新定义的配置 URL
        const targetUrl = `${API_ENDPOINTS.BILI_COVER_API}?type=${type}&id=${processedId}&client=${API_ENDPOINTS.CLIENT_VERSION}`;
        
        // 使用高阶函数生成的 proxyFetch（用法与原生 fetch 毫无区别，且支持自动代理和伪装 referer）
        const response = await proxyFetch(targetUrl, { 
          method: 'GET',
          // 如果某天接口要求校验 B站 referer，你可以直接在这里加，不会报错！
          // referrer: 'https://www.bilibili.com/' 
        });
        
        if (!response.ok) {
          throw new Error('网络请求异常: ' + response.statusText);
        }
        
        const jsonData = await response.json();
        if (!jsonData) {
          throw new Error("接口返回数据为空");
        }
        
        // 分离不同接口的返回参数处理
        if (type === 'b23') {
          if (!jsonData.result) throw new Error("结果中未找到 'result' 属性");
          setData(jsonData.result);
        } else {
          if (!jsonData.url) throw new Error("结果中未找到 'url' 属性");
          setData(jsonData.url);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '未知错误发生');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, id]); // 依赖项：当 type 或 id 改变时，重新发起请求

  return { data, loading, error };
};