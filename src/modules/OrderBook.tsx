import useLatestTradePrice from "@/hooks/useLatestTradePrice";
import useOrderBook from "@/hooks/useOrderBook";
import { ArrowDown as ArrowDownIcon } from "@/icons/arrowDown";
import type { OrderBookRecordType } from "@/types/order";
import { FC } from "react";

const parseOrderBookRecords = (
  records: Record<number, number>,
  accumulativeDirection: "toHighest" | "toLowest"
) => {
  const highestFirstRecordsSlice = Object.entries(records)
    .sort(([priceA], [priceB]) => parseFloat(priceB) - parseFloat(priceA))
    .slice(0, 8);

  return accumulativeDirection === "toHighest"
    ? highestFirstRecordsSlice
        .reverse()
        .reduce<OrderBookRecordType[]>((acc, cur) => {
          const record = {
            price: parseFloat(cur[0]),
            size: cur[1],
            total: (acc.at(-1)?.total || 0) + cur[1],
          };
          acc.push(record);
          return acc;
        }, [])
        .reverse()
    : highestFirstRecordsSlice.reduce<OrderBookRecordType[]>((acc, cur) => {
        const record = {
          price: parseFloat(cur[0]),
          size: cur[1],
          total: (acc.at(-1)?.total || 0) + cur[1],
        };
        acc.push(record);
        return acc;
      }, []);
};

const OrderBook: FC = () => {
  const { lastPrice, trend } = useLatestTradePrice();
  const {
    orderBook,
    highlightedQuotes,
    highlightedQuoteDecreases,
    highlightedQuoteIncreases,
  } = useOrderBook();

  const trendColor =
    trend > 0
      ? "text-systemGreen bg-systemGreen-12"
      : trend < 0
      ? "text-systemRed bg-systemRed-12"
      : "";

  const asks = parseOrderBookRecords(orderBook.asks, "toHighest");
  const bids = parseOrderBookRecords(orderBook.bids, "toLowest");

  const asksTotal = asks.at(0)?.total || 0;
  const bidsTotal = bids.at(-1)?.total || 0;

  return (
    <div className="py-2 w-80 font-extrabold bg-black">
      <h1 className="text-xl px-2 pb-2 text-white">Order Book</h1>

      <hr className="border-systemGray opacity-20" />

      <div className="px-2 py-2 grid grid-cols-3 gap-x-3 text-systemGray font-normal text-sm">
        <span>Price (USD)</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* ASKS */}
      <div className="flex flex-col px-2 gap-1">
        {asks.map(({ price, size, total }) => (
          <div
            key={price}
            className={`grid grid-cols-3 gap-x-3 hover:bg-systemBlue transition-colors text-sm ${
              highlightedQuotes.has(price) ? "bg-systemRed-50 " : ""
            }`}
          >
            <span className="text-systemRed">
              {price.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <span
              className={`text-right transition-colors duration-50 ${
                highlightedQuoteIncreases.has(price)
                  ? "bg-systemGreen-50"
                  : highlightedQuoteDecreases.has(price)
                  ? "bg-systemRed-50"
                  : ""
              }`}
            >
              {size.toLocaleString()}
            </span>
            <span className="text-right relative">
              <span
                className="absolute right-0 bottom-0 top-0 bg-systemRed-12"
                style={{ width: `${Math.round((total / asksTotal) * 100)}%` }}
              ></span>
              <span>{total.toLocaleString()}</span>
            </span>
          </div>
        ))}
      </div>

      {/* LAST PRICE */}
      <div
        className={`${trendColor} py-1 my-1 flex items-center justify-center gap-2 text-2xl`}
      >
        {lastPrice.toLocaleString()}

        {trend !== 0 && (
          <ArrowDownIcon
            className={trend > 0 ? "rotate-180 " : ""}
          ></ArrowDownIcon>
        )}
      </div>

      {/* BIDS */}
      <div className="flex flex-col px-2 gap-1">
        {bids.map(({ price, size, total }) => (
          <div
            key={price}
            className={`grid grid-cols-3 gap-x-3 hover:bg-systemBlue transition-colors text-sm ${
              highlightedQuotes.has(price) ? "bg-systemGreen-50" : ""
            }`}
          >
            <span className="text-systemGreen">
              {price.toLocaleString(undefined, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <span
              className={`text-right transition-colors duration-50 ${
                highlightedQuoteIncreases.has(price)
                  ? "bg-systemGreen-50"
                  : highlightedQuoteDecreases.has(price)
                  ? "bg-systemRed-50"
                  : ""
              }`}
            >
              {size.toLocaleString()}
            </span>
            <span className="text-right relative">
              <span
                className="absolute right-0 bottom-0 top-0 bg-systemGreen-12"
                style={{ width: `${Math.round((total / bidsTotal) * 100)}%` }}
              ></span>
              <span>{total.toLocaleString()}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
