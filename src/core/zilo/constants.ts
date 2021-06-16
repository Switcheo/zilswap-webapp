import dayjs, { Dayjs } from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";

export type ILOData = {
  comingSoon?: boolean
  projectURL?: string
  imageURL: string
  tokenSymbol: string
  tokenName: string
  tokenDecimals: number
  description: string
  contractAddress: string
  showUntil: Dayjs
  usdRatio: string // zil / zil+zwap
  usdTarget: string // total USD raise
}

export const ZILO_DATA: { [key in Network]: ReadonlyArray<ILOData> } = {
  [Network.MainNet]: [{
    comingSoon: true,
    projectURL: 'https://docs.zilswap.io/how-to/zilo/01-zilstream',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/banner-zilstream.png',
    tokenSymbol: 'STREAM',
    tokenName: 'ZilStream',
    tokenDecimals: 8,
    description: 'ZilStream\'s premium membership token',
    contractAddress: 'test',
    showUntil: dayjs('2021-06-25T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$342,867',
  }],
  [Network.TestNet]: [{
    projectURL: 'https://docs.zilswap.io/how-to/zilo/01-zilstream',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/banner-zilstream.png',
    tokenSymbol: 'STREAM',
    tokenName: 'ZilStream',
    tokenDecimals: 8,
    description: 'ZilStream\'s premium membership token',
    contractAddress: 'zil1xlaxx7f7zyycutd6x59wk0e6r4w03kjwe0fdah',
    showUntil: dayjs('2021-06-25T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$342,867',
  }],
}
