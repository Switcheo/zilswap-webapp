import { BN, bytes } from '@zilliqa-js/util';
import { fromBech32Address } from "@zilliqa-js/crypto";
import BigNumber from "bignumber.js";
import { ConnectedWallet } from "core/wallet";
import { ZilswapConnector } from 'core/zilswap';
import { Network } from "zilswap-sdk/lib/constants";
import { DIST_CONTRACT } from "./constants";
import { ObservedTx } from "zilswap-sdk";
import { logger } from 'core/utilities';

export interface CheckClaimHistory {

}

export const fetchClaimHistory = async () => {

}

export interface ClaimEpochOpts {
  network: Network
  wallet: ConnectedWallet
  epochNumber: number;
  amount: BigNumber;
  proof: string[];
};

const CHAIN_ID = {
  [Network.TestNet]: 333, // chainId of the developer testnet
  [Network.MainNet]: 1, // chainId of the mainnet
}
const msgVersion = 1; // current msgVersion

const getTxArgs = (epoch: number, proof: string[], address: string, amount: BigNumber, contractAddr: string) => {
  const contractAddrByStr20 = fromBech32Address(contractAddr).toLowerCase();
  return [{
    vname: "claim",
    type: `${contractAddrByStr20}.Claim`,
    value: {
      constructor: `${contractAddrByStr20}.Claim`,
      argtypes: [],
      arguments: [
        epoch.toString(),
        {
          constructor: `${contractAddrByStr20}.DistributionLeaf`,
          argtypes: [],
          arguments: [address, amount.toString(10)],
        },
        proof.map(item => `0x${item}`),
      ],
    },
  }];
};

export const claim = async (claimOpts: ClaimEpochOpts): Promise<ObservedTx> => {
  const { network, wallet, epochNumber, proof, amount } = claimOpts;
  const zilswap = ZilswapConnector.getSDK()

  if (!zilswap.zilliqa) throw new Error("Wallet not connected");

  const contractAddr = DIST_CONTRACT[network]
  const chainId = CHAIN_ID[network];
  const distContract = zilswap.getContract(contractAddr);

  const address = wallet.addressInfo.byte20;

  const args: any = getTxArgs(epochNumber, proof, address, amount, contractAddr);

  const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
  const params: any = {
    amount: new BN(0),
    gasPrice: new BN(minGasPrice),
    gasLimit: "5000",
    version: bytes.pack(chainId, msgVersion),
  };

  const claimTx = await zilswap.callContract(distContract, "Claim", args, params, true);
  logger("claim tx dispatched", claimTx.id);

  if (claimTx.isRejected()) {
    throw new Error('Submitted transaction was rejected.')
  }

  const observeTxn: ObservedTx = {
    hash: claimTx.id!,
    deadline: Number.MAX_SAFE_INTEGER,
  };

  await zilswap.observeTx(observeTxn)

  return observeTxn
};
