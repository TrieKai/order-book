import { useCallback, useEffect, useRef, useState } from "react";
import { OrderBook, OrderBookSchema } from "@/types/order";
import { orderBookWsService } from "@/services/orderBookWebsocket";

const parseOrderTuple = (
  orderList: Array<[string, string]>,
  defaultOrderBook?: Record<number, number>
): [Record<number, number>, Set<number>, Set<number>, Set<number>] => {
  const newRecords = new Set<number>();
  const increasedRecords = new Set<number>();
  const decreasedRecords = new Set<number>();

  const records = orderList.reduce<Record<number, number>>(
    (acc, [price, size]) => {
      const priceValue = parseFloat(price);
      const sizeValue = parseFloat(size);

      if (sizeValue === 0) {
        delete acc[priceValue];
      } else {
        if (!acc[parseFloat(price)]) {
          newRecords.add(parseFloat(price));
        } else if (acc[parseFloat(price)] > parseFloat(size)) {
          decreasedRecords.add(parseFloat(price));
        } else {
          increasedRecords.add(parseFloat(price));
        }

        acc[parseFloat(price)] = parseFloat(size);
      }
      return acc;
    },
    defaultOrderBook || {}
  );

  return [records, newRecords, increasedRecords, decreasedRecords];
};

interface UseOrderBookReturn {
  orderBook: OrderBook;
  highlightedQuotes: Set<number>;
  highlightedQuoteIncreases: Set<number>;
  highlightedQuoteDecreases: Set<number>;
}

const useOrderBook = (): UseOrderBookReturn => {
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: {}, asks: {} });
  const [highlightedQuotes, setHighlightedQuotes] = useState(new Set<number>());
  const [highlightedQuoteIncreases, setHighlightedQuoteIncreases] = useState(
    new Set<number>()
  );
  const [highlightedQuoteDecreases, setHighlightedQuoteDecreases] = useState(
    new Set<number>()
  );

  const lastSeqNum = useRef<number | null>(null);

  const initializeOrderBook = useCallback((data: OrderBookSchema): void => {
    console.warn("initialize order book");
    lastSeqNum.current = data.data.seqNum;

    const [newBids] = parseOrderTuple(data.data.bids);
    const [newAsks] = parseOrderTuple(data.data.asks);

    setOrderBook({ bids: newBids, asks: newAsks });
  }, []);

  const resubscribe = useCallback((): void => {
    console.warn("resubscribe");
    orderBookWsService.unsubscribe();
    orderBookWsService.subscribe();
  }, []);

  const updateOrderBook = useCallback(
    (data: OrderBookSchema): void => {
      lastSeqNum.current = data.data.seqNum;

      const [
        updatedBids,
        highlightedBids,
        highlightedBidIncreases,
        highlightedBidDecreases,
      ] = parseOrderTuple(data.data.bids, {
        ...orderBook.bids,
      });
      const [
        updatedAsks,
        highlightedAsks,
        highlightedAskIncreases,
        highlightedAskDecreases,
      ] = parseOrderTuple(data.data.asks, {
        ...orderBook.asks,
      });

      setOrderBook({ bids: updatedBids, asks: updatedAsks });
      setHighlightedQuotes(new Set([...highlightedBids, ...highlightedAsks]));
      setHighlightedQuoteIncreases(
        new Set([...highlightedBidIncreases, ...highlightedAskIncreases])
      );
      setHighlightedQuoteDecreases(
        new Set([...highlightedBidDecreases, ...highlightedAskDecreases])
      );

      setTimeout(() => {
        setHighlightedQuotes(new Set());
        setHighlightedQuoteIncreases(new Set());
        setHighlightedQuoteDecreases(new Set());
      }, 100);
    },
    [orderBook]
  );

  const checkCrossBook = useCallback((): void => {
    const bestBid = Math.max(...Object.keys(orderBook.bids).map(Number), 0);
    const bestAsk = Math.min(
      ...Object.keys(orderBook.asks).map(Number),
      Infinity
    );

    if (bestBid >= bestAsk) {
      console.warn("Crossed order book detected!");
      console.warn("bestBid: ", bestBid);
      console.warn("bestAsk: ", bestAsk);
      console.warn("orderBook: ", orderBook);
      resubscribe();
    }
  }, [orderBook, resubscribe]);

  const handleSocketMessage = useCallback(
    (data: OrderBookSchema): void => {
      if (data.data.type === "snapshot") {
        initializeOrderBook(data);
      } else {
        const isSeqMismatch = lastSeqNum.current !== data.data.prevSeqNum;
        if (isSeqMismatch) {
          console.warn("sequence mismatch!");
          console.warn("previous sequence: ", lastSeqNum.current);
          console.warn("previous sequence check: ", data.data.prevSeqNum);
          console.warn("new sequence: ", data.data.seqNum);
          resubscribe();
        } else {
          updateOrderBook(data);
          checkCrossBook();
        }
      }
    },
    [checkCrossBook, initializeOrderBook, resubscribe, updateOrderBook]
  );

  useEffect(() => {
    orderBookWsService.setMessageHandler(handleSocketMessage);
    orderBookWsService.connect();

    return () => {
      orderBookWsService.disconnect();
    };
  }, [handleSocketMessage]);

  return {
    orderBook,
    highlightedQuotes,
    highlightedQuoteIncreases,
    highlightedQuoteDecreases,
  };
};

export default useOrderBook;
