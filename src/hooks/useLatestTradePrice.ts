import { useCallback, useEffect, useState } from "react";
import { tradeFillsSchema } from "@/types/trade";

const TOPIC = "tradeHistoryApi:BTCPFC";
const socket = new WebSocket("wss://ws.btse.com/ws/futures");

const useLatestTradePrice = () => {
  const [trend, setTrend] = useState(0);
  const [lastPrice, setLastPrice] = useState(0);

  const handleSocketMessage = useCallback(
    (event: MessageEvent) => {
      const { success, data } = tradeFillsSchema.safeParse(
        JSON.parse(event.data)
      );

      if (success) {
        const newPrice = data.data[0].price;

        setTrend(newPrice - lastPrice);
        setLastPrice(data.data[0].price);
      }
    },
    [lastPrice]
  );

  const subscribe = (): void => {
    socket.send(
      JSON.stringify({
        op: "subscribe",
        args: [TOPIC],
      })
    );
  };

  useEffect(() => {
    socket.addEventListener("open", subscribe);
    socket.addEventListener("message", handleSocketMessage);

    return () => {
      socket.removeEventListener("open", subscribe);
      socket.removeEventListener("message", handleSocketMessage);
    };
  }, [handleSocketMessage]);

  return {
    lastPrice,
    trend,
  };
};

export default useLatestTradePrice;
