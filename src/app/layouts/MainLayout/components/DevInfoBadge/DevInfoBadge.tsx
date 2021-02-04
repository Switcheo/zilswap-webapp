import { Chip, Tooltip, BoxProps, Box, Avatar, useMediaQuery } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { PRODUCTION_HOSTS } from "app/utils/constants";
import cls from "classnames";
import React from "react";

interface Props extends BoxProps {

}

const getAvatar = (hostname: string) => {
  if (hostname === "localhost") return "L";
  if (hostname.match(/^(www.)?zilswap.(io|exchange)$/)) return "P";
  if (hostname.match(/^([a-z]*.)?staging.zilswap.(io|exchange)$/)) return "S";
  return "?";
};

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      right: theme.spacing(2),
    },
  },
}));
const DevInfoBadge: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const hostname = window.location.hostname;

  const avatar = React.useMemo(() => getAvatar(hostname), [hostname]);

  if (!hostname || PRODUCTION_HOSTS.includes(hostname)) return null;

  return (
    <Box {...rest} className={cls(classes.root, className)}>
      <Tooltip placement="left" title={`You are using ZilSwap on ${hostname}`} arrow>
        <Chip
          avatar={<Avatar>{avatar}</Avatar>}
          size={isSm ? "small" : "medium"}
          color="primary"
          variant="outlined"
          label={hostname} />
      </Tooltip>
    </Box>
  );
};

export default DevInfoBadge;
