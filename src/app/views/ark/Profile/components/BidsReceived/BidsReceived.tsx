import React from "react";
import cls from "classnames";
import {
  Box, BoxProps,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import ArkBidsTable from "app/components/ArkComponents/ArkBidsTable";
import ActiveBidToggle from "../ActiveBidToggle";

interface Props extends BoxProps {
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(2)
  },
}));

const BidsReceived: React.FC<Props> = (props: Props) => {
  const { className } = props;
  const classes = useStyles();

  return (
    <Box className={cls(classes.root, className)}>
      <ActiveBidToggle totalCount={1} header="Bids Received" />
      <ArkBidsTable bids={[]} />
    </Box>
  );
};

export default BidsReceived;
