import dayjs, { Dayjs } from 'dayjs';
import { Network } from 'zilswap-sdk/lib/constants';

export type ILOData = {
  comingSoon?: boolean;
  projectURL?: string;
  imageURL: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  description: string;
  contractAddress: string;
  showUntil: Dayjs;
  usdRatio: string; // zil / zil+zwap
  usdTarget: string; // total USD raise
  version: 1 | 2;
  whitelistDiscountPercent?: number;
  minZwap?: number;
  tokenPrice?: number;
};

export const ZILO_DATA: { [key in Network]: ReadonlyArray<ILOData> } = {
  [Network.MainNet]: [
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/01-zilstream',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/banner-zilstream.png',
      tokenSymbol: 'GSCxBT',
      tokenName: 'gscxbt',
      tokenDecimals: 8,
      description: "SuperChain's premium membership token",
      contractAddress: 'zil1nexqjqw9mddmm0jc2zk0kkuzf77as09kttze4d',
      showUntil: dayjs('2021-06-25T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$342,867',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/02-zilliqaroyale',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/1ZILO-2-BLOX-banner.png',
      tokenSymbol: 'BLOX',
      tokenName: 'ZilliqaRoyale',
      tokenDecimals: 2,
      description:
        'ZilliqaRoyale is a first-of-its-kind blockchain-powered battle royale game running on Minecraft — bringing innovation to the Zilliqa network via the demonstration of seamless game and blockchain technology integration.',
      contractAddress: 'zil163lpumypene0lhf9v39qka37lraq6amwpn04n3',
      showUntil: dayjs('2021-08-16T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$550,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/03-demons',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-3-DMZ-banner2x.png',
      tokenSymbol: 'DMZ',
      tokenName: 'DeMons',
      tokenDecimals: 18,
      description:
        'DeMons is a decentralised community-driven collectible NFT metaverse on the Zilliqa blockchain! DeMons looks to reinvent NFTs by combining the three things you love: (i) DeFi, (ii) games, and (iii) NFTs and forming a comprehensive NFT ecosystem for collectors, investors, gamers, and traders alike.',
      contractAddress: 'zil1ptfqm52nfmw3t99slwzydczejr544amdy587pr',
      showUntil: dayjs('2021-09-12T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$1,200,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/04-zilchill',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-4-PLAY-banner.png',
      tokenSymbol: 'PLAY',
      tokenName: 'ZilChill',
      tokenDecimals: 5,
      description:
        '$PLAY is a utility token of ZilChill and will be used as the payment and reward token that will complement the existing $REDC governance token.',
      contractAddress: 'zil1s8uucs55zffr5hr6343s0vmuspcntpmk5mx08u',
      showUntil: dayjs('2021-12-21T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$2,100,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/05-zilwatch',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-5-ZWT-banner.png',
      tokenSymbol: 'ZWT',
      tokenName: 'ZilWatch',
      tokenDecimals: 8,
      description:
        'ZilWatch is a free-to-use comprehensive smart dashboard that aims to be the one-stop solution for all things in Zilliqa.',
      contractAddress: 'zil1cylrqk4dnnc0rd04kwkvs7rwz0h4fn6ks62rm6',
      showUntil: dayjs('2022-02-17T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$660,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/06-envizion',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-6-EVZ-banner.png',
      tokenSymbol: 'EVZ',
      tokenName: 'EnviZion',
      tokenDecimals: 8,
      description:
        'EnviZion is well-positioned to be at the forefront of the creator’s economy, revolutionizing how individual Creators can create and collaborate at a scale never seen before.',
      contractAddress: 'zil1uhytmtrjc96rf6r5f7tmrl96aua0rzh987zj5t',
      showUntil: dayjs('2022-05-16T10:00:00.000+0800'),
      usdRatio: '0.9',
      usdTarget: '$234,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/zilo-7-metasportz-city-mszc',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-7-MSZC-banner.jpg',
      tokenSymbol: 'MSZC',
      tokenName: 'MetaSportZ City',
      tokenDecimals: 6,
      description:
        'MetaSportZ City is the world’s first “Sportaverse” – within the next internet – featuring the next gamified sports and gaming entertainment experiences on web 3.5.',
      contractAddress: 'zil1ky52dse4qvw8v4ceqn2ja6z8jexvd3z4ljn42c',
      showUntil: dayjs('2022-10-17T12:00:00.000+0800'),
      usdRatio: '1.0',
      usdTarget: '$1,000,000',
      version: 2,
      minZwap: 46.46,
      whitelistDiscountPercent: 5,
      tokenPrice: 0.01,
    },
  ],
  [Network.TestNet]: [
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/01-zilstream',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/banner-zilstream.png',
      tokenSymbol: 'STREAM',
      tokenName: 'ZilStream',
      tokenDecimals: 8,
      description: "ZilStream's premium membership token",
      contractAddress: 'zil1xlaxx7f7zyycutd6x59wk0e6r4w03kjwe0fdah',
      showUntil: dayjs('2021-06-25T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$342,867',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/02-zilliqaroyale',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/1ZILO-2-BLOX-banner.png',
      tokenSymbol: 'BLOX',
      tokenName: 'ZilliqaRoyale',
      tokenDecimals: 2,
      description:
        'ZilliqaRoyale is a first-of-its-kind blockchain-powered battle royale game running on Minecraft — bringing innovation to the Zilliqa network via the demonstration of seamless game and blockchain technology integration.',
      contractAddress: 'zil18trvzg0ks6z5qd4j8yr6q2cxvtnyk3dtd633rw',
      showUntil: dayjs('2021-08-16T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$550,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/03-demons',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-3-DMZ-banner2x.png',
      tokenSymbol: 'DMZ',
      tokenName: 'DeMons',
      tokenDecimals: 18,
      description:
        'DeMons is a decentralised community-driven collectible NFT metaverse on the Zilliqa blockchain! DeMons looks to reinvent NFTs by combining the three things you love: (i) DeFi, (ii) games, and (iii) NFTs and forming a comprehensive NFT ecosystem for collectors, investors, gamers, and traders alike.',
      contractAddress: 'zil1qprynrymacc7leww9ady3jl8szwfhfdstvvpun',
      showUntil: dayjs('2021-09-10T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$1,200,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/04-zilchill',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-4-PLAY-banner.png',
      tokenSymbol: 'PLAY',
      tokenName: 'ZilChill',
      tokenDecimals: 5,
      description:
        '$PLAY is a utility token of ZilChill and will be used as the payment and reward token that will complement the existing $REDC governance token.',
      contractAddress: 'zil1nr4msut73sdsr5zfjvv29258s6eqmm8xna50v5',
      showUntil: dayjs('2021-12-15T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$2,100,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/05-zilwatch',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-5-ZWT-banner.png',
      tokenSymbol: 'ZWT',
      tokenName: 'ZilWatch',
      tokenDecimals: 8,
      description:
        'ZilWatch is a free-to-use comprehensive smart dashboard that aims to be the one-stop solution for all things in Zilliqa.',
      contractAddress: 'zil1pvu8jfs5p5l2w6c0qrqxcv7t6lmzd4mvlh6ull',
      showUntil: dayjs('2022-02-10T10:00:00.000+0800'),
      usdRatio: '0.7',
      usdTarget: '$2,100,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/06-envizion',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-6-EVZ-banner.png',
      tokenSymbol: 'EVZ',
      tokenName: 'EnviZion',
      tokenDecimals: 8,
      description:
        'EnviZion is well-positioned to be at the forefront of the creator’s economy, revolutionizing how individual Creators can create and collaborate at a scale never seen before.',
      contractAddress: 'zil1y8enzdxpw3y4an2zyw7zz3nmr7m8mrl5veqtd0',
      showUntil: dayjs('2022-05-16T10:00:00.000+0800'),
      usdRatio: '0.9',
      usdTarget: '$234,000',
      version: 1,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/zilo-7-metasportz-city-mszc',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-7-MSZC-banner.jpg',
      tokenSymbol: 'MSZC',
      tokenName: 'MetaSportZ City',
      tokenDecimals: 12,
      description:
        'MetaSportZ City is the world’s first “Sportaverse” – within the next internet – featuring the next gamified sports and gaming entertainment experiences on web 3.5.',
      contractAddress: 'zil1wmy94966t7ku5ms4pp8nj92jkpat9x52n0uyyj',
      showUntil: dayjs('2022-10-6T12:00:00.000+0800'),
      usdRatio: '1.0',
      usdTarget: '$1,000,000',
      version: 2,
      minZwap: 46.46,
      whitelistDiscountPercent: 5,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/zilo-7-metasportz-city-mszc',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-7-MSZC-banner.jpg',
      tokenSymbol: 'MSZC',
      tokenName: 'MetaSportZ City',
      tokenDecimals: 12,
      description:
        'MetaSportZ City is the world’s first “Sportaverse” – within the next internet – featuring the next gamified sports and gaming entertainment experiences on web 3.5.',
      contractAddress: 'zil1gv8axdc2ahkn7feyvrqkn2q5zxumkmp4nn7q9r',
      showUntil: dayjs('2022-10-9T12:00:00.000+0800'),
      usdRatio: '1.0',
      usdTarget: '$1,000,000',
      version: 2,
      minZwap: 46.46,
      whitelistDiscountPercent: 5,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/zilo-7-metasportz-city-mszc',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-7-MSZC-banner.jpg',
      tokenSymbol: 'MSZC',
      tokenName: 'MetaSportZ City',
      tokenDecimals: 12,
      description:
        'MetaSportZ City is the world’s first “Sportaverse” – within the next internet – featuring the next gamified sports and gaming entertainment experiences on web 3.5.',
      contractAddress: 'zil1x2sc5pdnv70hqm9hj7aza4jet8dexaku938fy8',
      showUntil: dayjs('2022-10-11T12:00:00.000+0800'),
      usdRatio: '1.0',
      usdTarget: '$1,000,000',
      version: 2,
      minZwap: 46.46,
      whitelistDiscountPercent: 5,
      tokenPrice: 0.01,
    },
    {
      projectURL: 'https://docs.zilswap.io/zilo/overview/zilo-7-metasportz-city-mszc',
      imageURL:
        'https://switcheo-assets.s3.ap-southeast-1.amazonaws.com/zilswap/ZILO-7-MSZC-banner.jpg',
      tokenSymbol: 'MSZC',
      tokenName: 'MetaSportZ City',
      tokenDecimals: 12,
      description:
        'MetaSportZ City is the world’s first “Sportaverse” – within the next internet – featuring the next gamified sports and gaming entertainment experiences on web 3.5.',
      contractAddress: 'zil1x2sc5pdnv70hqm9hj7aza4jet8dexaku938fy8',
      showUntil: dayjs('2022-10-13T12:00:00.000+0800'),
      usdRatio: '1.0',
      usdTarget: '$1,000,000',
      version: 2,
      minZwap: 46.46,
      whitelistDiscountPercent: 5,
      tokenPrice: 0.01,
    },
  ],
};

export const getBlocksPerMinute = (network = Network.MainNet) => {
  switch (network) {
    case Network.MainNet:
      return 1.58;
    default:
      return 2.75;
  }
};
