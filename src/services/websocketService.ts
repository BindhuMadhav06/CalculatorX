import { WsMessageEvent, WsEventType } from '../types/chat';

type WsEventListener = (event: WsMessageEvent) => void;

export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;
  private url: string = 'ws://localhost:8000/ws';
  private deviceId: string | null = null;
  private listeners: Set<WsEventListener> = new Set();
  private isConnected: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private pendingQueue: any[] = [];

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(baseUrl: string, deviceId: string) {
    this.deviceId = deviceId;
    const wsScheme = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const cleanHost = baseUrl.replace(/^https?:\/\//, '');
    this.url = `${wsScheme}://${cleanHost}/ws/${deviceId}`;

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.startHeartbeat();
        this.flushQueue();
        this.notifyListeners({ type: 'presence', payload: { status: 'online' } });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: WsMessageEvent = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (e) {
          console.warn('Malformed WS frame received:', event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.scheduleReconnect();
        this.notifyListeners({ type: 'presence', payload: { status: 'offline' } });
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  public send(type: WsEventType, payload: any): boolean {
    const frame: WsMessageEvent = { type, payload };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(frame));
      return true;
    } else {
      this.pendingQueue.push(frame);
      return false;
    }
  }

  public subscribe(listener: WsEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  private flushQueue() {
    while (this.pendingQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const frame = this.pendingQueue.shift();
      this.ws.send(JSON.stringify(frame));
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      this.send('ping', { timestamp: Date.now() });
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      if (this.deviceId) {
        this.connect(this.url.replace(/\/ws\/.*$/, ''), this.deviceId);
      }
    }, 3000);
  }

  private notifyListeners(event: WsMessageEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}
