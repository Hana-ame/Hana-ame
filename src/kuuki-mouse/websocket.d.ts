// // 声明模块，匹配 './websocket.js' 文件
// declare module './websocket.js' {
//     // 假设 websocket.js 导出了一个创建连接的函数和一个变量
//     export function createWebSocketConnection(url: string): [(string) => void, (string) => void, (string) => void, (string) => void, WebSocket];
//     // export const websocketVersion: string;
//     // 根据实际导出内容添加其他声明
// }
export function createWebSocketConnection(url: string,
    onLog: (msg: string) => void,
    onClose: (msg: string) => void
): {
    onMouse: (key: string) => void,
    onText: (key: string) => void,
    onKeyDown: (key: string) => void,
    onKeyUp: (key: string) => void,
    socket: WebSocket,
};