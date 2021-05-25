
import { RootState } from "app/store/types";
import { useSelector } from "react-redux";
import { Network } from "zilswap-sdk/lib/constants";

const useNetwork = () => useSelector<RootState, Network>(state => state.blockchain.network);

export default useNetwork;
