import React, { Fragment, useState } from "react";
import {
    Box, Button, DialogProps, DialogContent, ClickAwayListener, Typography,
    List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Link
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { useHistory } from "react-router-dom";
import { ArrowDropDownRounded, ArrowDropUpRounded } from "@material-ui/icons";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CopyrightIcon from '@material-ui/icons/Copyright';
import CheckIcon from '@material-ui/icons/Check';
import { getWallet } from "app/saga/selectors";
import { hexToRGBA } from "app/utils";
import { DialogModal, FancyButton, ArkInput } from "app/components";
import { AppTheme } from "app/theme/types";
import { RootState } from "app/store/types";
import { SmallDialog } from "./components";
import { ReactComponent as ViolenceIcon } from "./reason-icons/violence.svg";
import { ReactComponent as OtherReasonsIcon } from "./reason-icons/others.svg";


interface Props extends Partial<DialogProps> {
    collectionAddress: string;
    tokenId: number;
    onCloseDialog: () => void;
    header?: string;
}

const ArkReportCollectionDialog: React.FC<Props> = (props: Props) => {
    const { className, collectionAddress, tokenId, open, onCloseDialog, header = "Report Collection" } = props;
    const classes = useStyles();
    const history = useHistory();
    const { wallet } = useSelector(getWallet);
    const [active, setActive] = useState<boolean>(false);
    const [openFeedbackReceived, setOpenFeedbackReceived] = useState<boolean>(false);
    const [openReportSubmitted, setOpenReportSubmitted] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [details, setDetails] = useState<string>("");
    const showWalletDialog = useSelector<RootState, boolean>(
        (state) => state.layout.showWalletDialog
    );

    const DETAIL_LIMIT = 500;
    const FAKE_SCAM_INDEX = 0;
    const COPYRIGHT_INDEX = 1;
    const DISLIKE_INDEX = 3;
    const OTHER_REASONS_INDEX = 4;    

    const reportReasons = [
        { reason: 'Fake, Scam or Copied Collection', icon: <HighlightOffIcon></HighlightOffIcon> },
        { reason: 'Copyright Infringement', icon: <CopyrightIcon></CopyrightIcon> },
        { reason: 'Violence, Hate-Speech or Illegal Content', icon: <ViolenceIcon></ViolenceIcon> },
        { reason: 'I don\'t like it', icon: <HighlightOffIcon></HighlightOffIcon> },
        { reason: 'Other reasons', icon: <OtherReasonsIcon></OtherReasonsIcon> }];

    const additionalTextDetails = [
        { reasonIndex: FAKE_SCAM_INDEX, label: 'The Original Collection is', instruction: 'What was this collection called? Add links or contract addresses.', placeholder: 'The Bear Market. http://thebear.market' },
        { reasonIndex: COPYRIGHT_INDEX, label: 'Details', instruction: 'Who was the original artist? Add links, sources and relevant evidence.', placeholder: 'The artwork was stolen from...' },
        { reasonIndex: OTHER_REASONS_INDEX, label: 'Details', instruction: 'Why are you reporting this collection?', placeholder: 'I am reporting this because...' },
    ];

    const onToggleDropdown = () => {
        setActive(!active);
    };

    const handleListItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
    };

    const isAdditionalInputRequired = () => {
        return selectedIndex === FAKE_SCAM_INDEX ||
            selectedIndex === COPYRIGHT_INDEX ||
            selectedIndex === OTHER_REASONS_INDEX;
    }

    const isInputsValid = () => {
        if (isAdditionalInputRequired()) {
            return details === "";
        } else {
            return selectedIndex === -1;
        }
    }

    const generateAdditionalInput = () => {
        const current = additionalTextDetails
            .filter(obj => selectedIndex === obj.reasonIndex)[0];
        if (current) {
            return <ArkInput
                className={classes.arkInputMulti}
                value={details} onValueChange={(value => { setDetails(value) })}
                placeholder={current.placeholder}
                label={current.label} multiline={true}
                instruction={current.instruction}
                wordLimit={DETAIL_LIMIT} />;
        } 
    }

    const onConfirm = () => {
        onCloseDialog();
        if(selectedIndex === DISLIKE_INDEX){
            setOpenFeedbackReceived(true);
        }else{
            setOpenReportSubmitted(true);
        }
    }

    const onBackToDiscover = () => {
        history.push(`/arky/discover`);
    }

    const onBackToCollection = () => {
        setOpenFeedbackReceived(false);
        history.push(`/arky/collections/${collectionAddress}`);
    }

    return ( wallet && !showWalletDialog ? 
        <Fragment>
            <DialogModal header={header} open={!!open} onClose={onCloseDialog}
                titlePadding={false} className={cls(classes.root, className)}>
                <DialogContent className={cls(classes.dialogContent)}>
                    <Typography className={classes.label}>Reason for Reporting</Typography>
                    <Button fullWidth onClick={onToggleDropdown}
                        className={cls(classes.dropdownButton, active ? classes.active : classes.inactive)}>
                        <Box display="flex" flexDirection="row" flexGrow={1} alignItems="centre">
                            {selectedIndex !== -1 && reportReasons[selectedIndex].icon}
                            <Typography className={classes.selectValue}>
                                {selectedIndex === -1 ? 'SELECT' : reportReasons[selectedIndex].reason}
                            </Typography>
                        </Box>
                        {active && <ArrowDropUpRounded className={classes.arrowIcon} />}
                        {!active && <ArrowDropDownRounded className={classes.arrowIcon} />}
                    </Button>
                    {active && <ClickAwayListener onClickAway={onToggleDropdown}>
                        <Box className={classes.dropdownContainer} onBlur={onToggleDropdown}>
                            <List dense>
                                {reportReasons.map((item, index) =>
                                ([<ListItem key={index} selected={selectedIndex === index}
                                    className={classes.listItemRow}
                                    onClick={(event) => handleListItemClick(event, index)}>
                                    <ListItemIcon className={classes.listIcon}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText className={classes.listItemText}>{item.reason}</ListItemText>
                                    {selectedIndex === index && <ListItemSecondaryAction>
                                        <CheckIcon className={classes.active}></CheckIcon>
                                    </ListItemSecondaryAction>}
                                </ListItem>]))}
                            </List>
                        </Box>
                    </ClickAwayListener>}
                    {isAdditionalInputRequired() && generateAdditionalInput()}
                    <FancyButton disabled={isInputsValid()} color="primary" variant="contained" className={classes.button} onClick={onConfirm}>
                        Report
                    </FancyButton>
                </DialogContent>
            </DialogModal>
            <SmallDialog open={openReportSubmitted}
                onCloseDialog={() => setOpenReportSubmitted(false)}
                header="Collection Reported" subHeader="The collection has been reported"
                buttonLabel="Head to Discover" walletRequired={false} onConfirm={onBackToDiscover}
                details="Thanks for keeping our community safe!" />
            <SmallDialog open={openFeedbackReceived}
                onCloseDialog={() => setOpenFeedbackReceived(false)}
                header="Feedback Received" subHeader="Thanks for your feedback!"
                buttonLabel="Back to Collection" walletRequired={false} onConfirm={onBackToCollection}
                details={<Typography>However, this is not a valid reason to report a collection.
                    Check out the community <Link href="https://discord.gg/zilswap">Discord</Link> if you would like to voice other concerns.</Typography>} />
        </Fragment> :
        <SmallDialog open={!!open} onCloseDialog={onCloseDialog}
            header="Connect Wallet" subHeader="Please connect wallet to submit your report."
            walletRequired={true} /> 
    );
};

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
        "& .MuiDialogTitle-root": {
            padding: theme.spacing(3),
            "& .MuiTypography-root": {
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 700,
                fontSize: "24px",
                lineHeight: "36px",
            },
            "& .MuiSvgIcon-root": {
                fontSize: "1.8rem",
            },
        },
        "& .Mui-selected": {
            backgroundColor: "transparent",
            "& div, span": {
                color: "#00FFB0",
                "& path, circle": {
                    fill: "#00FFB0",
                    fillOpacity: "1 !important"
                }
            },
            "&:hover": {
                backgroundColor: theme.palette.type === "dark" ? "#4E5A60" : "#A9CCC1",
            },
        },
        position: "relative",
    },
    dialogContent: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.border,
        borderRight: theme.palette.border,
        borderBottom: theme.palette.border,
        borderRadius: "0 0 12px 12px",
        padding: theme.spacing(0, 3, 2),
        minWidth: 360,
        [theme.breakpoints.up('sm')]: {
            width: 544
        },
        overflowY: "auto",
        "&::-webkit-scrollbar-track": {
            marginBottom: theme.spacing(1),
        },
        "&::-webkit-scrollbar": {
            width: "0.5rem"
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
            borderRight: "3px solid transparent",
            backgroundClip: "padding-box"
        },
    },
    label: {
        fontFamily: "'Raleway', sans-serif",
        fontSize: 16,
        color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
        textTransform: "uppercase",
        marginBottom: 8,
        fontWeight: 800,
    },
    dropdownButton: {
        border: theme.palette.border,
        color: theme.palette.text?.primary,
        fontSize: 14,
        justifyContent: "flex-start",
        padding: "10px 16px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        "& .MuiSvgIcon-root, svg": {
            marginRight: 12
        },
    },
    inactive: {
        borderRadius: "12px"
    },
    active: {
        borderColor: "#00FFB0",
        color: "#00FFB0",
        "& p, .MuiSvgIcon-root": {
            color: "#00FFB0",
            "& path, circle": {
                fill: "#00FFB0",
                fillOpacity: "1 !important"
            }
        },
        "& div path, circle": {
                fill: "#00FFB0",
                fillOpacity: "1 !important"
        }
    },
    selectValue: {
        fontSize: 16,
        fontFamily: "'Raleway', sans-serif",
        color: theme.palette.text!.primary,
        fontWeight: 700,
        textTransform: 'uppercase',
        marginTop: 4,
        marginBottom: 4,
        textAlign: 'left',
    },
    dropdownContainer: {
        marginTop: 8,
        paddingBottom: "5px",
        backgroundColor: theme.palette.type === "dark" ? "#223139" : "#D4FFF2",
        width: '100%',
        borderRadius: 12,
        border: theme.palette.type === "dark" ? "1px solid #29475A" : "1px solid rgba(107, 225, 255, 0.2)",
        padding: 0,
        maxHeight: 600
    },
    listItemRow: {
        "&:hover": {
            backgroundColor: theme.palette.type === "dark" ? "#4E5A60" : "#A9CCC1",
        },
    },
    button: {
        marginTop: 24,
        borderRadius: "12px",
        display: "flex",
        padding: "18px 32px",
        alignItems: "center",
    },
    listIcon: {
        color: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24", 0.5)}`,
        minWidth: 20,
        marginRight: 12,
    },
    listItemText: {
        "& .MuiTypography-body2": {
            fontSize: 16,
            textTransform: 'uppercase',
            fontFamily: "'Raleway', sans-serif",
            color: theme.palette.type === "dark" ? "#DEFFFF" : "#0D1B24",
            fontWeight: 700,
        }
    },
    arrowIcon: {
        color: theme.palette.label,
        marginRight: '0 !important'
    },
    arkInputMulti:{
        marginTop: 24,
        "& [class*='label']": {
            fontSize: 16,
            fontWeight: 800,
            textTransform: "uppercase",
        },
        "& textarea": {
            fontSize: 16,
            height: '86px !important'
        },
        "& [class*='instruction']": {
            fontWeight: 700
        }
    },
    arkInput:{
        marginTop: 24,
        "& [class*='label']": {
            fontSize: 16,
            fontWeight: 800,
            textTransform: "uppercase",
        },
        "& textarea": {
            fontSize: 16,
        },
        "& [class*='instruction']": {
            fontWeight: 700
        }
    }
}));

export default ArkReportCollectionDialog;
