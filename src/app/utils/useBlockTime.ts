import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { ZilswapConnector } from "core/zilswap";
import { useNetwork } from "app/utils";

const useBlockTime = () => {
  const network = useNetwork()
  const [currentBlock, setCurrentBlock] = useState<number>(0)
  const [blockTime, setBlockTime] = useState<Dayjs>(dayjs())
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs())

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const newBlock = ZilswapConnector.getCurrentBlock()
        if (newBlock !== currentBlock) {
          setCurrentBlock(newBlock)
          setBlockTime(dayjs())
        }
      } catch (e) {
        console.warn('Failed to get current block. Will try again in 1s. Error:')
        console.warn(e)
      }
      setCurrentTime(dayjs())
    }, 1000);
    return () => clearInterval(interval)
  }, [network, currentBlock])

  return [blockTime, currentBlock, currentTime] as [Dayjs, number, Dayjs]
}

export default useBlockTime
