export interface TextContentPart {
  type: "text";
  text: string;
}

export interface ImageContentPart {
  type: "image_url";
  image_url: {
    url: string;
  };
}

export type UserContentItem = TextContentPart | ImageContentPart;
export type UserMessageContent = UserContentItem[];
export type AssistantMessageContent = string;

export interface Message {
  role: "user" | "assistant" | "system";
  content: UserMessageContent | AssistantMessageContent | string;
  reasoning_content?: string;
  id?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    processing_time?: number;
  };
  finish_reason?: string | null;
  finish_message?: string;
}

export interface StreamChoiceDelta {
  content?: string;
  reasoning_content?: string;
  role?: "assistant";
}

export interface StreamChoice {
  delta: StreamChoiceDelta;
  finish_reason?: string | null;
  index: number;
}

export interface StreamChunk {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices: StreamChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
