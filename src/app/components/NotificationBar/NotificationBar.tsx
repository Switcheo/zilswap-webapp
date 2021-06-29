import { BoxProps } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import React, { useRef } from "react";
import { SnackbarProvider } from "notistack";
import { NotificationItem } from "./components";

interface Props extends BoxProps {

}

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
  },
}));


const NotificationBar: React.FC<Props> = (props: Props) => {
  const { children, className, ...rest } = props;
  const ref = useRef() as React.MutableRefObject<SnackbarProvider>;

  const classes = useStyles();

  return (
    <SnackbarProvider
      className={classes.root}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      maxSnack={5}
      ref={ref}
      content={(key, message) => {
        if (!message) return
        let msgContent = JSON.parse(message!.toString());
        const { hash, content, sourceBlockchain } = msgContent;

        return (
          <NotificationItem sourceBlockchain={sourceBlockchain} snackKey={key} hash={hash} message={content} providerRef={ref} />
        )
      }}
      {...rest}
    >
      {children}
    </SnackbarProvider>
  );
};

export default NotificationBar;
