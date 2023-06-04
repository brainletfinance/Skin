import React, { useContext } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Button } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'

import { BNToDecimal, getBlocksRemaining } from '../../../web3/helpers';

import BN from 'bn.js'
import { FluxAddressLock, FluxAddressDetails, FluxAddressTokenDetails, DialogType } from '../../../interfaces';
import { commonLanguage, Balances } from '../../../web3/web3Reducer';

import LockOpenIcon from '@material-ui/icons/Stop';
import { getRequiredFluxToBurn } from '../../../web3/helperElements';
import DetailedListItem from '../Fragments/DetailedListItem';
import { getConfig } from '../../../../config';

interface RenderParams {
	addressLock: FluxAddressLock;
	displayedAddress: string;
	addressDetails: FluxAddressDetails;
	addressTokenDetails: FluxAddressTokenDetails;
	selectedAddress: string;
	balances: Balances;
	dispatch: React.Dispatch<any>;
	isArbitrumMainnet: boolean;
}
const Render: React.FC<RenderParams> = React.memo(({ addressLock, addressDetails, addressTokenDetails, selectedAddress, balances, displayedAddress, dispatch, isArbitrumMainnet }) => {
	const { mintableTokenShortName, maxBurnMultiplier } = getConfig()

	const getBlockDuration = (startBlockNumber: number) => {
		const blocksDuration = addressDetails.blockNumber - startBlockNumber;
		const hoursDuration = (blocksDuration * 15) / (60 * 60)

		return {
			hours: `~${hoursDuration.toFixed(2)} hours`,
			blocks: `(${blocksDuration} block${blocksDuration > 1 ? 's' : ''})`
		};
	}


	const showUnlockDialog = () => {
		dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Unlock } })
	}

	const getLockedInAmount = () => {
		return `${BNToDecimal(addressLock.amount, true)} DAM`
	}
	const getDamLockedInHeader = () => {
		const getUnlockButton = () => {
			if (new BN(addressLock.amount).isZero()) {
				return;
			}

			if (displayedAddress !== selectedAddress) {
				return;
			}

			return <Box px={2} display="inline-block"><Button size="small" variant="outlined" onClick={() => showUnlockDialog()} startIcon={<LockOpenIcon style={{ color: '#8b0000' }} />}>Unlock DAM</Button></Box>
		}
		return <>
			DAM Powering Validators
			{getUnlockButton()}
		</>
	}
	const getLastMint = () => {
		const getDuration = () => {
			if (addressLock.blockNumber === addressLock.lastMintBlockNumber) {
				return {
					hours: 'You have not yet minted',
					blocks: undefined
				}
			}
			return getBlockDuration(addressLock.lastMintBlockNumber)
		}
		const duration = getDuration()

		return <DetailedListItem
			title="You Last Minted:"
			main={<>{duration.hours} ago</>}
			description={<Typography color="textSecondary" display="inline" variant="body2">{duration.blocks}</Typography>}
		/>
	}

	if (addressLock.amount.isZero()) {
		return null;
	}
	const { myRatio } = addressTokenDetails;

	const { isTargetReached, fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({ addressDetails, addressLock, balances, targetMultiplier: new BN(maxBurnMultiplier - 1) });

	const getDamLockinDuration = () => {
		const duration = getBlockDuration(addressLock.blockNumber)

		return <DetailedListItem
			title="Mint Started:"
			main={<>{duration.hours} ago</>}
			description={<Typography color="textSecondary" display="inline" variant="body2">{duration.blocks}</Typography>}
		/>
	}

	const getFluxToBurnFor2x = () => {
		if (isTargetReached || addressDetails.addressBurnMultiplier >= 20000) {
			return null;
		}
		const { fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({ addressDetails, addressLock, balances, targetMultiplier: new BN("1") });

		return <Box my={2}>
			<DetailedListItem
				title={isTargetReached ? <>{mintableTokenShortName} {maxBurnMultiplier}x Bonus Reserves (<Typography color="secondary" display="inline">OVERBURNED</Typography>)</> : `${mintableTokenShortName} to Burn For 2x Bonus:`}
				main={<>{fluxRequiredToBurn} {mintableTokenShortName}</>}
				sub={<>{fluxRequiredToBurnInUsdc}</>}
			/>
		</Box>
	}

	const getFluxToBurnForMaxBurn = () => {
		return <DetailedListItem
		title={isTargetReached ? <>{mintableTokenShortName} {maxBurnMultiplier}x Bonus Reserves (<Typography color="secondary" display="inline">OVERBURNED</Typography>)</> : `${mintableTokenShortName} to Burn For ${maxBurnMultiplier}x Multiplier:`}
			main={<>{fluxRequiredToBurn} {mintableTokenShortName}</>}
			sub={<>{fluxRequiredToBurnInUsdc}</>}
		/>
	}
	const getTimeUntil3xBonus = () => {
		/*<List>
			<ListItem>
				<ListItemText primary={'Time Until 3x Time Bonus'} secondary={} />
			</ListItem>
		</List>*/
		return <DetailedListItem
			title={'Time Until 3x HODL Multiplier:'}
			main={getBlocksRemaining(addressLock.blockNumber, 161280 + 5760, addressDetails.blockNumber, 'Awaiting Mint Start', false, true)}
			description={<><Typography color="textSecondary" display="inline" variant="body2">{getBlocksRemaining(addressLock.blockNumber, 161280 + 5760, addressDetails.blockNumber, 'Awaiting Mint Start', true, false)}</Typography></>}
		/>

	}

	return <Card >
		<CardContent>
			<Grid container justify="space-between" alignItems="center">
				<Grid item>
					<Typography variant="h5" component="h2">
						{mintableTokenShortName} Mint Info
					</Typography>
				</Grid>
			</Grid>
			<Box mt={1} mb={2}>
				<Divider />
			</Box>
			<Grid container>
				<Grid item xs={12} md={6}>
					{getTimeUntil3xBonus()}
					{getFluxToBurnFor2x()}
					{getFluxToBurnForMaxBurn()}
				</Grid>
				<Grid item xs={12} md={6}>
					{getDamLockinDuration()}
					{getLastMint()}
				</Grid>
			</Grid>
		</CardContent>
	</Card>
})

const MintStatsCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { address, selectedAddress, addressLock, addressDetails, addressTokenDetails, balances, isArbitrumMainnet } = web3State;
	if (!addressLock || !addressDetails || !addressTokenDetails || !selectedAddress || !balances) {
		return null;
	}

	return <Render
		addressDetails={addressDetails}
		addressLock={addressLock}
		addressTokenDetails={addressTokenDetails}
		selectedAddress={selectedAddress}
		displayedAddress={address ?? selectedAddress}
		balances={balances}
		dispatch={web3Dispatch}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default MintStatsCard;