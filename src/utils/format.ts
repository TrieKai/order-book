export const formatPrice = (price: number): string =>
  price.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export const formatNumber = (num: number): string => num.toLocaleString();
