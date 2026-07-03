export const CHAT_BRIDGE_PAYLOAD_VERSION = 1;

export interface ChatMessage {
  id: string;
  content: string;
  user: string;
  role: "user" | "assistant" | "system";
  createdAt: number;
  updatedAt: number;
}

export interface ChatBridgeOutgoing {
  toChat: { user: string; content: string };
  intent?: Record<string, unknown>;
}

export function createChatBridge(wsUrl: string) {
  const ws = new WebSocket(wsUrl);

  return {
    publishTick(tick: number, hexagram: string, deltaIntent: string) {
      const frame = {
        type: 'pog2-tick',
        tick,
        hexagram,
        producedAt: Date.now(),
        payload: btoa(deltaIntent),
      };
      ws.send(
        JSON.stringify({
          type: 'system',
          content: JSON.stringify(frame),
        }),
      );
    },
  };
}
