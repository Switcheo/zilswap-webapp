import { Button, makeStyles } from "@material-ui/core";
import { VisibilityRounded as Visibility } from "@material-ui/icons";
import { AppTheme } from "app/theme/types";
import React, { useState } from "react";
import { Text } from 'app/components';

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {
    },
    button: {
        borderRadius: 12
    },
    visibilityIcon: {
        color: theme.palette.label
    }
}));

const Reveal = (props: any) => {
    const { secret } = props;
    const classes = useStyles();
    const [showSecret, setShowSecret] = useState<boolean>(false);

    const handleShowSecret = () => {
        setShowSecret(!showSecret);
    }

    return (
        !showSecret 
            ? <Button
                onClick={handleShowSecret}
                className={classes.button}
                endIcon={<Visibility className={classes.visibilityIcon}/>}
                >
                <Text>Reveal</Text>
            </Button>
            : <Text>{secret}</Text>
    )
}

export default Reveal;
