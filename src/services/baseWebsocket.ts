export type WebSocketStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export abstract class BaseWebSocketService<T> {
  protected socket: WebSocket | null = null;
  protected messageHandler: ((data: T) => void) | null = null;
  protected status: WebSocketStatus = "disconnected";
  protected reconnectAttempts = 0;
  protected maxReconnectAttempts = 5;
  protected reconnectDelay = 1000; // initial reconnect delay 1 second
  protected reconnectTimer: number | null = null;

  protected constructor(
    protected readonly wsUrl: string,
    protected readonly topic: string
  ) {}

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.setStatus("connecting");
    this.socket = new WebSocket(this.wsUrl);
    this.setupSocketListeners();
  }

  public disconnect(): void {
    this.clearReconnectTimer();

    if (this.socket) {
      this.unsubscribe();
      this.socket.close();
      this.socket = null;
    }

    this.setStatus("disconnected");
    this.reconnectAttempts = 0;
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public setMessageHandler(handler: (data: T) => void): void {
    this.messageHandler = handler;
  }

  protected abstract parseMessage(data: string): T | null;

  protected setStatus(status: WebSocketStatus): void {
    this.status = status;
    console.log(`WebSocket status: ${status}`);
  }

  protected setupSocketListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.addEventListener("open", this.handleOpen);
    this.socket.addEventListener("message", this.handleMessage);
    this.socket.addEventListener("close", this.handleClose);
    this.socket.addEventListener("error", this.handleError);
  }

  protected handleOpen = (): void => {
    this.setStatus("connected");
    this.reconnectAttempts = 0;
    this.subscribe();
  };

  protected handleClose = (event: CloseEvent): void => {
    this.setStatus("disconnected");
    if (event.code !== 1000 && event.code !== 1001) {
      this.attemptReconnect();
    }
  };

  protected handleError = (error: Event): void => {
    console.error("WebSocket error:", error);
    this.setStatus("error");
  };

  protected handleMessage = (event: MessageEvent): void => {
    try {
      const data = this.parseMessage(event.data);
      if (data && this.messageHandler) {
        this.messageHandler(data);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  };

  public subscribe(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          op: "subscribe",
          args: [this.topic],
        })
      );
    }
  }

  public unsubscribe(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          op: "unsubscribe",
          args: [this.topic],
        })
      );
    }
  }

  protected attemptReconnect(): void {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.status !== "connected" &&
      this.status !== "connecting"
    ) {
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
        30000
      );

      console.log(
        `Scheduling reconnect attempt ${
          this.reconnectAttempts + 1
        } in ${delay}ms`
      );

      this.reconnectTimer = setTimeout(() => {
        if (this.status !== "connected") {
          // check status again
          console.log(
            `Attempting to reconnect... (${this.reconnectAttempts + 1}/${
              this.maxReconnectAttempts
            })`
          );
          this.reconnectAttempts++;
          this.connect();
        }
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
    }
  }

  protected clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
