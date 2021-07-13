import { Box, Button, makeStyles, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@material-ui/core";
import AddIcon from '@material-ui/icons/AddRounded';
import ArrowRightRoundedIcon from '@material-ui/icons/ArrowRightRounded';
import { HelpInfo, Reveal, Text } from 'app/components';
import { ReactComponent as NewLinkIcon } from "app/components/new_link.svg";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";
import cls from "classnames";
import React from "react";

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRight: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderBottom: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid #D2E5DF",
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(2, 8, 2),
        minWidth: 510,
        [theme.breakpoints.down("sm")]: {
            padding: theme.spacing(2, 3, 2),
        },
        [theme.breakpoints.down("xs")]: {
            minWidth: 320
        },
    },
    textColoured: {
        color: theme.palette.primary.dark
    },
    addIcon: {
        marginRight: theme.spacing(0.5),
        verticalAlign: "middle",
    },
    newTransferButton: {
        color: theme.palette.action?.disabled,
        backgroundColor: theme.palette.action?.disabledBackground,
        "&:hover": {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ?  "#003340" : "rgba(0, 51, 64, 0.5)", 0.8)}`,
        },
    },
    textWhite: {
        color: theme.palette.primary.contrastText
    },
    tableHead: {
        "& th.MuiTableCell-root": {
            borderBottom: "none",
        },
    },
    tableRow: {
        "& .MuiTableCell-root": {
            borderBottom: `5px solid ${theme.palette.background.default}`,
            borderRadius: 12,
            "&:first-child": {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
            },
            "&:not(:first-child):not(:last-child)": {
                borderRadius: 0
            },
            "&:last-child": {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0
            }
        },
        backgroundColor: theme.palette.background?.contrast,
    },
    helpInfo: {
        verticalAlign: "top",
        marginLeft: theme.spacing(0.1)
    },
    newLinkIcon: {
        "& path": {
          fill: theme.palette.label
        }
    },
    arrowRightIcon: {
        color: theme.palette.label,
        marginLeft: "-8px",
        marginRight: "-4px"
    },
    button: {
        borderRadius: 12
    }
}));

const BridgeTransactionBox = (props: any) => {
    const { className} = props;
    const classes = useStyles();

    const rows = [
        ['22 Jul 2021', 'Ethereum - Zilliqa', 6.0, 24, 4.0, 1, 1],
        ['22 Jul 2021', 'Ethereum - Zilliqa', 9.0, 37, 4.3, 1, 1],
        ['22 Jul 2021', 'Ethereum - Zilliqa', 16.0, 24, 6.0, 1, 1],
        ['22 Jul 2021', 'Ethereum - Zilliqa', 3.7, 67, 4.3, 1, 1],
        ['22 Jul 2021', 'Ethereum - Zilliqa', 16.0, 49, 3.9, 1, 1],
    ];

    return (
        <Box overflow="hidden" display="flex" flexDirection="column" className={cls(classes.root, className)}>
            <Box display="flex" justifyContent="space-between" mt={1}>
                <Box display="flex" flexDirection="column">
                    <Text variant="h2">
                        Zil<span className={classes.textColoured}>Bridge</span>
                    </Text>
                    
                    <Text variant="h6">
                        Your Transfer History
                    </Text>
                </Box>

                <Box display="flex" pt={0.5} pb={0.5}>
                    <Button color="primary" variant="contained" className={classes.newTransferButton}>
                        <AddIcon fontSize="small" className={classes.addIcon} />
                        <Text variant="button" className={classes.textWhite}>New Transfer</Text>
                    </Button>
                </Box>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead className={classes.tableHead}>
                        <TableRow>
                            <TableCell>
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Transfer</Text>
                                    <Text>Date</Text>
                                </Box>
                            </TableCell>
                            <TableCell align="left">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Network</Text>
                                    <Text>From - To</Text>
                                </Box>
                            </TableCell>
                            <TableCell align="right">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Transfer</Text>
                                    <Text>Amount</Text>
                                </Box>
                            </TableCell>
                            <TableCell align="left">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Transfer</Text>
                                    <Text>Status</Text>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Mnemonic</Text>
                                    <Text>Phrase <HelpInfo className={classes.helpInfo} placement="top" title="Todo." /></Text>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Recover</Text>
                                    <Text>Transfer <HelpInfo className={classes.helpInfo} placement="top" title="Todo." /></Text>
                                </Box>
                            </TableCell>
                            <TableCell align="center">
                                <Box display="flex" flexDirection="column">
                                    <Text variant="h6">Transfer</Text>
                                    <Text>Status</Text>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row[0]} className={classes.tableRow}>
                            <TableCell component="th" scope="row">
                                {row[0]}
                            </TableCell>
                            <TableCell>{row[1]}</TableCell>
                            <TableCell align="right">{row[2]}</TableCell>
                            <TableCell>{row[3]}</TableCell>
                            <TableCell align="center">
                                <Reveal secret="12345" />
                            </TableCell>
                            <TableCell>
                                <Button
                                    className={classes.button}
                                    endIcon={<NewLinkIcon className={classes.newLinkIcon} />}
                                    >
                                    <Text>Recover</Text>
                                </Button>
                            </TableCell>
                            <TableCell>
                                <Button
                                    className={classes.button}
                                    endIcon={<ArrowRightRoundedIcon className={classes.arrowRightIcon} />}
                                    >
                                <Text>Show Details</Text>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default BridgeTransactionBox;
