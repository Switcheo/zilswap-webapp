import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core";
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
  const [collectionFloor, setCollectionFloor] = useState([]);
  const [salePrice, setSalePrice] = useState([]);
  const [bidPrice, setBidPrice] = useState([]);

  interface CollectionFloor {
    floorPrice: string,
    intervalTime: string,
  }

  interface SalePrice {
    highestSale: string,
    intervalTime: string,
  }

  interface BidPrice {
    highestBid: string,
    intervalTime: string,
  }

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
      setCollectionFloor(result.result);
    })
  }

  const getSalePrice = () => {
    runGetSalePrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getSalePrice({ collection, tokenId, interval });
      setSalePrice(result.result);
    })
  }

  const getBidPrice = () => {
    runGetBidPrice(async () => {
      const arkClient = new ArkClient(network);
      const result = await arkClient.getBidPrice({ collection, tokenId, interval });
      setBidPrice(result.result);
    })
  }


  return <ArkBox variant="base" className={classes.container}>
    {(collectionFloor).map((obj: CollectionFloor) => {
      return <div>
        Floor price is : {obj.floorPrice}   At time : {obj.intervalTime}
      </div>
    })}

    {(salePrice).map((obj: SalePrice) => {
      return <div>
        Sale price is : {obj.highestSale}   At time : {obj.intervalTime}
      </div>
    })}

    {(bidPrice).map((obj: BidPrice) => {
      return <div>
        Bid price is : {obj.highestBid}   At time : {obj.intervalTime}
      </div>
    })}

  </ArkBox >
};

export default ArkPriceHistoryGraph;