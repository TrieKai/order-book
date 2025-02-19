import { z } from "zod";

export const orderBookSchema = z.object({
  topic: z.string(),
  data: z.object({
    bids: z.array(z.tuple([z.string(), z.string()])),
    asks: z.array(z.tuple([z.string(), z.string()])),
    seqNum: z.number(),
    prevSeqNum: z.number(),
    type: z.union([z.literal("snapshot"), z.literal("delta")]),
    timestamp: z.number(),
    symbol: z.string(),
  }),
});

export type OrderBookSchema = z.infer<typeof orderBookSchema>;

export type OrderBook = {
  bids: Record<number, number>;
  asks: Record<number, number>;
};

export type OrderBookRecordType = {
  price: number;
  size: number;
  total: number;
};
