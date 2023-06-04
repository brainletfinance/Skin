import React, { useContext } from 'react';
import { Box, Button, Typography, Divider, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Link } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage, Balances } from '../../../web3/web3Reducer';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import { BNToDecimal } from '../../../web3/helpers';
import { getConfig } from '../../../../config';

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;

	error: string | null;
	amount: string | null;
	setAmount: React.Dispatch<any>;

	isArbitrumMainnet: boolean;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, amount, setAmount, isArbitrumMainnet }) => {
	const { mintableTokenShortName } = getConfig()

	const { navigation, ecosystemName } = getConfig()
	const { isHelpPageEnabled } = navigation

	const [targetAddress, setTargetAddress] = React.useState(selectedAddress);

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.BurnFluxTokens,
			payload: { amount, address: targetAddress }
		});
	}
	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}
	const getDelegatedMinterBox = () => {
		return <Box mt={1} mb={3}>
			<TextField
				id="name"
				label="Enter Ethereum Address (Target address of the burn)"
				type="text"
				variant="outlined"
				value={targetAddress}
				onChange={(e) => setTargetAddress(e.target.value)}
				helperText={error}
				fullWidth
			/>
		</Box>

	}

	const getLearnMoreBurningLink = () => {
		if (!isHelpPageEnabled) {
			return null;
		}

		return <>
			{' '}
			<Link color="textSecondary" href="#help/dashboard/burningFluxTokens" rel="noopener noreferrer" target="_blank">Click here</Link> to learn more about {mintableTokenShortName} burning.
		</>
	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">
				<Box display="flex" alignItems="center" alignContent="center">
					<strong>Burn {mintableTokenShortName}</strong>
					<Box display="flex" pl={1} ><WhatshotIcon style={{ color: '#8b0000' }} /></Box>
				</Box>
			</DialogTitle>
			<DialogContent>
				<Box>From Address: <Box display="inline" fontWeight="fontWeightBold">{selectedAddress}</Box></Box>
				<Box my={1}>Current Balance: <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(balances.fluxToken, true)} {mintableTokenShortName}</Box></Box>
				<Box my={3}><Divider /></Box>

				<Typography gutterBottom={true}>Select the number of BRAIN tokens you're ready to toss into the bonfire. Remember, you can direct this blaze to any Ethereum-based address that's locked some ArbiFLUX in its clutches.</Typography>
				<Box my={4}>
					<Typography>By charring BRAIN tokens, you're powering up the Burn Multiplier on the destination address! And by default, that address is yours. Feeling generous? You can even specify a different address to send the burning love - perhaps another fellow brainlet!
						
						Oh, and let's not forget: This burn-off is a worldwide showdown, so burn wisely!{getLearnMoreBurningLink()}</Typography></Box>
						<Box my={4}>						
						<Typography>Confused? Activate the mystical powers of the BRAIN fortune teller to unveil the exact amount of BRAIN tokens you must sacrifice to achieve your desired Burn Multiplier. Simply engage the fortune teller and prepare to be amazed as it reveals the secrets of BRAIN burning. Whether you seek to multiply your burn by two, ten, or beyond, the fortune teller will guide you on the path to BRAIN-burning enlightenment.</Typography>
				</Box>
				<Box mt={3} mb={3}>
					<TextField
						autoFocus
						id="name"
						label={`Enter the amount of ${mintableTokenShortName} you wish to burn`}
						type="text"
						variant="outlined"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						error={!!error}
						helperText={error}
						fullWidth
					/>
				</Box>
				{getDelegatedMinterBox()}
				<Box mt={2}><Divider /></Box>
			</DialogContent>
			<DialogActions>
				<Box mb={1} mr={2}>
					<Box mr={2} display="inline-block">
						<Button onClick={onClose}  >
							Cancel
						</Button>
					</Box>
					<Button type="submit" color="secondary" size="large" variant="outlined"  >
						Burn
					</Button>
				</Box>
			</DialogActions>
		</form>
	</Dialog>
});

const BurnDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const total = BNToDecimal(web3State.balances?.fluxToken ?? null);

	const [amount, setAmount] = React.useState(total);

	const { balances, selectedAddress, error, isArbitrumMainnet } = web3State;
	if (!balances || !selectedAddress) {
		return null;
	}

	return <Render
		balances={balances}
		selectedAddress={selectedAddress}
		error={error}
		amount={amount}
		setAmount={setAmount}
		dispatch={web3Dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default BurnDialog;