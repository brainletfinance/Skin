import React, { useContext } from 'react';
import { Box, Button, Typography, Divider, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage, Balances } from '../../../web3/web3Reducer';
import { BNToDecimal } from '../../../web3/helpers';
import { getConfig } from '../../../../config';

interface RenderParams {
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;
	isArbitrumMainnet: boolean;

	error: string | null;
	total: string | null;
}

const Render: React.FC<RenderParams> = React.memo(({ selectedAddress, balances, dispatch, error, total, isArbitrumMainnet }) => {
	const { lockableTokenShortName, mintableTokenShortName } = getConfig()

	const [amount, setAmount] = React.useState(total);
	const [minterAddress, setMinterAddress] = React.useState(selectedAddress);
	const [minterType, setMinterType] = React.useState('self');

	const onSubmit = async (e: any) => {
		e.preventDefault();

		dispatch({
			type: commonLanguage.commands.LockInDamTokens,
			payload: {
				amount,
				minterAddress
			}
		});
	}
	const onClose = () => {
		dispatch({ type: commonLanguage.commands.CloseDialog });
	}

	const getDelegatedMinterBox = () => {
		if (minterType !== 'delegated') {
			return;
		}
		return <Box my={1}>
			<TextField
				autoFocus
				id="name"
				label={`Ethereum Address (Who can mint your ${mintableTokenShortName} tokens?)`}
				type="text"
				variant="outlined"
				value={minterAddress}
				onChange={(e) => setMinterAddress(e.target.value)}
				helperText={error}
				fullWidth
			/>
		</Box>

	}

	return <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
		<form onSubmit={onSubmit}>
			<DialogTitle id="form-dialog-title">Start {mintableTokenShortName} Mint</DialogTitle>
			<DialogContent>
				<Box>Locking Address: <Box display="inline" fontWeight="fontWeightBold">{selectedAddress}</Box></Box>
				<Box my={1}>Current Balance: <Box display="inline" fontWeight="fontWeightBold">{BNToDecimal(balances.damToken, true)} {lockableTokenShortName}</Box></Box>
				<Box my={2}><Divider /></Box>
				<Box mb={4}>
					<Typography>Select how many {lockableTokenShortName} tokens you wish to lock to start your Mint. You can stop your Mint to get 100% of {lockableTokenShortName} tokens back at ANY TIME.</Typography>
				</Box>

				<Box my={1}>
					<TextField
						autoFocus
						id="name"
						label={`Mint Size (${lockableTokenShortName}) Tokens`}
						type="text"
						variant="outlined"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						error={!!error}
						helperText={error}
						fullWidth
					/>
				</Box>

				<Box my={3}>
					<FormControl component="fieldset">
						<FormLabel component="legend">Minting Address</FormLabel>
						<RadioGroup aria-label="gender" name="gender1" value={minterType} onChange={event => setMinterType((event.target as HTMLInputElement).value)}>
							<FormControlLabel value="self" control={<Radio />} label={`I want to mint my own ${mintableTokenShortName} tokens`} />
							<FormControlLabel value="delegated" control={<Radio />} label={<>Another address mints {mintableTokenShortName} on my behalf <Typography color="textSecondary" display="inline" variant="body2">(Delegated Minter)</Typography></>} />
						</RadioGroup>
					</FormControl>
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
						Continue
					</Button>
				</Box>
			</DialogActions>
		</form>
	</Dialog>
});

const DamLockDialog: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const total = BNToDecimal(web3State.balances?.damToken ?? null);

	const { balances, selectedAddress, error, isArbitrumMainnet } = web3State;
	if (!balances || !selectedAddress) {
		return null;
	}

	return <Render
		balances={balances}
		selectedAddress={selectedAddress}
		error={error}
		total={total}
		dispatch={web3Dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default DamLockDialog;