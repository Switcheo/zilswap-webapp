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

const SampleComponent: React.FC<Props> = (props: Props) => {
  const { altName, imageType, imageUrl, className } = props;
  const classes = useStyles();
  const theme = useTheme().palette.type;
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!imageUrl) return;
    if (imageUrl === imgSrc) return;

    let image = new Image();
    image.onload = () => {
      setImgSrc(imageUrl);
    }

    image.src = imageUrl;
  }, [imageUrl, imgSrc])

  const getPlaceholder = () => {
    switch (imageType) {
      case "card":
        return theme === "dark" ? NFTCardDark : NFTCardLight
      case "avatar":
        return theme === "dark" ? PlaceholderDark : PlaceholderLight;
      case "banner":
        return theme === "dark" ? BannerDark : BannerLight;
    }
  }

  const placeHolder = getPlaceholder();

  if (imageType === "banner") {
    return (
      <CardMedia
        component="img"
        alt={altName || "Banner Image"}
        height="250"
        image={imgSrc || placeHolder}
        className={className}
      />
    )
  }

  if (imageType === "avatar") {
    return (
      <Avatar
        className={className}
        alt={altName || "Avatar Image"}
        src={imgSrc || placeHolder}
      />
    )
  }

  return (
    <img
      alt={altName || "Card image"}
      src={imgSrc || placeHolder}
      className={cls(classes.root, className)} />
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));

export default SampleComponent;
