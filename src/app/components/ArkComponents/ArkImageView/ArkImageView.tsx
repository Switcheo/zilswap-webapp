import React, { useEffect, useState } from "react";
import { useTheme, CardMedia, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import PlaceholderLight from "./placeholder_bear_light.png";
import PlaceholderDark from "./placeholder_bear_dark.png";
import NFTCardLight from "./NFTCard_Light.png";
import NFTCardDark from "./NFTCard_Dark.png";
import BannerLight from "./Banner_Light.png";
import BannerDark from "./Banner_Dark.png";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string;
  imageType: "card" | "banner" | "avatar";
  altName?: string;
}

const ArkImageView: React.FC<Props> = (props: Props) => {
  const { altName, imageType, imageUrl, className } = props;
  const classes = useStyles();
  const theme = useTheme().palette.type;
  const [imgSrc, setImgSrc] = useState<string | undefined>(imageUrl);

  useEffect(() => {
    if (!imageUrl) return;
    if (imageUrl === imgSrc) return;

    let image = new Image();
    image.onload = () => {
      setImgSrc(imageUrl);
    }
    image.onerror = () => {
      setImgSrc(undefined);
    }

    image.src = imageUrl;

    // eslint-disable-next-line
  }, [imageUrl])

  switch (imageType) {
    case "banner": {
      const placeholder = theme === "dark" ? BannerDark : BannerLight;
      return (
        <CardMedia
          component="img"
          alt={altName ?? "Banner Image"}
          height="250"
          image={imgSrc ?? placeholder}
          className={className}
        />
      )
    }
    case "avatar": {
      const placeholder = theme === "dark" ? PlaceholderDark : PlaceholderLight;
      return (
        <Avatar
          className={className}
          alt={altName ?? "Avatar Image"}
          src={imgSrc ?? placeholder}
        />
      )
    }
    default: {
      const placeholder = theme === "dark" ? NFTCardDark : NFTCardLight;
      return (
        <img
          alt={altName ?? "Card image"}
          src={imgSrc ?? placeholder}
          className={cls(classes.root, className)} />
      );
    }
  }
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

export default ArkImageView;
