// src/utils/encoding.ts
export function decodeBase64(str: string): string {
    try {
      // 兼容两种编码方式
      const decoded = atob(str.replace(/\s/g, ''));
      
      // 方案1：URIComponent 编码方式
      try {
        return decodeURIComponent(escape(decoded));
      } catch {
        // 方案2：TextDecoder 方式
        const bytes = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) {
          bytes[i] = decoded.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
      }
    } catch (error) {
      console.error('Base64 解码失败:', error);
      return '[无法解析的内容]';
    }
  }