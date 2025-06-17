export interface CloudStackConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
  timeout?: number;
}

export interface McpResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}