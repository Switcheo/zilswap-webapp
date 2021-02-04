import { RootState, ZAPEpochInfo } from "app/store/types";
import { useSelector } from "react-redux";
import { PRODUCTION_HOSTS } from "./constants";

export default () => {
  const hostname = window.location.hostname;
  if (hostname && !PRODUCTION_HOSTS.includes(hostname)) return true;

  const epochInfo = useSelector<RootState, ZAPEpochInfo | null>(state => state.rewards.epochInfo);

  return (epochInfo?.current ?? 0) >= 2;
};
