import {
  Box,
  Breadcrumbs,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SvgIcon from "@material-ui/core/SvgIcon";
import ARKPage from "app/layouts/ARKPage";
import { AppTheme } from "app/theme/types";
import React from "react";
import { Link } from "react-router-dom";
import { ReactComponent as VerifiedBadge } from "../Collection/verified-badge.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
  },
  breadcrumbs: {
    marginTop: theme.spacing(3),
  },
  breadcrumb: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "16px",
    color: "#6BE1FF",
    "-webkit-text-stroke-color": "rgba(107, 225, 255, 0.2)",
    "-webkit-text-stroke-width": "1px",
  },
  mainInfoBox: {
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(8, 10),
    borderRadius: 12,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(4, 5),
      width: "100%",
    },
  },
  collectionName: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 900,
    fontSize: "16px",
    lineHeight: "24px",
    color: "#DEFFFF",
    textTransform: "uppercase",
  },
  verifiedBadge: {
    marginLeft: "4px",
    width: "22px",
    height: "22px",
    verticalAlign: "text-bottom",
  },
  id: {
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    fontSize: "30px",
    lineHeight: "45px",
    color: "#DEFFFF",
    marginTop: theme.spacing(0.5),
  },
  buyButton: {
    height: 56,
    minWidth: 200,
    width: "100%",
    borderRadius: 12,
    border: "1px solid #29475A",
    "& .MuiButton-label": {
      color: "#DEFFFF",
    },
    "&:hover": {
      backgroundColor: "rgba(222, 255, 255, 0.08)",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
  },
  bidButton: {
    height: 56,
    minWidth: 200,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#6BE1FF",
    "& .MuiButton-label": {
      color: "#003340",
    },
    "&:hover": {
      backgroundColor: "rgba(107, 225, 255, 0.8)",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 150,
    },
  },
  bidsBox: {
    display: "flex",
    flexDirection: "column",
    marginTop: theme.spacing(3),
    borderRadius: 12,
    border: "1px solid #29475A",
    background: "linear-gradient(173.54deg, #12222C 42.81%, #002A34 94.91%)",
    padding: theme.spacing(3, 5),
  },
  bidsHeader: {
    fontSize: "26px",
    lineHeight: "40px",
    fontFamily: "'Raleway', sans-serif",
    fontWeight: 700,
    color: "#DEFFFF",
  },
  tableContainer: {
    "&::-webkit-scrollbar": {
      width: "0.4rem",
      height: "0.4rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(222, 255, 255, 0.1)",
      borderRadius: 12,
    },
  },
  tableHead: {
    "& th.MuiTableCell-root": {
      borderBottom: "none",
      padding: "10px 6px",
      "& .MuiTypograhy-root": {
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 700,
      },
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  tableRow: {
    "& .MuiTableCell-root": {
      border: "1px transparent",
      padding: "6px",
      "& .MuiTypography-root": {
        fontSize: "16px",
        lineHeight: "20px",
      },
      color: "#DEFFFF",
    },
  },
}));

const Nft: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
  const { children, className, match, ...rest } = props;
  const classes = useStyles();

  // fetch nft data, if none redirect back to collections / show not found view

  const breadcrumbs = [
    <Link key="1" to="/ark/collections" className={classes.breadcrumb}>
      Collections
    </Link>,
    <Link
      key="2"
      to={`/ark/collections/${match.params.collection}`}
      className={classes.breadcrumb}
    >
      The Bear Market
    </Link>,
    <Link
      key="3"
      to={`/ark/collections/${match.params.collection}/${match.params.id}`}
      className={classes.breadcrumb}
    >
      #{match.params.id}
    </Link>,
  ];

  return (
    <ARKPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        {/* TODO: refactor Breadcrumbs */}
        <Breadcrumbs
          className={classes.breadcrumbs}
          separator={
            <SvgIcon fontSize="small">
              <path
                d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                color="#6BE1FF"
                strokeWidth={1.5}
                stroke="rgba(107, 225, 255, 0.2)"
              />
            </SvgIcon>
          }
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>

        {/* Nft image and main info */}
        <Box display="flex" mt={3} justifyContent="flex-end">
          <Box className={classes.mainInfoBox}>
            {/* Collection name */}
            <Typography className={classes.collectionName}>
              the bear market{" "}
              <VerifiedBadge className={classes.verifiedBadge} />
            </Typography>

            {/* Token id */}
            <Typography className={classes.id}>#{match.params.id}</Typography>

            <Box display="flex" mt={2} gridGap={20}>
              {/* Buy button */}
              <Button className={classes.buyButton} disableRipple>
                Buy Now
              </Button>

              {/* Bid button */}
              <Button className={classes.bidButton} disableRipple>
                Place a Bid
              </Button>
            </Box>
          </Box>
        </Box>

        {/* TOOO: refactor into OngoingBidsBox */}
        {/* Ongoing bids */}
        <Box className={classes.bidsBox}>
          <Typography className={classes.bidsHeader}>Ongoing Bids</Typography>

          <TableContainer className={classes.tableContainer}>
            <Table>
              <TableHead className={classes.tableHead}>
                <TableRow>
                  <TableCell align="right">
                    <Typography>Amount</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>Approx USD Value</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>Bidder</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>Bid Time</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>Expiry Time</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow className={classes.tableRow}>
                  <TableCell component="th" scope="row" align="right">
                    <Typography>1.0 ZWAP</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>$1,000</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>BabyBear</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>20 Sep 2021, 00:10:00</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>21 Sep 2021, 00:10:00</Typography>
                  </TableCell>
                </TableRow>
                <TableRow className={classes.tableRow}>
                  <TableCell component="th" scope="row" align="right">
                    <Typography>1.0 ZWAP</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography>$1,000</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>BabyBear</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>20 Sep 2021, 00:10:00</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>21 Sep 2021, 00:10:00</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Other info and price history */}
        <Box display="flex" mt={3}>
          {/* Other Info */}

          {/* Price History */}
        </Box>
      </Container>
    </ARKPage>
  );
};

export default Nft;
