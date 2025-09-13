import { useState, useEffect, useRef } from "react";
import ModeSelector from "./ModeSelector";
import MousePad from "./MousePad";
import Keyboard from "./KeyBoard";
import TextAreaWithButton from "./TextAreaWithButton";
import { createWebSocketConnection } from "./websocket.js";

// 假设 createWebSocketConnection 是一个返回事件处理函数和 socket 实例的函数
// 其具体实现可能因您的项目而异
export default function App({ url = "/ws" }) {
    const [error, setError] = useState("");
    const [mode, setMode] = useState("");
    // 使用 useRef 来持久化存储 socket 实例，避免组件重新渲染时其值被重置
    const socketRef = useRef<WebSocket | null>(null);
    // 同样使用 useRef 来存储事件处理函数，确保其引用稳定性（可选，取决于 createWebSocketConnection 的行为）
    const eventHandlersRef = useRef<{
        onMouse: (key: string) => void;
        onText: (key: string) => void;
        onKeyDown: (key: string) => void;
        onKeyUp: (key: string) => void;
    } | null>(null);

    useEffect(() => {
        if ((url && socketRef.current === null) || socketRef.current?.readyState !== WebSocket.OPEN) {
            // 仅在 url 存在时创建连接
            // 假设 createWebSocketConnection 返回一个对象，包含事件处理函数和 socket 实例
            const { onMouse, onText, onKeyDown, onKeyUp, socket } = createWebSocketConnection(
                url,
                (msg) => { console.log(msg); },
                (msg) => { setError(prev => prev + "\n" + msg) }
            );
            // 将 socket 实例存储到 ref 中
            socketRef.current = socket;
            // 如果需要，也可以将事件处理函数存储到 ref 中，以确保在 useEffect 清理函数中能访问到最新的函数
            eventHandlersRef.current = { onMouse, onText, onKeyDown, onKeyUp };
        }
        // setError("");

        // 清理函数：在组件卸载或 url 变化时执行
        return () => {
            if (socketRef.current) {
                socketRef.current.close(); // 关闭 WebSocket 连接
            }
        };
    }, [url]); // 此 effect 依赖于 url 的变化。当 url 改变时，会重新创建连接并清理旧的。

    const onKeyPress = (key: string) => {
        // 从 ref 中获取最新的 onKeyDown 和 onKeyUp 函数
        eventHandlersRef.current?.onKeyDown(key);
        eventHandlersRef.current?.onKeyUp(key);
    };

    if (url === "") return <div>please set url</div>;

    // if (error) return <div>Error: {error}</div>;

    return (
        <>
            <div>{error}</div>
            <ModeSelector mode={mode} setMode={setMode}></ModeSelector>
            {mode === "mouse-pad" && <MousePad onMouseDown={eventHandlersRef.current?.onMouse} />}
            {mode === "keyboard" && <Keyboard onKeyPress={onKeyPress} />}
            {mode === "text-area" && <TextAreaWithButton onSubmit={eventHandlersRef.current?.onText} />}
        </>
    );
}
