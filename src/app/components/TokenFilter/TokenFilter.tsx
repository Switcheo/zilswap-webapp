import { Box, Button, Checkbox, makeStyles, Popover } from "@material-ui/core";
import { RootState, TokenInfo, TokenState } from "app/store/types";
import { hexToRGBA } from "app/utils";
import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import { useEffect } from "react";

const useStyles = makeStyles((theme: AppTheme) =>({
  button: {
    width: 300,
    backgroundColor: theme.palette.type === "dark" ? "rgba(222,255,255,0.1)" : "#D4FFF2",
    color: theme.palette.type === "dark" ? "white" : "",
    fontSize: 14,
    justifyContent: "flex-start",
    padding: "12px 34px",
    borderRadius: "12px 12px 0 0",
    display: "flex",
    alignItems: "center",
    "& span": {
      flexGrow: 1,
      textAlign: "left"
    }
  },
  inactive: {
    borderRadius: "12px"
  },
  popover: {
    maxHeight: 340,
    "& .MuiPaper-root": {
      backgroundColor: theme.palette.type === "dark" ? "#0D1B24" : "D4FFF2",
      width: 300,
      borderRadius: "0 0 12px 12px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.palette.type === "dark" ? "#29475A" : "#D4FFF2",
      "&::-webkit-scrollbar": {
        width: "0.4rem"
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: `rgba${hexToRGBA(theme.palette.type === "dark" ? "#DEFFFF" : "#003340", 0.1)}`,
        borderRadius: 12
      },
    },
  },
  itemHeader: {
    color: theme.palette.label
  },
  checkbox: {
    padding: 2,
    marginRight: 8,
    "&.Mui-checked": {
      color: theme.palette.primary.dark
    }
  },
}))

const TokenFilter = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const [selectedState, setSelectedState] = useState<{[id: string]: boolean}>({})

  useEffect(() => {
    if(!tokenState.initialized) return
    var initialSelectedState: {[id: string]: boolean} = {}

    Object.values(tokenState.tokens).forEach(token => {
      initialSelectedState[token.address] = true
    })
    setSelectedState(initialSelectedState)
  }, [tokenState])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (token: TokenInfo) => {
    let newState = {...selectedState}
    newState[token.address] = !selectedState[token.address]
    setSelectedState(newState)
  }
  
  const handleGroupChange = (event: React.ChangeEvent<HTMLInputElement>, registered: boolean) => {
    let newState = {...selectedState}
    tokens.filter(token => token.registered === registered).forEach(token => {
      newState[token.address] = event.target.checked
    })
    setSelectedState(newState)
  }

  const tokens = Object.values(tokenState.tokens).sort((a,b) => a.symbol < b.symbol ? -1 : 1)

  return (
    <div>
      <Button onClick={handleClick} className={anchorEl === null ? cls(classes.button, classes.inactive) : cls(classes.button)}>
        <span>Select tokens</span>
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.2016 13.1737L14.2879 16.0874C13.8491 16.5262 13.1404 16.5262 12.7016 16.0874L9.78787 13.1737C9.07912 12.4649 9.58537 11.2499 10.5866 11.2499L16.4141 11.2499C17.4154 11.2499 17.9104 12.4649 17.2016 13.1737Z" fill="#DEFFFF"/></svg>
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        className={classes.popover}
      >
        <Box paddingY={1} paddingX="12px">
          <Box display="flex" alignItems="center" paddingX={2} paddingY={1} className={classes.itemHeader}>
            <div><Checkbox checked={tokens.filter(token => token.registered && !selectedState[token.address]).length === 0} onChange={(e) => handleGroupChange(e, true)} color="primary" size="small" className={classes.checkbox} /></div>
            <div>Registered Tokens</div>
          </Box>
          {tokens.filter(token => token.registered).map(token => (
            <Box display="flex" alignItems="center" paddingLeft={5} paddingRight={2} paddingBottom={1} onClick={() => handleChange(token)}>
              <div><Checkbox checked={selectedState[token.address]} onChange={() => handleChange(token)} color="primary" size="small" className={classes.checkbox} /></div>
              <div>{token.symbol}</div>
            </Box>
          ))}
          <Box display="flex" alignItems="center" paddingX={2} paddingY={1} className={classes.itemHeader}>
            <div><Checkbox checked={tokens.filter(token => !token.registered && !selectedState[token.address]).length === 0} onChange={(e) => handleGroupChange(e, false)} color="primary" size="small" className={classes.checkbox} /></div>
            <div>Unregistered Tokens</div>
          </Box>
          {tokens.filter(token => !token.registered).map(token => (
            <Box display="flex" alignItems="center" paddingLeft={5} paddingRight={2} paddingBottom={1}>
              <div><Checkbox checked={selectedState[token.address]} onChange={() => handleChange(token)} color="primary" size="small" className={classes.checkbox} /></div>
              <div>{token.symbol}</div>
            </Box>
          ))}
        </Box>
      </Popover>
    </div>
  )
}

export default TokenFilter;