import { Box, BoxProps, Avatar, Badge, Card, CardMedia } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React from "react";

interface Props extends BoxProps {
  badgeContent?: React.Component | JSX.Element,
  hideBanner?: boolean,
  avatarImage?: string,
  bannerImage?: string,
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(3),
    borderRadius: 0,
    boxShadow: "none",
    backgroundColor: "transparent",
    overflow: "inherit",
  },
  avatarBox: {
    marginTop: "-65px",
    display: "flex",
  },
  bannerImage: {
    backgroundRepeat: "no-repeat",
    backgroundPositionY: "100%",
    backgroundPositionX: "center",
    borderRadius: 5,
    backgroundColor: "#29475A",
  },
  avatar: {
    height: 130,
    width: 130,
    border: "5px solid #0D1B24",
  },
  infoBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const TEMP_BANNER_URL = "https://pbs.twimg.com/profile_banners/1429715941399486466/1630400388/1500x500";
const TEMP_BEAR_AVATAR_URL = "https://pbs.twimg.com/profile_images/1432977604563193858/z01O7Sey_400x400.jpg";

const ArkBanner: React.FC<Props> = (props: Props) => {
  const {
    children, className, badgeContent, avatarImage = TEMP_BEAR_AVATAR_URL,
    bannerImage = TEMP_BANNER_URL, hideBanner
  } = props;
  const classes = useStyles();

  const Wrapper: React.FC<any> = ({ children, ...rest }) => {
    if (!badgeContent) return children
    return (
      <Badge
        overlap="circle"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={badgeContent}
        {...rest}
      >
        {children}
      </Badge>
    )
  }

  return (
    <Card className={classes.root}>
      {!hideBanner && (
        <CardMedia
          component="img"
          alt="Banner Image"
          height="250"
          image={bannerImage}
          className={classes.bannerImage}
        />
      )}

      <Box className={classes.infoBox}>
        <Box className={cls(classes.avatarBox, className)}>
          <Wrapper>
            <Avatar
              className={classes.avatar}
              alt="Avatar Image"
              src={avatarImage}
            />
          </Wrapper>
        </Box>
        {children}
      </Box>
    </Card>
  );
};

export default ArkBanner;
