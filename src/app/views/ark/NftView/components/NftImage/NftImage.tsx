import {
  Box, Card, CardHeader, CardMedia, CardProps, IconButton, SvgIcon, Typography
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UnlikedIcon from "@material-ui/icons/FavoriteBorderRounded";
import LikedIcon from "@material-ui/icons/FavoriteRounded";
import { SocialLinkGroup } from "app/components";
import { Asset } from "app/store/types";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";

interface Props extends CardProps {
  nftAsset?: Asset,
}

const NftImage: React.FC<Props> = (props: Props) => {
  const { nftAsset, children, className, ...rest } = props;
  const classes = useStyles();
  const [liked, setLiked] = useState<boolean>(false);

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardHeader
        className={classes.cardHeader}
        title={
          <Box display="flex" alignItems="center">
            <Typography className={classes.likes}>20K</Typography>
            <IconButton
              onClick={() => setLiked(!liked)}
              className={classes.likeIconButton}
              disableRipple
            >
              <SvgIcon
                component={liked ? LikedIcon : UnlikedIcon}
                className={classes.likeButton}
              />
            </IconButton>
          </Box>
        } />

      <CardMedia
        alt={nftAsset?.filename || "Token Image"}
        component="img"
        image={nftAsset?.url || undefined}
        className={classes.media}
      />
      <Box display="flex" flexDirection="row" justifyContent="center" alignItems="center">
        <Typography>Share</Typography><SocialLinkGroup />
      </Box>
    </Card>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
    overflow: "visible",
    background: "rgba(76, 175, 80, 0.0)",
  },
  cardHeader: {
    border: "2px solid #29475A",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    "&.MuiCardHeader-root": {
      padding: "8px 16px 8px 16px"
    }
  },
  cardContent: {

  },
  cardAction: {

  },
  media: {
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    maxWidth: "300px",
  },
  likes: {
    color: theme.palette.label,
    fontSize: "12px",
    lineHeight: "14px",
    marginRight: "4px",
  },
  likeIconButton: {
    padding: 0,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  likeButton: {
    color: theme.palette.primary.light,
  },
}));

export default NftImage;
