import dayjs, { Dayjs } from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";

export type ILOData = {
  imageURL: string
  tokenSymbol: string
  tokenName: string
  description: string
  contractAddress: string
  showUntil: Dayjs
  usdRatio: string // zil / zil+zwap
}

export const ZILO_DATA: { [key in Network]: ReadonlyArray<ILOData> } = {
  [Network.MainNet]: [],
  [Network.TestNet]: [{
    imageURL: 'https://placehold.co/600x250',
    tokenSymbol: 'STREAM',
    tokenName: 'ZilStream',
    description: 'ZilSteam\'s premium membership token',
    contractAddress: 'zil12ups4rxaxepf9h9aplwess8vapk37d2m8v20ax',
    showUntil: dayjs('2021-06-06T10:00:00.000+0800'),
    usdRatio: '0.7'
  }],
}
