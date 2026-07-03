import { WebSocket } from 'ws';
import { createChatBridge } from '../domain/chat/ChatSocket.js';

export interface ChatTelemetryBridgeOptions {
  worldDoUrl?: string;
  chatDoUrl?: string;
}

export class ChatTelemetryBridge {
  private readonly chatBridge: ReturnType<typeof createChatBridge>;

  constructor(options: ChatTelemetryBridgeOptions = {}) {
    const chatDoUrl =
      options.chatDoUrl ||
      process.env.CHAT_DO_URL ||
      'ws://localhost:8789/ws';

    this.chatBridge = createChatBridge(chatDoUrl);
  }

  start() {
    const ws = new WebSocket(
      process.env.POG2_WORLD_DO_URL || 'ws://localhost:8787/ws',
    );
    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ type: 'SUBSCRIBE', channels: ['telemetry'] }));
    });
    ws.addEventListener('message', (data) => {
      try {
        const msg = JSON.parse(typeof data === 'string' ? data : '{}');
        if (msg.type !== 'TICK' || !msg.frame) return;
        const tick = Number((msg.frame as { tick?: number }).tick ?? 0);
        const hexagram = String(
          (msg.frame as { hexagramState?: { activeId?: number } }).hexagramState
            ?.activeId ?? '',
        );
        this.chatBridge.publishTick(tick, hexagram, '');
      } catch {
        // ignore malformed frames
      }
    });
  }
}
