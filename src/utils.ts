import type { Message, TextContentPart } from "./types.ts";

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

const COMPRESS_PREFIX = "gz1:";

function str2ab(str: string): Uint8Array {
  const len = str.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) buf[i] = str.charCodeAt(i) & 0xff;
  return buf;
}

function ab2str(buf: Uint8Array): string {
  return String.fromCharCode(...buf);
}

export async function compressJSON(data: unknown): Promise<string> {
  const json = JSON.stringify(data);
  if (json.length < 10240) return json;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(json);
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const compressed = await new Response(cs.readable).blob();
  const buf = await compressed.arrayBuffer();
  const base64 = btoa(ab2str(new Uint8Array(buf)));
  return COMPRESS_PREFIX + base64;
}

export async function decompressJSON<T>(stored: string): Promise<T> {
  if (!stored.startsWith(COMPRESS_PREFIX)) {
    return JSON.parse(stored) as T;
  }
  const base64 = stored.slice(COMPRESS_PREFIX.length);
  const bytes = str2ab(atob(base64));
  const ds = new DecompressionStream("gzip");
  const decompressed = await new Response(
    new Blob([bytes]).stream().pipeThrough(ds),
  ).text();
  return JSON.parse(decompressed) as T;
}
