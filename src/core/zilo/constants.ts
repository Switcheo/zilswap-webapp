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
    projectURL: 'https://docs.zilswap.io/zilo/overview/01-zilstream',
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
    projectURL: 'https://docs.zilswap.io/zilo/overview/02-zilliqaroyale',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/1ZILO-2-BLOX-banner.png',
    tokenSymbol: 'BLOX',
    tokenName: 'ZilliqaRoyale',
    tokenDecimals: 2,
    description: 'ZilliqaRoyale is a first-of-its-kind blockchain-powered battle royale game running on Minecraft — bringing innovation to the Zilliqa network via the demonstration of seamless game and blockchain technology integration.',
    contractAddress: 'zil163lpumypene0lhf9v39qka37lraq6amwpn04n3',
    showUntil: dayjs('2021-08-16T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$550,000',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/03-demons',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-3-DMZ-banner2x.png',
    tokenSymbol: 'DMZ',
    tokenName: 'DeMons',
    tokenDecimals: 18,
    description: 'DeMons is a decentralised community-driven collectible NFT metaverse on the Zilliqa blockchain! DeMons looks to reinvent NFTs by combining the three things you love: (i) DeFi, (ii) games, and (iii) NFTs and forming a comprehensive NFT ecosystem for collectors, investors, gamers, and traders alike.',
    contractAddress: 'zil1ptfqm52nfmw3t99slwzydczejr544amdy587pr',
    showUntil: dayjs('2021-09-12T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$1,200,000',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/04-zilchill',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-4-PLAY-banner.png',
    tokenSymbol: 'PLAY',
    tokenName: 'ZilChill',
    tokenDecimals: 5,
    description: '$PLAY is a utility token of ZilChill and will be used as the payment and reward token that will complement the existing $REDC governance token.',
    contractAddress: 'zil1s8uucs55zffr5hr6343s0vmuspcntpmk5mx08u',
    showUntil: dayjs('2021-12-21T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$2,100,000',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/05-zilwatch',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-5-ZWT-banner.png',
    tokenSymbol: 'ZWT',
    tokenName: 'ZilWatch',
    tokenDecimals: 8,
    description: 'ZilWatch is a free-to-use comprehensive smart dashboard that aims to be the one-stop solution for all things in Zilliqa.',
    contractAddress: 'zil1cylrqk4dnnc0rd04kwkvs7rwz0h4fn6ks62rm6',
    showUntil: dayjs('2022-02-17T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$660,000',
  }],
  [Network.TestNet]: [{
    projectURL: 'https://docs.zilswap.io/zilo/overview/01-zilstream',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/banner-zilstream.png',
    tokenSymbol: 'STREAM',
    tokenName: 'ZilStream',
    tokenDecimals: 8,
    description: 'ZilStream\'s premium membership token',
    contractAddress: 'zil1xlaxx7f7zyycutd6x59wk0e6r4w03kjwe0fdah',
    showUntil: dayjs('2021-06-25T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$342,867',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/02-zilliqaroyale',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/1ZILO-2-BLOX-banner.png',
    tokenSymbol: 'BLOX',
    tokenName: 'ZilliqaRoyale',
    tokenDecimals: 2,
    description: 'ZilliqaRoyale is a first-of-its-kind blockchain-powered battle royale game running on Minecraft — bringing innovation to the Zilliqa network via the demonstration of seamless game and blockchain technology integration.',
    contractAddress: 'zil18trvzg0ks6z5qd4j8yr6q2cxvtnyk3dtd633rw',
    showUntil: dayjs('2021-08-16T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$550,000',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/03-demons',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-3-DMZ-banner2x.png',
    tokenSymbol: 'DMZ',
    tokenName: 'DeMons',
    tokenDecimals: 18,
    description: 'DeMons is a decentralised community-driven collectible NFT metaverse on the Zilliqa blockchain! DeMons looks to reinvent NFTs by combining the three things you love: (i) DeFi, (ii) games, and (iii) NFTs and forming a comprehensive NFT ecosystem for collectors, investors, gamers, and traders alike.',
    contractAddress: 'zil1qprynrymacc7leww9ady3jl8szwfhfdstvvpun',
    showUntil: dayjs('2021-09-10T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$1,200,000',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/04-zilchill',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-4-PLAY-banner.png',
    tokenSymbol: 'PLAY',
    tokenName: 'ZilChill',
    tokenDecimals: 5,
    description: '$PLAY is a utility token of ZilChill and will be used as the payment and reward token that will complement the existing $REDC governance token.',
    contractAddress: 'zil1nr4msut73sdsr5zfjvv29258s6eqmm8xna50v5',
    showUntil: dayjs('2021-12-15T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$2,100,000',
  }, {
    projectURL: 'https://docs.zilswap.io/zilo/overview/05-zilwatch',
    imageURL: 'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-5-ZWT-banner.png',
    tokenSymbol: 'ZWT',
    tokenName: 'ZilWatch',
    tokenDecimals: 8,
    description: 'ZilWatch is a free-to-use comprehensive smart dashboard that aims to be the one-stop solution for all things in Zilliqa.',
    contractAddress: 'zil1pvu8jfs5p5l2w6c0qrqxcv7t6lmzd4mvlh6ull',
    showUntil: dayjs('2022-02-10T10:00:00.000+0800'),
    usdRatio: '0.7',
    usdTarget: '$2,100,000',
  }],
}

export const BLOCKS_PER_MINUTE = 1.757
