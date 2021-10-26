
import { useSelector } from "react-redux";
import { Network } from "zilswap-sdk/lib/constants";
import { RootState } from "app/store/types";

const useNetwork = () => useSelector<RootState, Network>(state => state.blockchain.network);

export default useNetwork;
