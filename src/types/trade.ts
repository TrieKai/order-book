import { z } from "zod";

const confirmSubScribeSchema = z.object({
  event: z.literal("subscribe"),
  channel: z.array(z.string()),
});

const tradeFillSchema = z.object({
  symbol: z.string(),
  side: z.literal("SELL").or(z.literal("BUY")),
  size: z.number(),
  price: z.number(),
  tradeId: z.number(),
  timestamp: z.number(),
});

export const tradeFillsSchema = z.object({
  topic: z.string(),
  data: z.array(tradeFillSchema),
});

export const lastPriceSchema = z.union([
  confirmSubScribeSchema,
  tradeFillsSchema,
]);
