
// 定义消息的类型
export type Message = {
    id: string; // 消息ID
    sender: string; // 发送者
    receiver: string; // 接收者
    payload: string; // 消息内容（加密或编码过）
  };
  