import React, { useState } from "react";
import {
    Box, Button, DialogProps, DialogContent,
    List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction
} from "@material-ui/core";
import { AppTheme } from "app/theme/types";
import { ArrowDropDownRounded, ArrowDropUpRounded } from "@material-ui/icons";
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import CopyrightIcon from '@material-ui/icons/Copyright';
import CheckIcon from '@material-ui/icons/Check';
import { makeStyles } from "@material-ui/core/styles";
import cls from "classnames";
import { hexToRGBA } from "app/utils";
import { DialogModal, FancyButton } from "app/components";
import { ReactComponent as ViolenceIcon } from "./reason-icons/violence.svg";
import { ReactComponent as OtherReasonsIcon } from "./reason-icons/others.svg";


interface Props extends Partial<DialogProps> {
    collectionAddress: string;
    tokenId: number;
    onCloseDialog?: () => void;
    header?: string;
}


const ArkReportCollectionDialog: React.FC<Props> = (props: Props) => {
    const { children, className, collectionAddress, tokenId, open, onCloseDialog, header = "Report Collection", ...rest } = props;
    const classes = useStyles();
    const [active, setActive] = useState<boolean>(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const reportReasons = [
        { reason: 'Fake, Scam or Copied Collection', icon: <HighlightOffIcon></HighlightOffIcon> },
        { reason: 'Copyright Infringement', icon: <CopyrightIcon></CopyrightIcon> },
        { reason: 'Violence, Hate-Speech or Illegal Content', icon: <ViolenceIcon></ViolenceIcon> },
        { reason: 'I dont\'t like it', icon: <HighlightOffIcon></HighlightOffIcon> },
        { reason: 'Other reasons', icon: <OtherReasonsIcon></OtherReasonsIcon> }];

    const onToggleDropdown = () => {
        setActive(!active);
    };

    const handleListItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
    };

    return (
        <DialogModal header={header} open={!!open} onClose={onCloseDialog}
            titlePadding={false} className={cls(classes.root, className)}>
            <DialogContent className={cls(classes.dialogContent)}>
                <Button fullWidth onClick={onToggleDropdown}
                    className={cls(classes.dropdownButton, active ? classes.active : classes.inactive)}>
                    <Box display="flex" flexDirection="column" flexGrow={1} alignItems="start">
                        <div className={classes.selectValue}>
                            {selectedIndex === -1 ? 'SELECT' : reportReasons[selectedIndex].reason}
                        </div>
                    </Box>
                    {active && <ArrowDropUpRounded className={classes.arrowIcon} />}
                    {!active && <ArrowDropDownRounded className={classes.arrowIcon} />}
                </Button>
                {active && <Box className={classes.dropdownContainer}>
                    <List dense>
                        {reportReasons.map((item, index) =>
                        ([<ListItem selected={selectedIndex === index}
                            className={classes.listItemRow}
                            onClick={(event) => handleListItemClick(event, index)}>
                            <ListItemIcon className={classes.listIcon}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText className={classes.listItemText}>{item.reason}</ListItemText>
                            {selectedIndex === index && <ListItemSecondaryAction>
                                <CheckIcon className={classes.active}></CheckIcon>
                            </ListItemSecondaryAction>}
                        </ListItem>]
                        ))}
                    </List>
                </Box>}
                <FancyButton disabled={selectedIndex === -1} color="primary" variant="contained" className={classes.button}>
                    Report
                </FancyButton>
            </DialogContent>
        </DialogModal>
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
                linHeight: "36px",
            },
            "& .MuiSvgIcon-root": {
                fontSize: "1.8rem",
            },
        },
        "& .Mui-selected": {
            backgroundColor: "transparent",
            "& div, span": {
                color: "#00FFB0"
            },
            "&:hover": {
                backgroundColor: theme.palette.type === "dark" ? "#4E5A60" : "#A9CCC1",
            },
        },
        position: "relative",
    },
    content: {
        backgroundColor: theme.palette.background.default,
    },
    dialogContent: {
        backgroundColor: theme.palette.background.default,
        borderLeft: theme.palette.border,
        borderRight: theme.palette.border,
        borderBottom: theme.palette.border,
        borderRadius: "0 0 12px 12px",
        minWidth: 544,
        padding: theme.spacing(0, 3, 2),
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
    dropdownButton: {
        border: theme.palette.border,
        color: theme.palette.text?.primary,
        fontSize: 14,
        justifyContent: "flex-start",
        padding: "10px 24px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        position: "relative"
    },
    inactive: {
        borderRadius: "12px"
    },
    active: {
        borderColor: "#00FFB0",
        color: "#00FFB0",
        "& div, .MuiSvgIcon-root": {
            color: "#00FFB0",
        }
    },
    selectValue: {
        fontSize: 16,
        fontFamily: "'Raleway', sans-serif",
        color: theme.palette.text!.primary,
        fontWeight: 700,
        textTransform: 'uppercase'
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
        [theme.breakpoints.down('sm')]: {
            width: '92vw',
            padding: '10px 18px',
        },
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
        color: theme.palette.label
    }
}));

export default ArkReportCollectionDialog;
