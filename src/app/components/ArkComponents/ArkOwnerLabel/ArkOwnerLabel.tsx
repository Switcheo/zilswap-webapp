import React from "react";
import { Typography, TypographyProps, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { darken } from '@material-ui/core/styles';
import { getWallet } from "app/saga/selectors";
import { MarketplaceUser } from "app/store/types";
import { AppTheme } from "app/theme/types";
import { truncateAddress } from "app/utils";

type Props = TypographyProps & ({
  address?: string;
  user?: MarketplaceUser | null;
})

const ArkOwnerLabel: React.FC<Props> = (props: Props) => {
  const { children, className, address, user, ...rest } = props;
  const { wallet } = useSelector(getWallet);
  const classes = useStyles();

  const walletAddress = wallet?.addressInfo.byte20.toLowerCase();

  let text = "";
  if (walletAddress && (address === walletAddress || user?.address === walletAddress)) {
    text = "You";
  } else if (address) {
    text = truncateAddress(address);
  } else if (user?.username) {
    text = user.username;
  } else if (user?.address) {
    text = truncateAddress(user.address);
  }

  return (
    <Box className={classes.link} >
      <Link to={`/arky/profile?address=${user?.address ?? address}`}>
        <Typography component="span" {...rest} className={cls(classes.root, className)}>
          {text}
        </Typography>
      </Link>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    fontSize: "12px",
    fontWeight: 700,
    color: "#6BE1FF",
    maxWidth: 100,
    textOverflow: "ellipsis",
    overflow: "hidden",
    display: "block",
    whiteSpace: "nowrap",
    marginLeft: "auto",
    marginRight: "auto",
  },
  link: {
    "& .MuiTypography-root": {
      fontSize: "14px",
    },
    '&:hover $root': {
      color: darken('#6BE1FF', 0.1),
    }
  }
}));

export default ArkOwnerLabel;
