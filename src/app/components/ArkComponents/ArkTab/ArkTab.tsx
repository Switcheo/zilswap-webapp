import { Box, BoxProps, Tab, Tabs } from "@material-ui/core";
import { makeStyles, styled } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import cls from "classnames";
import React, { useState } from "react";

interface Props extends BoxProps {
  tabTitle?: string;
  tabHeaders: string[];
  setCurrentTab: (value: string) => void;
  currentTab: string;
}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    alignSelf: "center",
    borderBottom: "1px solid #29475A",
    alignContent: "center",
    alignItems: "center"
  },
  tabButton: {
    color: "#DEFFFF",
    '&.Mui-selected': {
      color: "#DEFFFF",
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
    backgroundColor: '#DEFFFF',
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
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  color: '#DEFFFF',
  '&:hover': {
    color: '#DEFFFF',
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
          <BaseTab key={`${header}${index}`} label={header} {...tabProps(index)} />
        ))}
      </BaseTabs>
    </Box>
  );
};

export default ArkTab;
