import { useCallback, useEffect, useRef, useState } from "react";
import { orderBookWsService } from "@/services/orderBookWebsocket";
import type { OrderBook, OrderBookSchema } from "@/types/order";

interface OrderRecordChanges {
  records: Record<number, number>;
  newRecords: Set<number>;
  increasedRecords: Set<number>;
  decreasedRecords: Set<number>;
}

const processOrderRecord = (
  acc: Record<number, number>,
  changes: {
    newRecords: Set<number>;
    increasedRecords: Set<number>;
    decreasedRecords: Set<number>;
  },
  price: number,
  size: number
): void => {
  if (size === 0) {
    delete acc[price];
    return;
  }

  if (!acc[price]) {
    changes.newRecords.add(price);
  } else if (acc[price] > size) {
    changes.decreasedRecords.add(price);
  } else {
    changes.increasedRecords.add(price);
  }

  acc[price] = size;
};

const parseOrderBookTuple = (
  orderList: Array<[string, string]>,
  defaultOrderBook: Record<number, number> = {}
): OrderRecordChanges => {
  const changes = {
    newRecords: new Set<number>(),
    increasedRecords: new Set<number>(),
    decreasedRecords: new Set<number>(),
  };

  const records = orderList.reduce<Record<number, number>>(
    (acc, [price, size]) => {
      const priceValue = parseFloat(price);
      const sizeValue = parseFloat(size);
      processOrderRecord(acc, changes, priceValue, sizeValue);
      return acc;
    },
    { ...defaultOrderBook }
  );

  return { records, ...changes };
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

    const { records: newBids } = parseOrderBookTuple(data.data.bids);
    const { records: newAsks } = parseOrderBookTuple(data.data.asks);

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

      const {
        records: updatedBids,
        newRecords: highlightedBids,
        increasedRecords: highlightedBidIncreases,
        decreasedRecords: highlightedBidDecreases,
      } = parseOrderBookTuple(data.data.bids, orderBook.bids);

      const {
        records: updatedAsks,
        newRecords: highlightedAsks,
        increasedRecords: highlightedAskIncreases,
        decreasedRecords: highlightedAskDecreases,
      } = parseOrderBookTuple(data.data.asks, orderBook.asks);

      setOrderBook({ bids: updatedBids, asks: updatedAsks });

      const updateHighlightedRecords = (): void => {
        setHighlightedQuotes(new Set([...highlightedBids, ...highlightedAsks]));
        setHighlightedQuoteIncreases(
          new Set([...highlightedBidIncreases, ...highlightedAskIncreases])
        );
        setHighlightedQuoteDecreases(
          new Set([...highlightedBidDecreases, ...highlightedAskDecreases])
        );
      };

      const clearHighlightedRecords = (): void => {
        setHighlightedQuotes(new Set());
        setHighlightedQuoteIncreases(new Set());
        setHighlightedQuoteDecreases(new Set());
      };

      updateHighlightedRecords();
      setTimeout(clearHighlightedRecords, 100);
    },
    [orderBook]
  );

  const handleSocketMessage = useCallback(
    (data: OrderBookSchema): void => {
      if (data.data.type === "snapshot") {
        initializeOrderBook(data);
      } else {
        const isSeqMismatch = lastSeqNum.current !== data.data.prevSeqNum;
        if (isSeqMismatch) {
          console.warn("sequence mismatch!");
          resubscribe();
        } else {
          updateOrderBook(data);
        }
      }
    },
    [initializeOrderBook, resubscribe, updateOrderBook]
  );

  useEffect(() => {
    orderBookWsService.connect();
    return () => {
      orderBookWsService.disconnect();
    };
  }, []);

  useEffect(() => {
    orderBookWsService.setMessageHandler(handleSocketMessage);
  }, [handleSocketMessage]);

  return {
    orderBook,
    highlightedQuotes,
    highlightedQuoteIncreases,
    highlightedQuoteDecreases,
  };
};

export default useOrderBook;
