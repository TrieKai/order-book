import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { tradeWsService } from "@/services/tradeWebsocket";
import { tradeFillsSchema } from "@/types/trade";

const useLatestTradePrice = () => {
  const [trend, setTrend] = useState(0);
  const [latestPrice, setLatestPrice] = useState(0);

  const handleSocketMessage = useCallback(
    (data: z.infer<typeof tradeFillsSchema>) => {
      const newPrice = data.data[0].price;
      setTrend(newPrice - latestPrice);
      setLatestPrice(newPrice);
    },
    [latestPrice]
  );

  useEffect(() => {
    tradeWsService.setMessageHandler(handleSocketMessage);
    tradeWsService.connect();

    return () => {
      tradeWsService.disconnect();
    };
  }, [handleSocketMessage]);

  return {
    latestPrice,
    trend,
  };
};

export default useLatestTradePrice;
