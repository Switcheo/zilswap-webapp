import { SimpleCheque } from "app/store/types";

export enum PriceType {
  BestAsk = "Buy Now",
  BestBid = "Best Bid",
  LastTrade = "Last Trade",
}

export type PriceInfo = {
  type: PriceType,
  cheque: SimpleCheque,
}
