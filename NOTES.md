# Architecture Notes (No Changes)

## jsonPayload String as Single Source of Truth

`App.tsx` 使用 `jsonPayload`（JSON string）存储所有消息 + 配置。每次消息变更都全量 parse + stringify：

```ts
function getMessages(payload: string): Message[] {
  try { return JSON.parse(payload).messages || []; } catch { return []; }
}
function setMessages(payload: string, msgs: Message[]): string {
  try { const obj = JSON.parse(payload); obj.messages = msgs; return JSON.stringify(obj, null, 2); }
  catch { return payload; }
}
```

**问题**：每次 `setJsonPayload` 都 `JSON.parse` 旧值 → 修改 → `JSON.stringify` 新值，全量序列化。`getMessages` 每次都创建新的对象引用，导致 React.memo 默认的引用比较失效。

**优化方向**：将 `messages` 数组和 config 对象拆为独立 state，只在发请求时才序列化为 JSON body。

## IndexedDB 存档

`src/db.ts` — 聊天存档存入 IndexedDB `chat_archives` store。加载时恢复完整 `jsonPayload` 字符串。拆分 messages/config 后需修改存档格式。

## 无路由/无全局状态管理

纯单页 App，无 React Router、无 Redux/Zustand。所有状态在 `App.tsx` 内通过 `useState`/`useRef` 管理。扩展为多页面需重构。
