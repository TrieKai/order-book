import { z } from "zod";
import { tradeFillsSchema } from "@/types/trade";

export type TradeWebSocketHandler = (
  data: z.infer<typeof tradeFillsSchema>
) => void;

class TradeWebSocketService {
  private static instance: TradeWebSocketService;
  private socket: WebSocket | null = null;
  private messageHandler: TradeWebSocketHandler | null = null;

  private constructor() {}

  public static getInstance(): TradeWebSocketService {
    if (!TradeWebSocketService.instance) {
      TradeWebSocketService.instance = new TradeWebSocketService();
    }
    return TradeWebSocketService.instance;
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.socket = new WebSocket(import.meta.env.VITE_TRADE_WS_URL);
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
          args: [import.meta.env.VITE_TRADE_WS_TOPIC],
        })
      );
    }
  }

  public unsubscribe(): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          op: "unsubscribe",
          args: [import.meta.env.VITE_TRADE_WS_TOPIC],
        })
      );
    }
  }

  public setMessageHandler(handler: TradeWebSocketHandler): void {
    this.messageHandler = handler;
  }

  private setupSocketListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.addEventListener("open", () => {
      console.log("Trade WebSocket connected");
      this.subscribe();
    });

    this.socket.addEventListener("message", this.handleMessage);

    this.socket.addEventListener("close", () => {
      console.log("Trade WebSocket disconnected");
      // 可以在這裡添加重連邏輯
    });

    this.socket.addEventListener("error", (error) => {
      console.error("Trade WebSocket error:", error);
    });
  }

  private handleMessage = (event: MessageEvent): void => {
    try {
      const { success, data } = tradeFillsSchema.safeParse(
        JSON.parse(event.data)
      );
      if (success && this.messageHandler) {
        this.messageHandler(data);
      }
    } catch (error) {
      console.error("Error parsing trade message:", error);
    }
  };
}

export const tradeWsService = TradeWebSocketService.getInstance();
