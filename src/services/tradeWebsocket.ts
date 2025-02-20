import { z } from "zod";
import { BaseWebSocketService } from "./baseWebsocket";
import { tradeFillsSchema } from "@/types/trade";

type TradeWebSocketData = z.infer<typeof tradeFillsSchema>;

class TradeWebSocketService extends BaseWebSocketService<TradeWebSocketData> {
  private static instance: TradeWebSocketService;

  private constructor() {
    super(import.meta.env.VITE_TRADE_WS_URL, import.meta.env.VITE_TRADE_WS_TOPIC);
  }

  public static getInstance(): TradeWebSocketService {
    if (!TradeWebSocketService.instance) {
      TradeWebSocketService.instance = new TradeWebSocketService();
    }
    return TradeWebSocketService.instance;
  }

  protected parseMessage(data: string): TradeWebSocketData | null {
    const { success, data: parsedData } = tradeFillsSchema.safeParse(JSON.parse(data));
    return success ? parsedData : null;
  }
}

export const tradeWsService = TradeWebSocketService.getInstance();
