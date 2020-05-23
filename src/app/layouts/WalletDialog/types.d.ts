import { BoxProps } from "@material-ui/core";

export interface ConnectWalletManagerViewProps extends BoxProps {
  onResult: (wallet: ConnectedWallet | null) => void;
}