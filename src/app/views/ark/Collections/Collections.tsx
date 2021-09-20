import {
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  OutlinedInput,
  Radio,
  RadioGroup,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlankRounded";
import ARKPage from "app/layouts/ARKPage";
import { AppTheme } from "app/theme/types";
import React, { useState } from "react";
import { ReactComponent as CheckedIcon } from "./checked-icon.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    [theme.breakpoints.down("xs")]: {
      padding: 0,
    },
    "& .MuiRadio-colorSecondary.Mui-checked": {
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  input: {
    paddingLeft: "8px",
    paddingRight: "8px",
    marginTop: theme.spacing(2),
    borderColor: "rgba(222, 255, 255, 0.5)",
  },
  inputText: {
    fontSize: "16px!important",
    padding: "18.5px 14px!important",
  },
  formControl: {
    flexDirection: "row",
  },
  formLabel: {
    alignSelf: "center",
    fontWeight: 700,
    marginRight: theme.spacing(2),
    "&.Mui-focused": {
      color: "rgba(222, 255, 255, 0.5)",
    },
  },
  formControlLabel: {
    "& .MuiTypography-root": {
      fontFamily: "'Raleway', sans-serif",
      fontWeight: 900,
    },
  },
  radioGroup: {
    flexWrap: "nowrap",
  },
  radioButton: {
    padding: "6px",
    "&:hover": {
      background: "transparent!important",
    },
  },
}));

const SEARCH_FILTERS = ["art", "artist", "attribute", "collection"];

const Collections: React.FC<React.HTMLAttributes<HTMLDivElement>> = (
  props: any
) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const [search, setSearch] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // fetch collections

  return (
    <ARKPage {...rest}>
      <Container className={classes.root} maxWidth="lg">
        <OutlinedInput
          placeholder="What are you looking for..."
          value={search}
          fullWidth
          classes={{ input: classes.inputText }}
          className={classes.input}
          onChange={(e) => setSearch(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel className={classes.formLabel}>By</FormLabel>
                <RadioGroup
                  row
                  className={classes.radioGroup}
                  aria-label="by"
                  name="controlled-radio-buttons-group"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                >
                  {SEARCH_FILTERS.map((filter) => {
                    return (
                      <FormControlLabel
                        className={classes.formControlLabel}
                        value={filter}
                        control={
                          <Radio
                            className={classes.radioButton}
                            checkedIcon={<CheckedIcon />}
                            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            disableRipple
                          />
                        }
                        label={filter.toUpperCase()}
                      />
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </InputAdornment>
          }
        />

        <span style={{ marginTop: 16, display: "inline-block" }}>
          Collections
        </span>
      </Container>
    </ARKPage>
  );
};

export default Collections;
