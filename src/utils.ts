import { Message, TextContentPart, UserContentItem, UserMessageContent } from "./types.ts";

export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const getMessageText = (msg: Message): string => {
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((p): p is TextContentPart => p.type === "text")
      .map((p) => p.text)
      .join("\n");
  }
  return "";
};

export const generateId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const stringifyMessages = (history: Message[]): string => {
  if (history.length === 0) return "[]";

  const compact = history.map((m) => {
    const o: Record<string, unknown> = { role: m.role, content: m.content };
    if (m.reasoning_content) o.reasoning_content = m.reasoning_content;
    if (m.finish_reason) o.finish_reason = m.finish_reason;
    if (m.usage) o.usage = m.usage;
    return o;
  });
  return JSON.stringify(compact);
};

export const getUsage = (msg: Message) => msg.usage;
export const getFinishReason = (msg: Message) => msg.finish_reason;
export const getFinishMessage = (msg: Message) => msg.finish_message;

export function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
  const ka = Object.keys(a as Record<string, unknown>);
  const kb = Object.keys(b as Record<string, unknown>);
  if (ka.length !== kb.length) return false;
  for (const k of ka) {
    if ((a as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]) return false;
  }
  return true;
}
