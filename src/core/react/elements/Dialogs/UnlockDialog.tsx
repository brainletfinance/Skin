import React, { useContext } from 'react';
import { Box, Button, Typography, Divider, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { Balances, ClientSettings, commonLanguage } from '../../../web3/web3Reducer';

import { BNToDecimal, getFormattedMultiplier, getPriceToggle } from '../../../web3/helpers';
import MessageDialog from './MessageDialog';
import { FluxAddressDetails, Token } from '../../../interfaces';
import { theme } from '../../../styles';
import { Alert } from '@material-ui/lab';
import { formatMoney } from '../../../utils/formatMoney';
import { getConfig } from '../../../../config';

interface RenderParams {
	addressDetails: FluxAddressDetails;
	dispatch: React.Dispatch<any>;

	error: string | null;
	amount: string | null;
	isArbitrumMainnet: boolean;
	balances: Balances | null;
	clientSettings: ClientSettings;
}
const localConfig = {
	/**
	 * IF a person will lose at least $5, show a warning message
	 */
	amountToLoseWarningThreshold: 5
}

const Render: React.FC<RenderParams> = React.memo(({ addressDetails, dispatch, error, amount, isArbitrumMainnet, balances, clientSettings }) => {
	const { mintableTokenShortName, lockableTokenShortName } = getConfig()

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.UnlockDamTokens
		});
	}

	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const onCloseError = () => {
		dispatch({ type: commonLanguage.commands.DismissError });
	}

	const getAmountLostAlert = () => {
		if (!balances) {
			return null
		}
		const getMintAmount = () => {
			return addressDetails.mintAmount
		}
		const mintAmount = getMintAmount()

		const balanceInUsdc = getPriceToggle({ value: mintAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6, removeCommas: true });

		const unmintedUsdAmount = parseFloat(balanceInUsdc)
		if (unmintedUsdAmount < localConfig.amountToLoseWarningThreshold) {
			return null
		}
		const amount = unmintedUsdAmount * clientSettings.priceMultiplier
		const moneyAmount = formatMoney({ amount, currency: clientSettings.currency })

		return (
			<Box mt={3}>
				<Alert severity="error">

					<Box mb={1} fontWeight="bold">WARNING: YOU ARE ABOUT TO LOSE <Box style={{ color: '#0FF' }} fontSize="1.1rem" display="inline">{moneyAmount} {clientSettings.currency}</Box> IN UNMINTED {mintableTokenShortName}. IF YOU CONTINUE THIS UNMINTED AMOUNT WILL BE LOST!</Box>
					If you are seeing this warning it means you have at least $5.00 in unminted {mintableTokenShortName}!
					Please mint your {mintableTokenShortName} first before unlocking.
				</Alert>
			</Box>
		)
	}

	return <Dialog
		open={true}
		onClose={onClose}
		aria-labelledby="alert-dialog-title"
	>
		{error ? <MessageDialog open={true} title="Error" message={error} onClose={onCloseError} /> : null}
		<form onSubmit={onSubmit}>
			<DialogTitle id="alert-dialog-title">{"Stop Minting?"}</DialogTitle>
			<DialogContent>
				<Box>Returned Balance: <Box display="inline" fontWeight="fontWeightBold">{amount} {lockableTokenShortName}</Box></Box>
				<Box my={2}><Divider /></Box>
				<Box mb={6}>

					<Typography gutterBottom={true}>Feel like hitting the pause button on your Mint? No worries! You'll scoop up 100% of your ArbiFLUX tokens right back. But remember, this move is a bit like a game of Jenga - it'll topple your precious HODL multiplier. If you unlock your Mint, we'll hit the reset button on that time bonus. Oh, and just a heads-up, it'll take about a moon cycle (28 days) to rebuild that sweet multiplier again.</Typography>
					<Box my={3}>
						<Typography gutterBottom={true}>Stopping your Mint will cause you to lose your current <Box fontWeight="fontWeightBold" display="inline" style={{ whiteSpace: 'nowrap' }}>{getFormattedMultiplier(addressDetails.addressTimeMultiplier)}</Box> HODL multiplier.</Typography>
					</Box>
					<Typography style={{ color: theme.classes.palette.highlight }}>Important Note: <Box fontWeight="bold" display="inline">Any unminted {mintableTokenShortName} tokens will be lost.</Box></Typography>

					{getAmountLostAlert()}
				</Box>
			</DialogContent>
			<DialogActions>
				<Box mb={1} mr={2}>
					<Box mr={2} display="inline-block">
						<Button onClick={onClose}  >
							Cancel
						</Button>
					</Box>
					<Button type="submit" color="secondary" size="large" variant="outlined"  >
						Unlock
					</Button>
				</Box>
			</DialogActions>
		</form>
	</Dialog>
})

const UnlockDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const amount = BNToDecimal(web3State.addressLock?.amount ?? null);

	const { addressDetails, error, isArbitrumMainnet, balances, clientSettings } = web3State;
	if (!addressDetails) {
		return null;
	}

	return <Render
		addressDetails={addressDetails}
		error={error}
		amount={amount}
		dispatch={web3Dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
		balances={balances}
		clientSettings={clientSettings}
	/>
}

export default UnlockDialog;