import { FC } from "react";
import clsx from "clsx";
import { formatNumber, formatPrice } from "@/utils/format";

interface OrderBookRowProps {
  price: number;
  size: number;
  total: number;
  maxTotal: number;
  isHighlighted: boolean;
  isIncreased: boolean;
  isDecreased: boolean;
  side: "buy" | "sell";
}

const OrderBookRow: FC<OrderBookRowProps> = ({
  price,
  size,
  total,
  maxTotal,
  isHighlighted,
  isIncreased,
  isDecreased,
  side,
}) => {
  const isBuy = side === "buy";

  return (
    <div
      className={clsx(
        "grid grid-cols-3 gap-x-3 hover:bg-hoverBg transition-colors text-sm",
        isHighlighted ? (isBuy ? "bg-flashGreen" : "bg-flashRed") : ""
      )}
    >
      <span className={isBuy ? "text-buyPrice" : "text-sellPrice"}>
        {formatPrice(price)}
      </span>
      <span
        className={clsx(
          "text-right transition-colors duration-50",
          isIncreased ? "bg-flashGreen" : isDecreased ? "bg-flashRed" : ""
        )}
      >
        {formatNumber(size)}
      </span>
      <span className="text-right relative">
        <span
          className={clsx(
            "absolute right-0 bottom-0 top-0",
            isBuy ? "bg-buyBar" : "bg-sellBar"
          )}
          style={{ width: `${Math.round((total / maxTotal) * 100)}%` }}
        />
        <span>{formatNumber(total)}</span>
      </span>
    </div>
  );
};

export default OrderBookRow;
