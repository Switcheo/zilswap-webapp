import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { HTTP } from "../utilities/http";

export interface CoinGeckoPriceResult {
	[index: string]: BigNumber;
};

interface GetETHBalanceProps {
	network: Network;
  walletAddress: string;
};

interface GetTokenBalancesProps {
	network: Network;
  tokenAddresses: string[];
  walletAddress: string;
};

interface GetTokenAllowanceProps {
	network: Network;
  tokenAddress: string;
  walletAddress: string;
  spenderAddress: string;
};

/**
 * Ethereum Web3 balances API abstraction object
 */
export class ETHBalances {
  static getClient = (network: Network): HTTP<{ root: string }> => {
    const url = network === Network.MainNet ?
      "https://eth-mainnet.alchemyapi.io/v2/MSB_PM1tNIxC1CD9al_iNOR5MbpcjsgS/" :
      "https://eth-ropsten.alchemyapi.io/v2/-1JW5e_GEXU__5KEsCH_jYlavG3HowZC/"
    return new HTTP(url, { root: '' })
  }

	static getETHBalance = async ({ network, walletAddress }: GetETHBalanceProps): Promise<BigNumber> => {
    const client = ETHBalances.getClient(network)
    const response = await client.post({ url: client.path("root"), data: {
      id: "1",
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [walletAddress, 'latest'],
    }}).then(res => res.json());
    return new BigNumber(response.result)
	}

  static getTokenBalances = async ({ network, tokenAddresses, walletAddress }: GetTokenBalancesProps): Promise<{[tokenAddress: string]: BigNumber}> => {
    const client = ETHBalances.getClient(network)
		const response = await client.post({ url: client.path("root"), data: {
      id: "1",
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      params: [
        walletAddress,
        tokenAddresses,
      ],
    }}).then(res => res.json());
    return response.result.tokenBalances.reduce((acc: {[tokenAddress: string]: BigNumber}, item: { contractAddress: string, tokenBalance: string}) => {
      acc[item.contractAddress] = new BigNumber(item.tokenBalance, 16)
      return acc
    }, {})
  }

  static getTokenAllowance = async ({ network, tokenAddress, walletAddress, spenderAddress }: GetTokenAllowanceProps): Promise<BigNumber> => {
    const client = ETHBalances.getClient(network)
		const response = await client.post({ url: client.path("root"), data: {
      id: "1",
      jsonrpc: "2.0",
      method: "alchemy_getTokenAllowance",
      params: [
        {
          contract: tokenAddress,
          owner: walletAddress,
          spender: spenderAddress,
        }
      ],
    }}).then(res => res.json());
		return new BigNumber(response.result)
  }
}
