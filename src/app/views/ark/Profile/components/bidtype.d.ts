import { SimpleMap } from "app/utils";
import dayjs, { Dayjs } from "dayjs";
import BigNumber from "bignumber.js";
import { Nft } from "app/store/types";

export interface Bids {
  bidId: number,
  bidAmount: BigNumber;
  bidCurrency: string;
  nft: Nft;
  usdPrice: BigNumber;
  bidAverage: string;
  user: any;
  bidTime: Dayjs;
  expiration: Dayjs;
  status: string;
  actions?: SimpleMap<RowAction>
}

export type RowAction = {
  label: string,
  action?: (bidded?: Bids) => void
}