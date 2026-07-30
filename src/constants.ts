export const STORAGE_KEYS = {
  endpointUrl: "ai_chat_pro_endpoint_url",
  apiKey: "ai_chat_pro_api_key",
  jsonPayload: "ai_chat_pro_json_payload",
  chatHistory: "ai_chat_pro_chat_history",
};

export const DEFAULT_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions";

export const DEFAULT_JSON_PAYLOAD = JSON.stringify(
  {
    model: "deepseek-ai/DeepSeek-V3",
    messages: [],
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1,
    stream: true,
  },
  null,
  2,
);

export const getFinishReasonMessage = (reason: string | null): string => {
  if (!reason) return "";
  switch (reason) {
    case "stop":
      return "正常停止：模型完成了回复";
    case "length":
      return "长度限制：达到了最大token限制，回复可能不完整";
    case "content_filter":
      return "内容过滤：因内容安全策略而停止";
    case "tool_calls":
      return "工具调用：需要调用外部工具";
    case "function_call":
      return "函数调用：需要调用函数";
    default:
      return `停止原因：${reason}`;
  }
};
