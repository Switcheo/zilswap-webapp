import React from "react";
import { Badge, Box, BoxProps, Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { ArkImageView } from "app/components";

interface Props extends BoxProps {
  badgeContent?: React.Component | JSX.Element;
  hideBanner?: boolean;
  avatarImage?: string | null;
  bannerImage?: string | null;
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
    height: "130px !important",
    width: "130px !important",
    border: `5px solid ${theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF"
      }`,
  },
  infoBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
}));

const ArkBanner: React.FC<Props> = (props: Props) => {
  const {
    className,
    badgeContent,
    avatarImage,
    bannerImage,
    hideBanner,
  } = props;
  const classes = useStyles();

  const Wrapper: React.FC<any> = ({ children, ...rest }) => {
    if (!badgeContent) return children;
    return (
      <Badge
        overlap="circle"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={badgeContent}
        {...rest}
      >
        {children}
      </Badge>
    );
  };

  return (
    <Card className={classes.root}>
      {!hideBanner && (
        <ArkImageView
          className={classes.bannerImage}
          imageUrl={bannerImage}
          imageType="banner"
        />
      )}

      <Box className={classes.infoBox}>
        <Box className={cls(classes.avatarBox, className)}>
          <Wrapper>
            <ArkImageView
              className={classes.avatar}
              imageUrl={avatarImage}
              imageType="avatar"
            />
          </Wrapper>
        </Box>
      </Box>
    </Card>
  );
};

export default ArkBanner;
