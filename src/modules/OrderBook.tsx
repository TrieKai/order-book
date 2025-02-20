import { FC, useMemo } from "react";
import OrderBookRow from "@/components/OrderBookRow";
import LatestPrice from "@/components/LatestPrice";
import useLatestTradePrice from "@/hooks/useLatestTradePrice";
import useOrderBook from "@/hooks/useOrderBook";
import type { OrderBookRecordType } from "@/types/order";

const MAX_ORDERS = 8;

const parseOrderBookData = (
  records: Record<number, number>,
  accumulativeDirection: "toHighest" | "toLowest"
): OrderBookRecordType[] => {
  const highestFirstRecordsSlice = Object.entries(records)
    .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
    .slice(0, MAX_ORDERS);

  const calculateRecords = (
    entries: [string, number][]
  ): OrderBookRecordType[] =>
    entries.reduce<OrderBookRecordType[]>((acc, [price, size]) => {
      const record = {
        price: parseFloat(price),
        size,
        total: (acc.at(-1)?.total || 0) + size,
      };
      acc.push(record);
      return acc;
    }, []);

  return accumulativeDirection === "toHighest"
    ? calculateRecords([...highestFirstRecordsSlice].reverse()).reverse()
    : calculateRecords(highestFirstRecordsSlice);
};

const OrderBook: FC = () => {
  const { latestPrice, trend } = useLatestTradePrice();
  const {
    orderBook,
    highlightedQuotes,
    highlightedQuoteDecreases,
    highlightedQuoteIncreases,
  } = useOrderBook();

  const { asks, bids, asksTotal, bidsTotal } = useMemo(() => {
    const asks = parseOrderBookData(orderBook.asks, "toHighest");
    const bids = parseOrderBookData(orderBook.bids, "toLowest");

    return {
      asks,
      bids,
      asksTotal: asks.at(0)?.total || 0,
      bidsTotal: bids.at(-1)?.total || 0,
    };
  }, [orderBook]);

  return (
    <div className="py-2 w-80 font-extrabold bg-appBg text-textDefault">
      <h1 className="text-xl px-2 pb-2">Order Book</h1>

      <hr className="border-textSecondary opacity-20" />

      <div className="px-2 py-2 grid grid-cols-3 gap-x-3 text-textSecondary font-normal text-sm">
        <span>Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* asks */}
      <div className="flex flex-col px-2 gap-1">
        {asks.map((record) => (
          <OrderBookRow
            key={record.price}
            {...record}
            maxTotal={asksTotal}
            isHighlighted={highlightedQuotes.has(record.price)}
            isIncreased={highlightedQuoteIncreases.has(record.price)}
            isDecreased={highlightedQuoteDecreases.has(record.price)}
            side="sell"
          />
        ))}
      </div>

      {/* latest price */}
      <LatestPrice price={latestPrice} trend={trend} />

      {/* bids */}
      <div className="flex flex-col px-2 gap-1">
        {bids.map((record) => (
          <OrderBookRow
            key={record.price}
            {...record}
            maxTotal={bidsTotal}
            isHighlighted={highlightedQuotes.has(record.price)}
            isIncreased={highlightedQuoteIncreases.has(record.price)}
            isDecreased={highlightedQuoteDecreases.has(record.price)}
            side="buy"
          />
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
