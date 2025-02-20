import { OrderBookSchema, orderBookSchema } from "@/types/order";

export type OrderBookWebSocketHandler = (data: OrderBookSchema) => void;

class OrderBookWebSocketService {
  private static instance: OrderBookWebSocketService;
  private socket: WebSocket | null = null;
  private messageHandler: OrderBookWebSocketHandler | null = null;

  private constructor() {}

  public static getInstance(): OrderBookWebSocketService {
    if (!OrderBookWebSocketService.instance) {
      OrderBookWebSocketService.instance = new OrderBookWebSocketService();
    }
    return OrderBookWebSocketService.instance;
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(import.meta.env.VITE_ORDERBOOK_WS_URL);
    this.setupSocketListeners();
  }

  public disconnect(): void {
    if (this.socket) {
      this.unsubscribe();
      this.socket.close();
      this.socket = null;
    }
  }

  public subscribe(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          op: "subscribe",
          args: [import.meta.env.VITE_ORDERBOOK_WS_TOPIC],
        })
      );
    }
  }

  public unsubscribe(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          op: "unsubscribe",
          args: [import.meta.env.VITE_ORDERBOOK_WS_TOPIC],
        })
      );
    }
  }

  public setMessageHandler(handler: OrderBookWebSocketHandler): void {
    this.messageHandler = handler;
  }

  private setupSocketListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.addEventListener("open", () => {
      console.log("OrderBook WebSocket connected");
      this.subscribe();
    });

    this.socket.addEventListener("message", this.handleMessage);

    this.socket.addEventListener("close", () => {
      console.log("OrderBook WebSocket disconnected");
      // 可以在這裡添加重連邏輯
    });

    this.socket.addEventListener("error", (error) => {
      console.error("OrderBook WebSocket error:", error);
    });
  }

  private handleMessage = (event: MessageEvent): void => {
    try {
      const { success, data } = orderBookSchema.safeParse(
        JSON.parse(event.data)
      );
      if (success && this.messageHandler) {
        this.messageHandler(data);
      }
    } catch (error) {
      console.error("Error parsing orderbook message:", error);
    }
  };
}

export const orderBookWsService = OrderBookWebSocketService.getInstance();
