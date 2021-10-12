import {
  Box, Card, CardHeader, CardMedia, CardProps, IconButton,
  SvgIcon, Typography, CardContent
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
    <Box  {...rest} className={cls(classes.root, className)}>
      <Card className={classes.card}>
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

        <CardContent className={classes.cardContent}>
          <CardMedia
            alt={nftAsset?.filename || "Token Image"}
            component="img"
            image={nftAsset?.url || undefined}
            className={classes.media}
          />
        </CardContent>
      </Card>
      <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
        <Typography>Share</Typography><SocialLinkGroup />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "relative",
    maxWidth: 308,
  },
  card: {
    background: "rgba(76, 175, 80, 0.0)",
  },
  cardHeader: {
    border: "2px solid #29475A",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    "&.MuiCardHeader-root": {
      padding: "6px 16px 6px 16px"
    }
  },
  cardContent: {
    padding: 0,
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
  },
  cardAction: {

  },
  media: {
    width: "calc(100% + 16px)",
    height: "calc(100% + 16px)",
    objectFit: "cover",
    backgroundPositionX: "center",
    transform: "translate(-8px)",
    overflow: "hidden",
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
