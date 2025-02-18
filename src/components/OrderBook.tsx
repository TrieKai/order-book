import { useEffect, useState, useRef } from "react";

type Order = [number, number];

interface OrderBookData {
  bids: Order[];
  asks: Order[];
}

interface WebSocketMessage {
  data: {
    type: "snapshot" | "delta";
    bids: Order[];
    asks: Order[];
    seqNum: number;
    prevSeqNum?: number;
  };
}

interface TradeMessage {
  data: {
    price: string;
    size: string;
    timestamp: number;
  }[];
}

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderBookData>({
    bids: [],
    asks: [],
  });
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const [prevLastPrice, setPrevLastPrice] = useState<number | null>(null);
  const [lastSeqNum, setLastSeqNum] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const tradeWsRef = useRef<WebSocket | null>(null);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const calculateTotal = (orders: Order[], isAsk: boolean): number[] => {
    let total = 0;
    const result: number[] = [];

    if (isAsk) {
      for (let i = orders.length - 1; i >= 0; i--) {
        total += orders[i][1];
        result[i] = total;
      }
    } else {
      for (let i = 0; i < orders.length; i++) {
        total += orders[i][1];
        result[i] = total;
      }
    }

    return result;
  };

  const getLastPriceStyle = (): string => {
    if (!lastPrice || !prevLastPrice)
      return "text-[#F0F4F8] bg-[rgba(255,90,90,0.12)]";
    if (lastPrice > prevLastPrice)
      return "text-[#00b15d] bg-[rgba(16,186,104,0.12)]";
    if (lastPrice < prevLastPrice)
      return "text-[#FF5B5A] bg-[rgba(255,90,90,0.12)]";
    return "text-[#F0F4F8] bg-[rgba(134,152,170,0.12)]";
  };

  useEffect(() => {
    const orderBookWs = new WebSocket("wss://ws.btse.com/ws/oss/futures");
    const tradeWs = new WebSocket("wss://ws.btse.com/ws/futures");

    wsRef.current = orderBookWs;
    tradeWsRef.current = tradeWs;

    orderBookWs.onopen = () => {
      orderBookWs.send(
        JSON.stringify({
          op: "subscribe",
          args: ["update:BTCPFC"],
        })
      );
    };

    tradeWs.onopen = () => {
      tradeWs.send(
        JSON.stringify({
          op: "subscribe",
          args: ["tradeHistoryApi:BTCPFC"],
        })
      );
    };

    orderBookWs.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as WebSocketMessage;
      if (data.data) {
        if (data.data.type === "snapshot") {
          setOrderBook({
            bids: data.data.bids.slice(0, 8),
            asks: data.data.asks.slice(0, 8),
          });
          setLastSeqNum(data.data.seqNum);
        } else if (data.data.type === "delta") {
          if (data.data.prevSeqNum !== lastSeqNum) {
            // Resubscribe to get new snapshot
            orderBookWs.send(
              JSON.stringify({
                op: "unsubscribe",
                args: ["update:BTCPFC"],
              })
            );
            orderBookWs.send(
              JSON.stringify({
                op: "subscribe",
                args: ["update:BTCPFC"],
              })
            );
            return;
          }

          setOrderBook((prev) => {
            const newBids = [...prev.bids];
            const newAsks = [...prev.asks];

            data.data.bids.forEach((bid) => {
              const index = newBids.findIndex((b) => b[0] === bid[0]);
              if (index !== -1) {
                if (bid[1] === 0) {
                  newBids.splice(index, 1);
                } else {
                  newBids[index] = bid;
                }
              } else if (bid[1] !== 0) {
                newBids.push(bid);
              }
            });

            data.data.asks.forEach((ask) => {
              const index = newAsks.findIndex((a) => a[0] === ask[0]);
              if (index !== -1) {
                if (ask[1] === 0) {
                  newAsks.splice(index, 1);
                } else {
                  newAsks[index] = ask;
                }
              } else if (ask[1] !== 0) {
                newAsks.push(ask);
              }
            });

            return {
              bids: newBids.sort((a, b) => b[0] - a[0]).slice(0, 8),
              asks: newAsks.sort((a, b) => a[0] - b[0]).slice(0, 8),
            };
          });
          setLastSeqNum(data.data.seqNum);
        }
      }
    };

    tradeWs.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as TradeMessage;
      if (data.data && data.data.length > 0) {
        setPrevLastPrice(lastPrice);
        setLastPrice(parseFloat(data.data[0].price));
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (tradeWsRef.current) {
        tradeWsRef.current.close();
      }
    };
  }, [lastPrice, lastSeqNum]);

  const askTotals = calculateTotal(orderBook.asks, true);
  const bidTotals = calculateTotal(orderBook.bids, false);
  const maxTotal = Math.max(...askTotals, ...bidTotals);

  return (
    <div className="bg-[#131B29] text-[#F0F4F8] p-4 font-mono">
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2">Order Book</h2>
        <div className={`text-center py-2 px-4 rounded ${getLastPriceStyle()}`}>
          Last Price: {lastPrice ? formatNumber(lastPrice) : "Loading..."}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-[#8698aa]">Price (USD)</div>
        <div className="text-right text-[#8698aa]">Size</div>
        <div className="text-right text-[#8698aa]">Total</div>
      </div>

      <div className="space-y-1">
        {orderBook.asks.map((ask, index) => (
          <div
            key={ask[0]}
            className="grid grid-cols-3 gap-4 text-sm items-center hover:bg-[#1E3059] relative"
          >
            <div className="text-[#FF5B5A]">{formatNumber(ask[0])}</div>
            <div className="text-right">{formatNumber(ask[1])}</div>
            <div className="text-right relative">
              <div
                className="absolute inset-0 bg-[rgba(255,90,90,0.12)]"
                style={{
                  width: `${(askTotals[index] / maxTotal) * 100}%`,
                  zIndex: 0,
                }}
              />
              <span className="relative z-10">
                {formatNumber(askTotals[index])}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="my-2 border-t border-[#1E3059]" />

      <div className="space-y-1">
        {orderBook.bids.map((bid, index) => (
          <div
            key={bid[0]}
            className="grid grid-cols-3 gap-4 text-sm items-center hover:bg-[#1E3059] relative"
          >
            <div className="text-[#00b15d]">{formatNumber(bid[0])}</div>
            <div className="text-right">{formatNumber(bid[1])}</div>
            <div className="text-right relative">
              <div
                className="absolute inset-0 bg-[rgba(16,186,104,0.12)]"
                style={{
                  width: `${(bidTotals[index] / maxTotal) * 100}%`,
                  zIndex: 0,
                }}
              />
              <span className="relative z-10">
                {formatNumber(bidTotals[index])}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
