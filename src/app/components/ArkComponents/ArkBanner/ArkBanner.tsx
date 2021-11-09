import React, { useState, useMemo, useRef } from "react";
import { Badge, Box, BoxProps, TextField, Card, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import { ArkImageView } from "app/components";
import { getWallet } from "app/saga/selectors";
import { actions } from "app/store";

interface Props extends BoxProps {
  badgeContent?: React.Component | JSX.Element;
  hideBanner?: boolean;
  avatarImage?: string | null;
  bannerImage?: string | null;
  uploadBanner?: (file: File) => void;
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
    alignSelf: 'center',
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
    position: "relative",
    width: "100%",
  },
  bannerButton: {
    position: "absolute",
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF17" : "#6BE1FF33",
    color: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
    zIndex: 1000,
    marginRight: 10,
    alignSelf: 'flex-end',
    maxWidth: 140,
    borderRadius: 12,
    fontSize: 14,
    padding: theme.spacing(1, 2),
    cursor: "pointer",
    transform: "translateY(-8px)",
    "&:hover": {
      opacity: 0.5,
    },
    [theme.breakpoints.down("sm")]: {
      maxWidth: 90,
      marginTop: "-65px",
    },
    float: "right",
  },
  uploadInput: {
    display: "none",
  },
  buttonBox: {
    backgroundColor: "#000"
  }
}));

const ArkBanner: React.FC<Props> = (props: Props) => {
  const {
    className,
    badgeContent,
    avatarImage,
    bannerImage,
    hideBanner,
    uploadBanner,
  } = props;
  const classes = useStyles();
  const [showUploadBanner, setShowUploadBanner] = useState(false);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const { wallet } = useSelector(getWallet);
  const dispatch = useDispatch();

  const Wrapper = useMemo(() => {
    const Wrap: React.FC<any> = ({ children, ...rest }) => {
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
    return Wrap;
  }, [badgeContent])

  const onImageUpload = (event: any) => {
    const files = event.target.files;
    if (!files[0] || !uploadBanner) {
      return;
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      uploadBanner(files[0]);
    }

    reader.readAsDataURL(files[0]);
  }

  const onButtonClick = () => {
    if (!wallet) return dispatch(actions.Layout.toggleShowWallet());
    inputRef.current?.click();
  }

  return (
    <Card className={classes.root}>
      {!hideBanner && (
        <ArkImageView
          className={classes.bannerImage}
          imageUrl={bannerImage}
          imageType="banner"
          onClick={() => setShowUploadBanner(!showUploadBanner)}
          onMouseEnter={() => setShowUploadBanner(true)}
          onMouseLeave={() => setShowUploadBanner(false)}
        />
      )}
      <TextField
        className={classes.uploadInput}
        id="ark-banner-image"
        type="file"
        inputRef={inputRef}
        inputProps={{ accept: "image/x-png,image/jpeg" }}
        onChange={onImageUpload}
      />
      <Box className={classes.buttonBox} height={0} display="flex" justifyContent="flex-end">
        {showUploadBanner && uploadBanner && <Button onClick={() => onButtonClick()} onMouseEnter={() => setShowUploadBanner(true)} className={classes.bannerButton}>{bannerImage ? "Edit Banner" : "Add Banner"}</Button>}
      </Box>
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
