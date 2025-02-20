import { FC } from "react";
import clsx from "clsx";
import { ArrowDown as ArrowDownIcon } from "@/icons/arrowDown";
import { formatNumber } from "@/utils/format";

interface LatestPriceProps {
  price: number;
  trend: number;
}

const LatestPrice: FC<LatestPriceProps> = ({ price, trend }) => {
  const trendColor =
    trend > 0
      ? "text-buyPrice bg-buyBar"
      : trend < 0
      ? "text-sellPrice bg-sellBar"
      : "";

  return (
    <div
      className={clsx(
        trendColor,
        "py-1 my-1 flex items-center justify-center gap-2 text-2xl"
      )}
    >
      {formatNumber(price)}
      {trend !== 0 && (
        <ArrowDownIcon className={trend > 0 ? "rotate-180" : ""} />
      )}
    </div>
  );
};

export default LatestPrice;
