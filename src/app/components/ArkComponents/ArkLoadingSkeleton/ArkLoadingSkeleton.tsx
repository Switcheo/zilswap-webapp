import React, { Fragment } from "react";
import {
  Box, BoxProps, Card, CardContent, CardHeader, CardActionArea, Grid,
  TableContainer, Table, TableBody, TableRow, TableCell,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";
import { ArkBox } from "app/components";

interface Props extends BoxProps {
  type?: "Card" | "Table" | "NFT";
  row?: number;
  rowWidth?: string,
}

const ArkLoadingSkeleton: React.FC<Props> = (props: Props) => {
  const { rowWidth = "100%", type, row = 1 } = props;
  const classes = useStyles();

  const getLoadingContent = () => {
    switch (type) {
      case "NFT": return (
        <Fragment>
          {Array.from({ length: 8 }, (_, i) => i + 1).map(index => (
            <Grid item key={`loading-nft-${index}`} xs={12} lg={3} md={4} sm={6} className={classes.gridItem}>
              <Card className={classes.nftCard}>
                <CardHeader />
                <Skeleton variant="rect" animation="wave" height="320px" className={classes.skeletonBox} />
                <Box mt={1} />
                <CardActionArea>
                  <Skeleton animation="wave" height="20" className={cls(classes.skeletonBox, classes.roundBorder)} />
                  <Skeleton animation="wave" height="20" className={cls(classes.skeletonBox, classes.roundBorder)} />
                  <Skeleton animation="wave" height="20" className={cls(classes.skeletonBox, classes.roundBorder)} />
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Fragment>
      )

      case "Card": return (
        <Card className={classes.bidCard}>
          <ArkBox variant="base">
            <CardHeader
              avatar={<Skeleton animation="wave" variant="circle" width={40} height={40} className={classes.skeletonBox} />}
              title={<Skeleton animation="wave" height={10} />}
              subheader={<Skeleton animation="wave" height={10} />}
            />
            <CardContent>
              {Array.from({ length: 4 }, (_, i) => i + 1).map(index => (
                <Box display="flex" flexDirection="row">
                  <Skeleton width="30%" animation="wave" height="20px" className={classes.skeletonBox} />
                  <Box flexGrow={1} />
                  <Skeleton width="40%" animation="wave" height="20px" className={classes.skeletonBox} />
                </Box>
              ))}
            </CardContent>
          </ArkBox>
        </Card>
      )
      default: return (
        <ArkBox variant="base" className={classes.tableContainer}>
          <TableContainer>
            <Table>
              <TableBody>
                {Array.from({ length: row }, (_, i) => i + 1).map(index => (
                  <TableRow key={index} className={classes.tableRow}>
                    <TableCell className={classes.tableCell}>
                      <Skeleton animation="wave" height="40px" width={rowWidth} className={classes.skeletonBox} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </ArkBox>
      )
    }
  }

  return (
    <Fragment>
      {getLoadingContent()}
    </Fragment>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.up("md")]: {
      display: "flex",
      flexDirection: "column",
      alignContent: 'center',
      alignItems: "center",
    }
  },
  skeletonBox: {
    backgroundColor: theme.palette.type === "dark" ? "#1C4550" : "#D5F3FC",
    opacity: 0.6,
    "&.MuiSkeleton-text": {
      transform: "scale(1, 0.8)",
    }
  },
  actionBox: {
    padding: theme.spacing(2),
    width: "50%",
    height: 40,
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  roundBorder: {
    borderRadius: theme.spacing(1),
  },
  bidCard: {
    marginTop: theme.spacing(2),
  },
  nftCard: {
    width: "100%",
    minWidth: "280px",
    borderRadius: '10px 10px 0 0',
    boxShadow: "none",
    backgroundColor: "transparent",
    position: "relative",
    overflow: "initial",
    "& .MuiCardContent-root:last-child": {
      paddingBottom: theme.spacing(1.5),
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "240px",
    },
  },
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    padding: theme.spacing(2, 3),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
  tableCell: {
    padding: theme.spacing(.5, 1),
    extend: ['text', 'cell'],
    borderBottom: "none",
  },
  tableRow: {
  }
}));

export default ArkLoadingSkeleton;