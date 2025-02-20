import { BaseWebSocketService } from "./baseWebsocket";
import { OrderBookSchema, orderBookSchema } from "@/types/order";

class OrderBookWebSocketService extends BaseWebSocketService<OrderBookSchema> {
  private static instance: OrderBookWebSocketService;

  private constructor() {
    super(
      import.meta.env.VITE_ORDERBOOK_WS_URL,
      import.meta.env.VITE_ORDERBOOK_WS_TOPIC
    );
  }

  public static getInstance(): OrderBookWebSocketService {
    if (!OrderBookWebSocketService.instance) {
      OrderBookWebSocketService.instance = new OrderBookWebSocketService();
    }
    return OrderBookWebSocketService.instance;
  }

  protected parseMessage(data: string): OrderBookSchema | null {
    const { success, data: parsedData } = orderBookSchema.safeParse(
      JSON.parse(data)
    );
    return success ? parsedData : null;
  }
}

export const orderBookWsService = OrderBookWebSocketService.getInstance();
