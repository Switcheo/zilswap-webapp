import React, { useState } from "react";
import { Box, BoxProps, Tab, Tabs } from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import cls from "classnames";
import { AppTheme } from "app/theme/types";

interface Props extends BoxProps {
  tabTitle?: string;
  tabHeaders: string[];
  setCurrentTab: (value: string) => void;
  currentTab: string;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    alignSelf: "center",
    borderBottom: theme.palette.border,
    alignContent: "center",
    alignItems: "center"
  },
  tabButton: {
    color: theme.palette.tab.active,
    '&.Mui-selected': {
      color: theme.palette.tab.selected,
    }
  },
}));

const BaseTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  alignItems: "center",
  alignContent: "center",
  '& .MuiTabs-indicator': {
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  '& .MuiTabs-indicatorSpan': {
    width: '100%',
    backgroundColor: theme.palette.type === "dark" ? "#DEFFFF" : "#003340",
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      display: "block",
    }
  },
}));

const BaseTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  fontWeight: 600,
  marginRight: theme.spacing(3),
  color: theme.palette.text.primary,
  opacity: 0.5,
  '&:hover': {
    opacity: 1,
  },
}));

const tabProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ArkTab: React.FC<Props> = (props: Props) => {
  const { currentTab, setCurrentTab, tabTitle = "Tabs", tabHeaders = [], children, className, ...rest } = props;
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(currentTab ? tabHeaders.indexOf(currentTab) : 0);

  const handleTabChange = (e: React.ChangeEvent<{}>, newTabValue: number) => {
    setTabValue(newTabValue);
    setCurrentTab(tabHeaders[newTabValue]);
  }

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <BaseTabs
        variant="scrollable"
        scrollButtons="auto"
        value={tabValue}
        onChange={handleTabChange}
        aria-label={tabTitle}
        className={classes.tabButton}
      >
        {tabHeaders.map((header, index) => (
          <BaseTab key={header} label={header} {...tabProps(index)} />
        ))}
      </BaseTabs>
    </Box>
  );
};

export default ArkTab;
