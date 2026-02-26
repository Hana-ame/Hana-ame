// 文件路径: src/bilicover/config.ts

/**
 * 配置文件：用于存放 B站封面获取模块 的全局设置和 API 接口端点
 * 目的：当 API 地址失效、被墙或需要更换时，只需要修改本文件即可，避免在组件中硬编码查找。
 */
export const API_ENDPOINTS = {
  // B站封面获取的代理 API 端点
  BILI_COVER_API: "https://apiv2.magecorn.com/bilicover/get",
  
  PROXY_HOST: "proxy.moonchan.xyz",
  CLIENT_VERSION: "2.6.1",

  // --- 新增：月岛 (Moonchan) 相关接口配置 ---
  // 注意：此处请填入你实际炸掉前使用的后端接口路径
  MOONCHAN_POST_URL_1: "https://moonchan.xyz/api/v2/?bid=104&tid=135803", 
  MOONCHAN_POST_URL_2: "https://moonchan.xyz/api/v2/random?table=bilicover",

  TID: "135803",
};