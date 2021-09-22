import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardProps,
  makeStyles,
} from "@material-ui/core";
import cls from "classnames";
import React from "react";
import { Text } from "app/components";
import { ReactComponent as VerifiedBadge } from "../../verified-badge.svg";

export interface Props extends CardProps {}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    maxWidth: "308px",
    borderRadius: 5,
    boxShadow: "none",
    backgroundColor: "transparent",
    position: "relative",
  },
  tokenId: {
    color: "#511500",
    fontSize: "40px",
    lineHeight: "50px",
    [theme.breakpoints.down("md")]: {
      fontSize: "30px",
      lineHeight: "40px",
    },
  },
  cardContent: {
    marginLeft: "-16px",
    marginRight: "-16px",
  },
  title: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "14px",
    lineHeight: "16px",
    color: "#DEFFFF",
    textTransform: "uppercase",
  },
  body: {
    fontSize: "12px",
    fontWeight: 700,
    color: "rgba(222, 255, 255, 0.5)",
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "15px",
    height: "15px",
    verticalAlign: "text-top",
  },
}));

const NftCard: React.FC<Props> = (props: Props) => {
  const { className, ...rest } = props;
  const classes = useStyles();

  return (
    <Card {...rest} className={cls(classes.root, className)}>
      <CardMedia
        component="img"
        alt="NFT image"
        height="308"
        image="https://thebearmarket.s3.ap-southeast-1.amazonaws.com/assets/082479c2cecf1c0a6ad7da55bbf7643486533457543af13c4ee732a3d2871b4c.png"
      />
      <CardContent className={classes.cardContent}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          {/* to truncate if too long? */}
          <Text className={classes.title}>
            the bear market
            <VerifiedBadge className={classes.verifiedBadge} />
          </Text>
          <Text className={classes.title}>1M ZIL</Text>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={0.5}
        >
          <Text className={classes.body}>#8888</Text>
          <Text className={classes.body}>~$100,000</Text>
        </Box>

        {/* Rarity indicator */}
      </CardContent>
    </Card>
  );
};

export default NftCard;
