import React from "react";
import { Box, CardProps, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { ArkShareLinksGroup, ArkImageView } from "app/components";
import { Nft } from "app/store/types";
import { AppTheme } from "app/theme/types";

interface Props extends CardProps {
  token?: Nft | null,
  onReload?: (bypass?: boolean) => void,
}

const NftImage: React.FC<Props> = (props: Props) => {
  const { onReload, token, children, className, ...rest } = props;
  const classes = useStyles();


  return (
    <Box  {...rest} className={cls(classes.root, className)}>
      <Box className={classes.imageContainer}>
        <span className={classes.imageHeight} />
        <ArkImageView
          className={classes.image}
          altName={token?.asset?.filename || "Token Image"}
          imageUrl={token?.asset?.url}
          imageType="card"
        />
      </Box>
      <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Typography variant="body1">Share</Typography>
        <ArkShareLinksGroup className={classes.socialLinkGroup} />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
  },
  imageContainer: {
    borderRadius: theme.spacing(1.5),
    width: "100%",
    position: "relative",
  },
  imageHeight: {
    display: "block",
    position: "relative",
    paddingTop: "100%",
  },
  image: {
    boxShadow: "0px 4px 20px #002028",
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
  },
  socialLinkGroup: {
    marginTop: theme.spacing(.5),
    marginLeft: theme.spacing(2),
  },
}));

export default NftImage;
