export interface ChatRequest {
  model: string;
  messages: Array<Message>;
  options?: Options;
  stream?: boolean;
  template?: string;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
}

export interface ChatResponse {
  model: string;
  created_at: string;
  message: Message;
  done?: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface Options {
  num_ctx: number;
}

export interface Model {
  name: string;
}
