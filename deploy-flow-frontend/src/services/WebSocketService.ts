import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private static instance: WebSocketService;

  private constructor() {
    this.socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public executeCommand(command: string): void {
    if (this.socket) {
      this.socket.emit('execute-command', { command });
    } else {
      console.error('WebSocket not connected');
    }
  }

  public onCommandOutput(callback: (data: string) => void): void {
    if (this.socket) {
      this.socket.on('command-output', callback);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default WebSocketService; 