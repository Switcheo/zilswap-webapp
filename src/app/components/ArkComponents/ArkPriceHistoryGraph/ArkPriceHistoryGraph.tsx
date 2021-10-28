import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core";
import BigNumber from "bignumber.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArkBox } from "app/components";
import { AppTheme } from "app/theme/types";
import { getBlockchain } from "app/saga/selectors";
import { ArkClient } from "core/utilities";
import { useAsyncTask } from "app/utils";
import { fromBech32Address } from "core/zilswap";

interface Props {
  collectionId: string;
  tokenId: string;
  interval: string;
}

interface CollectionFloor {
  value: number,
  intervalTime: string,
}

interface SalePrice {
  value: number,
  intervalTime: string,
}

interface BidPrice {
  value: number,
  intervalTime: string,
}

const useStyles = makeStyles((theme: AppTheme) => ({
  container: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 5),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
}));

const ArkPriceHistoryGraph: React.FC<Props> = (props: Props) => {
  const { collectionId, tokenId, interval } = props;
  const collection = fromBech32Address(collectionId).toLowerCase();
  const classes = useStyles();
  const { network } = useSelector(getBlockchain);
  const [runGetCollectionFloor] = useAsyncTask("getCollectionFloor");
  const [runGetSalePrice] = useAsyncTask("getSalePrice");
  const [runGetBidPrice] = useAsyncTask("getBidPrice");
  const [collectionFloor, setCollectionFloor] = useState<CollectionFloor[]>([]);
  const [salePrice, setSalePrice] = useState<SalePrice[]>([]);
  const [bidPrice, setBidPrice] = useState<BidPrice[]>([]);

  useEffect(() => {
    getCollectionFloor();
    getSalePrice();
    getBidPrice();
    // eslint-disable-next-line
  }, [])

  const getCollectionFloor = () => {
    runGetCollectionFloor(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getCollectionFloor({ collection, interval });
      const arr = result.result.map((obj: any) => {
        obj.value = new BigNumber(obj.floorPrice).shiftedBy(-12).toNumber();
        return obj
      })
      console.log(arr);
      setCollectionFloor(arr)
    })
  }

  const getSalePrice = () => {
    runGetSalePrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getSalePrice({ collection, tokenId, interval });
      const arr = result.result.map((obj: any) => {
        obj.value = new BigNumber(obj.highestSale).shiftedBy(-12).toNumber();
        return obj
      })
      console.log(arr);
      setSalePrice(arr);
    })
  }

  const getBidPrice = () => {
    runGetBidPrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getBidPrice({ collection, tokenId, interval });
      const arr = result.result.map((obj: any) => {
        obj.value = new BigNumber(obj.highestBid).shiftedBy(-12).toNumber();
        return obj
      })
      console.log(arr);
      setBidPrice(arr);
    })
  }

  const series = [
    {
      name: 'Collection Floor',
      data: collectionFloor,
    },
    {
      name: 'Sale Price',
      data: salePrice,
    },
    {
      name: 'Bid Price',
      data: bidPrice,
    },
  ];


  return <ArkBox variant="base" className={classes.container}>
    {(collectionFloor).map((obj: CollectionFloor) => {
      return <div>
        Floor price is : {obj.value}   At time : {obj.intervalTime}
      </div>
    })}

    {(salePrice).map((obj: SalePrice) => {
      return <div>
        Sale price is : {obj.value}   At time : {obj.intervalTime}
      </div>
    })}

    {(bidPrice).map((obj: BidPrice) => {
      return <div>
        Bid price is : {obj.value}   At time : {obj.intervalTime}
      </div>
    })}

    <ResponsiveContainer minWidth={600} minHeight={400} width="100%" height="100%">
      <LineChart width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="intervalTime"
          type="category"
          allowDuplicatedCategory={false} />
        <YAxis dataKey="value"
          type="number"
          domain={['auto', 'auto']}
        />
        <Tooltip />
        <Legend />
        {series.map((s) => (
          <Line dataKey="value" data={s.data} name={s.name} key={s.name} />
        ))}
      </LineChart>
    </ResponsiveContainer>

  </ArkBox >
};

export default ArkPriceHistoryGraph;
