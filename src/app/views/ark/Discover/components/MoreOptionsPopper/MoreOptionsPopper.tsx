import React, { Fragment, useMemo, useState } from "react";
import {
  Box, CardProps, ClickAwayListener, IconButton, Link, makeStyles, Popper, Typography
} from "@material-ui/core";
import { Network } from "zilswap-sdk/lib/constants";
import { toBech32Address } from "@zilliqa-js/crypto";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { ArkReportCollectionDialog } from "app/components";
import { AppTheme } from "app/theme/types";
import { useNetwork } from "app/utils";

export interface Props extends CardProps {
  collectionAddress: string;
}

const MoreOptionsPopper: React.FC<Props> = (props: Props) => {
  const { collectionAddress } = props;
  const classes = useStyles();
  const network = useNetwork();
  const [popAnchor, setPopAnchor] = useState(null);
  const [openReportDialog, setOpenReportDialog] = useState(false);

  const explorerLink = useMemo(() => {
    const addr = toBech32Address(collectionAddress);
    if (network === Network.MainNet) {
      return `https://viewblock.io/zilliqa/address/${addr}`;
    } else {
      return `https://viewblock.io/zilliqa/address/${addr}&network=testnet`;
    }
  }, [network, collectionAddress]);

  const handlePopClick = (event: React.BaseSyntheticEvent) => {
    event.preventDefault();
    setPopAnchor(popAnchor ? null : event.currentTarget)
  }

  const closePopper = () => {
    setPopAnchor(null);
  }

  return (
    <Fragment>
      <IconButton size="small" className={classes.extrasButton} onClick={handlePopClick}>
        <MoreHorizIcon />
      </IconButton>
      {popAnchor && (<ClickAwayListener onClickAway={closePopper}>
        <Popper onClick={event => event.stopPropagation()} className={classes.popper}
          open anchorEl={popAnchor} placement="bottom-end">
          <Link
            className={classes.popperText}
            underline="none"
            target="_blank"
            href={explorerLink}
            onClick={closePopper}>
            <Typography className={classes.popperText}>View on Explorer</Typography>
          </Link>
          <Box className={classes.divider} />
          <Typography className={classes.popperText} onClick={() => { setOpenReportDialog(true); closePopper(); }}>Report Collection</Typography>
        </Popper>
      </ClickAwayListener>)}
      <Box onClick={event => event.stopPropagation()}>
        <ArkReportCollectionDialog open={openReportDialog} onCloseDialog={() => setOpenReportDialog(false)} collectionAddress={collectionAddress} />
      </Box>
    </Fragment>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  extrasButton: {
    color: theme.palette.text?.primary,
    alignSelf: "flex-end",
    opacity: 0.5,
    cursor: "pointer",
    "&:hover": {
      opacity: 1,
    },
    "& svg": {
      fontSize: 24,
    },
  },
  popper: {
    backgroundColor: theme.palette.type === "dark" ? theme.palette.primary.main : "#FFFFFF",
    border: theme.palette.border,
    borderWidth: "2px !important",
    padding: theme.spacing(1, 2),
    borderRadius: 12,
  },
  divider: {
    border: theme.palette.border
  },
  popperText: {
    color: theme.palette.type === "dark" ? theme.palette.primary.contrastText : theme.palette.primary.main,
    padding: theme.spacing(1, 0, 1),
    cursor: "pointer",
    "&:hover": {
      color: "#6BE1FF",
    }
  },
}));

export default MoreOptionsPopper;
