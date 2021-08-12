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
    projectURL: 'https://docs.zilswap.io/how-to/zilo/launches/01-zilstream',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/banner-zilstream.png',
    tokenSymbol: 'STREAM',
    tokenName: 'ZilStream',
    tokenDecimals: 8,
    description: 'ZilStream\'s premium membership token',
    contractAddress: 'zil1nexqjqw9mddmm0jc2zk0kkuzf77as09kttze4d',
    showUntil: dayjs('2021-06-25T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$342,867',
  }, {
    projectURL: 'https://docs.zilswap.io/how-to/zilo/launches/02-zilliqaroyale',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/1ZILO-2-BLOX-banner.png',
    tokenSymbol: 'BLOX',
    tokenName: 'ZilliqaRoyale',
    tokenDecimals: 2,
    description: 'ZilliqaRoyale is a first-of-its-kind blockchain-powered battle royale game running on Minecraft — bringing innovation to the Zilliqa network via the demonstration of seamless game and blockchain technology integration.',
    contractAddress: 'zil163lpumypene0lhf9v39qka37lraq6amwpn04n3',
    showUntil: dayjs('2021-08-16T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$550,000',
  }],
  [Network.TestNet]: [{
    projectURL: 'https://docs.zilswap.io/how-to/zilo/launches/01-zilstream',
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

export const BLOCKS_PER_MINUTE = 1.6667 // 100 blocks per hour
