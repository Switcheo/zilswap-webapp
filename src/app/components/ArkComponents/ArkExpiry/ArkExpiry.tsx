import React, { useState } from "react";
import cls from "classnames";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Accordion, AccordionDetails, AccordionSummary, Box, ClickAwayListener, DialogProps, MenuItem, MenuList } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDownRounded";
import DoneIcon from "@material-ui/icons/DoneRounded";
import { HelpInfo, Text } from "app/components";
import { AppTheme } from "app/theme/types";
import { hexToRGBA } from "app/utils";

interface Props extends Partial<DialogProps> {
  expiryTime: dayjs.Dayjs;
  expiryOption: expiryOption;
  expiryOptions: expiryOption[];
  setExpiryDate: React.Dispatch<React.SetStateAction<Date | null>>;
  setExpiryOption: React.Dispatch<React.SetStateAction<expiryOption>>;
  expiry: number;
}

export type expiryOption = {
  text: string;
  value: number | undefined;
  unit: string | undefined;
};

const ArkExpiry: React.FC<Props> = (props: Props) => {
  const { expiry, expiryOption, expiryOptions, expiryTime, setExpiryDate, setExpiryOption } = props;
  const classes = useStyles();
  const [expanded, setExpanded] = useState<boolean>(false);

  const onChangeExpiry = (date: any) => {
    setExpiryDate(date);
    const option = expiryOptions.filter(
      (option) => option.text === "Select a date"
    )[0];
    setExpiryOption(option);
    setExpanded(false);
  };

  const onSelectOption = (option: expiryOption) => {
    setExpiryOption(option);
    if (option.text === "Select a date") {
      setExpiryDate(new Date());
    } else {
      setExpanded(false);
    }
  }

  return (
    <ClickAwayListener onClickAway={() => setExpanded(false)}>
      <Accordion
        expanded={expanded}
        className={cls(classes.root, classes.expiryAccordion)}
        onChange={() => setExpanded(!expanded)}
      >
        <AccordionSummary
          expandIcon={
            <ArrowDropDownIcon
              className={classes.dropDownIcon}
              fontSize="large"
            />
          }
        >
          <Box
            display="flex"
            flexDirection="column"
            className={classes.expiryTextBox}
          >
            <Text color="textPrimary">
              Bid Expiry
              <HelpInfo
                className={classes.helpInfo}
                placement="top"
                title="The date or time you select here will be converted to its corresponding estimated block height"
              />
            </Text>
            <Text className={classes.expiryDate}>
              {dayjs(expiryTime).format("D MMM YYYY, HH:mm:ss")}
            </Text>
            <Text color="textSecondary" className={classes.blockHeightText}>
              Block Height:{" "}
              <span className={classes.blockHeightColor}>
                {expiry.toFixed(0)}
              </span>
            </Text>
          </Box>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetail}>
          <Box className={classes.expiryBox}>
            <MenuList>
              {expiryOptions.map((option) => {
                return (
                  <MenuItem
                    key={option.value}
                    onClick={() => onSelectOption(option)}
                    value={option.text}
                    className={cls(classes.menuItem, {
                      [classes.selected]: expiryOption === option,
                    })}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width={"100%"}
                    >
                      {option.text}
                      {expiryOption === option && (
                        <DoneIcon fontSize="small" />
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </MenuList>
            {expiryOption.text === "Select a date" && (
              <Box mt={0.5} mb={2} pl={2} pr={2}>
                <DatePicker
                  minDate={new Date()}
                  className={classes.datePicker}
                  selected={new Date()}
                  onChange={(date) => onChangeExpiry(date)}
                  // highlightDates={[expiryDate]}
                  fixedHeight
                  inline
                />
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </ClickAwayListener>
  );
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    fontFamily: "Avenir Next",
    "& .MuiAccordionSummary-root": {
      backgroundColor: theme.palette.currencyInput,
      border: "1px solid transparent",
      "&:hover": {
        borderColor: "#00FFB0",
        "& .MuiSvgIcon-root": {
          color: "#00FFB0",
        },
      },
    },
    "& .MuiAccordionSummary-root.Mui-expanded": {
      borderRadius: 12,
      marginBottom: theme.spacing(1.5),
      borderColor: "#00FFB0",
      "& .MuiSvgIcon-root": {
        color: "#00FFB0",
      },
    },
    "& .MuiOutlinedInput-root": {
      border: "none",
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: "12px 0",
    },
    "& .react-datepicker": {
      width: "100%",
      borderRadius: 12,
      backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF",
      border: `1px solid ${theme.palette.type === "light" ? `rgba${hexToRGBA("#003340", 0.2)}` : "#29475A"}`
    },
    "& .react-datepicker__month-container": {
      width: "100%"
    },
    "& .react-datepicker__header": {
      backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "#FFFFFF",
      borderBottom: "none",
      borderRadius: "12px!important"
    },
    "& .react-datepicker__current-month": {
      fontFamily: "'Raleway', sans-serif",
      fontWeight: 900,
      color: theme.palette.text?.primary
    },
    "& .react-datepicker__day-names": {
      display: "none",
    },
    "& .react-datepicker__day": {
      borderRadius: "12px!important",
      color: `rgba${theme.palette.type === "dark" ? hexToRGBA("#DEFFFF", 0.5) : hexToRGBA("003340", 0.6)}`,
      "&:hover": {
        backgroundColor: theme.palette.primary.light
      },
      "&:focus": {
        outline: 0
      },
    },
    "& .react-datepicker__day--disabled": {
      color: "#A5B3BF",
      textDecoration: "line-through",
      "&:hover": {
        backgroundColor: "transparent!important"
      }
    },
    "& .react-datepicker__day--keyboard-selected": {
      backgroundColor: "#00FFB0",
      color: "#29475A",
      "&:hover": {
        backgroundColor: "#00FFB0!important",
      }
    },
    "& .react-datepicker__day--selected": {
      backgroundColor: "#FFFFFF",
      color: "#29475A",
      "&:hover": {
        backgroundColor: "#FFFFFF",
      }
    },
    "& .react-datepicker__week": {
      display: "flex",
      justifyContent: "space-around",
    }
  },
  expiryAccordion: {
    backgroundColor: "transparent",
    marginTop: theme.spacing(1.5),
    boxShadow: "none",
    border: "1px solid transparent",
  },
  expiryBox: {
    "& .MuiMenuItem-root": {
      fontFamily: "'Raleway', sans-serif",
      fontSize: "14px",
      fontWeight: 700,
    },
    "& .MuiTypography-root": {
      fontFamily: "'Raleway', sans-serif",
      fontSize: "14px",
      fontWeight: 900,
    },
  },
  accordionDetail: {
    display: "inherit",
    padding: 0,
    backgroundColor: theme.palette.type === "dark" ? "#183E47" : "#FFFFFF",
    border: `1px solid rgba${
      theme.palette.type === "dark"
        ? hexToRGBA("#DEFFFF", 0.1)
        : hexToRGBA("#003340", 0.2)
    }`,
    borderRadius: 12,
  },
  expiryTextBox: {
    "& .MuiTypography-root": {
      textAlign: "initial",
    },
  },
  helpInfo: {
    verticalAlign: "middle",
    marginLeft: 6,
    marginTop: -2,
    height: 10,
    width: 10,
  },
  dropDownIcon: {
    color: theme.palette.primary.light,
  },
  blockHeightText: {
    fontFamily: "Avenir Next",
    marginTop: 2,
    fontSize: 12,
    lineHeight: 1,
  },
  blockHeightColor: {
    color: theme.palette.text?.primary,
  },
  expiryDate: {
    marginTop: theme.spacing(1),
    lineHeight: "24px",
    fontSize: "16px",
    fontWeight: 900,
  },
  datePicker: {},
  menuItem: {
    minHeight: "32px",
  },
  selected: {
    color: "#00FFB0",
  },
}));

export default ArkExpiry;
