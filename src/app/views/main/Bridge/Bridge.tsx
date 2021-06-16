import React, { useState } from 'react';

import MainCard from 'app/layouts/MainCard';
import cls from "classnames";

import { Box, Button, IconButton, } from "@material-ui/core";
import { AddressInput } from "./components/AddressInput";
import { makeStyles } from "@material-ui/core/styles";
import { AppTheme } from "app/theme/types";
import { FancyButton } from 'app/components';

const useStyles = makeStyles((theme: AppTheme) => ({
    root: {},
    container: {
        padding: theme.spacing(4, 4, 0),
        [theme.breakpoints.down("xs")]: {
            padding: theme.spacing(2, 2, 0),
        },
        marginBottom: 12
    },
    actionButton: {
        marginTop: theme.spacing(4),
        marginBottom: theme.spacing(4),
        height: 46
    },
}))

const initialFormState = {
    sourceAddress: '',
    destAddress: '',
}

const BridgeView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
    const { children, className, ...rest } = props;
    const classes = useStyles();

    const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);

    const onSourceAddressChange = (address: string = "") => {
        setFormState({
            ...formState,
            sourceAddress: address,
        });
    }

    const onDestAddressChange = (address: string = "") => {
        setFormState({
            ...formState,
            destAddress: address,
        });
    }

    const onExecute = () => {
        console.log("bridge execute");
        console.log("source address: %o\n", formState.sourceAddress);
        console.log("dest address: %o\n", formState.destAddress);
    }

    return (
        <MainCard {...rest} className={cls(classes.root, className)}>
            <Box display="flex" flexDirection="column" className={classes.container}>
                <AddressInput 
                    label="Ethereum Address" 
                    placeholder="e.g. 0x91a23ab..."
                    address={formState.sourceAddress}
                    onAddressChange={onSourceAddressChange} />
                <AddressInput 
                    label="Zilliqa Address" 
                    placeholder="e.g. zil1xxxx..."
                    address={formState.destAddress}
                    onAddressChange={onDestAddressChange} />
                <FancyButton
                    className={classes.actionButton}
                    variant="contained"
                    color="primary"
                    onClick={onExecute}>
                    Execute
                </FancyButton>
            </Box>
        </MainCard>
    )
}

export default BridgeView