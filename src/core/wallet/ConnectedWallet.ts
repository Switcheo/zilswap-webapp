import moment from "moment";

export type ConnectOptionType = "moonlet" | "privateKey";

export enum WalletConnectType {
  Moonlet, PrivateKey
}

export type ConnectedWallet = {
  type: WalletConnectType;
  balance: string;
  timestamp: moment.Moment;
  transactions: Array<any>;
  reload: () => Promise<void>;
  getTransaction: () => Promise<void>;
}

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
}
