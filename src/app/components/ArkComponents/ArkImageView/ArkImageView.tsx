import React, { useEffect, useState, useRef } from "react";
import { useTheme, CardMedia, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { useIntersectionObserver } from "app/utils";
import PlaceholderLight from "./placeholder_bear_light.png";
import PlaceholderDark from "./placeholder_bear_dark.png";
import NFTCardLight from "./NFTCard_Light.png";
import NFTCardDark from "./NFTCard_Dark.png";
import BannerLight from "./Banner_Light.png";
import BannerDark from "./Banner_Dark.png";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl?: string | null;
  imageType: "card" | "banner" | "avatar";
  altName?: string;
}

const ArkImageView: React.FC<Props> = (props: Props) => {
  const { altName, imageType, imageUrl, className, ...rest } = props;
  const classes = useStyles();
  const imgRef = useRef<any>();
  const theme = useTheme().palette.type;
  const [imgSrc, setImgSrc] = useState<string | undefined>();
  const [isInView, setIsInView] = useState(false);

  useIntersectionObserver(imgRef, () => {
    setIsInView(true);
  });

  useEffect(() => {
    if (!imageUrl || !isInView) return setImgSrc(undefined);
    if (imageUrl === imgSrc) return;

    let image = new Image();
    image.onload = () => setImgSrc(imageUrl);

    image.src = imageUrl;

    // eslint-disable-next-line
  }, [imageUrl, isInView]);

  const image = isInView ? imgSrc : null;

  switch (imageType) {
    case "banner": {
      const placeholder = theme === "dark" ? BannerDark : BannerLight;
      return (
        <CardMedia
          ref={imgRef}
          component="img"
          alt={altName ?? "Banner Image"}
          height="250"
          image={image ?? placeholder}
          className={className}
          {...rest}
        />
      )
    }
    case "avatar": {
      const placeholder = theme === "dark" ? PlaceholderDark : PlaceholderLight;
      return (
        <Avatar
          ref={imgRef}
          className={className}
          alt={altName ?? "Avatar Image"}
          src={image ?? placeholder}
          {...rest}
        />
      )
    }
    default: {
      const placeholder = theme === "dark" ? NFTCardDark : NFTCardLight;
      return (
        <img
          ref={imgRef}
          alt={altName ?? "Card image"}
          src={image ?? placeholder}
          {...rest}
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
