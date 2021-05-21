import dayjs, { Dayjs } from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";

export type ILOData = {
  imageURL: string
  tokenSymbol: string
  tokenName: string
  description: string
  contractAddress: string
  showUntil: Dayjs
}

export const ZILO_DATA: { [key in Network]: ReadonlyArray<ILOData> } = {
  [Network.MainNet]: [],
  [Network.TestNet]: [{
    imageURL: 'https://placehold.co/600x250',
    tokenSymbol: 'STREAM',
    tokenName: 'ZilStream',
    description: 'ZilSteam\'s premium membership token',
    contractAddress: 'zil1vccnvs4chqxtm57fxq35n2ezny85c0glv99wef',
    showUntil: dayjs('2021-05-26T10:00:00.000+0800')
  }],
}
