import React, { useState } from 'react';

import MainCard from 'app/layouts/MainCard';
import cls from "classnames";

import { Box, Button, IconButton, } from "@material-ui/core";
import { TextInput } from "./components/TextInput";
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
    zilPrivateKey: '',
    swthAddress: '',
    sourceAddress: '',
    destAddress: '',
}

const BridgeView: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props: any) => {
    const { children, className, ...rest } = props;
    const classes = useStyles();

    const [formState, setFormState] = useState<typeof initialFormState>(initialFormState);

    const onPrivateKeyChange = (key: string = "") => {
        setFormState({
            ...formState,
            zilPrivateKey: key,
        });
    }

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
                <TextInput 
                    label="Zilliqa Private Key (Wallet)" 
                    placeholder="e.g. 1ab23..."
                    text={formState.zilPrivateKey}
                    onInputChange={onPrivateKeyChange} />
                <TextInput 
                    label="Zilliqa Address (Source)" 
                    placeholder="e.g. zil1xxxx..."
                    text={formState.destAddress}
                    onInputChange={onSourceAddressChange} />
                <TextInput 
                    label="Ethereum Address (Destination)" 
                    placeholder="e.g. 0x91a23ab..."
                    text={formState.sourceAddress}
                    onInputChange={onDestAddressChange} />
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