import React, { useContext } from 'react';
import { Box, Button, Typography, Card, CardContent, CardActions, Divider, Link, LinearProgress, makeStyles, Grid, Table, TableContainer, TableRow, TableCell, TableBody, FormControlLabel, Switch, Slider, TextField, IconButton, Menu, MenuItem, FormControl, Select, InputLabel } from '@material-ui/core';

import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from '@date-io/moment';

import { Web3Context } from '../../../web3/Web3Context'
import { commonLanguage, Balances, ForecastSettings, ForecastMultiplierType, ClientSettings } from '../../../web3/web3Reducer';
import BN from 'bn.js'
import Big from 'big.js'

import LockIcon from '@material-ui/icons/PlayArrow';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import AutorenewRoundedIcon from '@material-ui/icons/AutorenewRounded';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import AlarmIcon from '@material-ui/icons/Alarm';
import AppsIcon from '@material-ui/icons/Apps';
import AddIcon from '@material-ui/icons/AvTimer';
import LockOpenIcon from '@material-ui/icons/Stop';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import DateRangeIcon from '@material-ui/icons/DateRange';

import { DialogType, FluxAddressLock, FluxAddressDetails, FluxAddressTokenDetails, Token } from '../../../interfaces';
import { BNToDecimal, getFormattedMultiplier, getBlocksRemaining, getPriceToggle, getBlocksDateFromNow, switchNetwork } from '../../../web3/helpers';
import LightTooltip from '../LightTooltip';
import { getRequiredFluxToBurn, getRequiredFluxToBurnDecimal, numberWithCommas } from '../../../web3/helperElements';
import { Moment } from 'moment';
import moment from 'moment';
import InsertInvitationIcon from '@material-ui/icons/InsertInvitation';
import { getApy, TokenPair } from '../../../utils/getApy';
import { formatMoney } from '../../../utils/formatMoney';
import { NetworkType } from '../../../../config.base';
import ArbitrumLogo from '../../../../svgs/arbitrum.svg';
import EthereumPurpleLogo from '../../../../svgs/ethereumPurple.svg';
import fluxLogo from '../../../../svgs/fluxLogo.svg';
import damLogo from '../../../../svgs/logo.svg';
import arbiFluxLogo from '../../../../svgs/arbiFluxLogo.svg';

import { theme } from '../../../styles'
import { getConfig } from '../../../../config';

const useStyles = makeStyles(() => ({
	progressBarLeft: {
		height: '15px',
		borderTopLeftRadius: '5px',
		borderBottomLeftRadius: '5px',
		backgroundColor: '#8b0000',
    	borderRadius: `#0xa2b4`
	},
	progressBarRight: {
		height: '15px',
		borderTopRightRadius: '5px',
		borderBottomRightRadius: '5px',
		backgroundColor: '#e0dcdc',
    	borderRadius: `#0xa2b4`
	},
	formCell: {
		paddingTop: 0,
		paddingBottom: 0
		

	},
	largeSlider: {
		'& .MuiSlider-rail': {
			height: 15,
			borderRadius: 5
		},
		'& .MuiSlider-track': {
			height: 15,
			borderRadius: 5
		},
		'& .MuiSlider-thumb': {
			width: 26,
			height: 26,
			border: '2px solid #187a82',
			color: '#fade02'
		}
	},
	datePicker: {
		'& .MuiPickersDay-current': {
			color: '#0FF'
		},
		'& .MuiPickersYear-yearSelected': {
			color: '#0FF'
		},

		'& .MuiPickersDay-daySelected': {
			backgroundColor: '#303030'
		},

	},
	tableContainer: {
		'& .MuiTableCell-root': {
			padding: 11,
			borderBottomColor: '#32333d'
		}
	},
	topLeftPrices: {
		color: '#000000',
		fontWeight: 'bold'

	},
	topLeftPricesContainer: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			flexDirection: 'column'
		}
	},
	topRightContainer: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			flexDirection: 'column'
		}
	},
	
	topContainer: {
		[theme.muiTheme.breakpoints.down('xs')]: {
			flexDirection: 'column'
		}

	}
}))

interface RenderParams {
	addressLock: FluxAddressLock;
	selectedAddress: string;
	displayedAddress: string;
	addressDetails: FluxAddressDetails;
	addressTokenDetails: FluxAddressTokenDetails;
	balances: Balances;
	forecastSettings: ForecastSettings;
	clientSettings: ClientSettings;
	dispatch: React.Dispatch<any>;
	isArbitrumMainnet: boolean;
}
const Render: React.FC<RenderParams> = React.memo(({ addressLock, balances, selectedAddress, displayedAddress, addressDetails, addressTokenDetails, dispatch, forecastSettings, clientSettings, isArbitrumMainnet }) => {
	const classes = useStyles();

	const { navigation, isArbitrumOnlyToken, lockableTokenShortName, mintableTokenShortName, isTokenLogoEnabled, maxBurnMultiplier, mintableTokenMintPerBlockDivisor, mintableTokenPriceDecimals } = getConfig()
	const { isHelpPageEnabled } = navigation

	// Only show CTA once account is loaded
	if (addressDetails === null || selectedAddress === null) {
		return null;
	}

	const getMintHeaderLabel = () => {
		if (!isArbitrumMainnet || isArbitrumOnlyToken) {
			return null;
		}

		return <>
			<Typography color="textSecondary" display="inline">&nbsp;(Arbitrum L2)</Typography>
		</>
	}
	const getCtaDetails = () => {
		const isForecastingModeEnabled = forecastSettings.enabled
		if (addressTokenDetails.isFluxOperator || isForecastingModeEnabled) {

			if (addressLock && addressDetails) {
				const lockedInDamAmount = new BN(addressLock.amount);
				const isLocked = !lockedInDamAmount.isZero()


				if (isLocked || isForecastingModeEnabled) {
					const { minterAddress } = addressLock;
					const isDelegatedMinter = selectedAddress?.toLowerCase() === minterAddress?.toLowerCase(); // Lowercase for WalletConnect

					const getLockedInAmountArea = () => {
						const getAmount = () => {
							return addressLock.amount
						}
						const amount = getAmount()

						if (forecastSettings.enabled) {
							return <>
								<TextField
									label={`${lockableTokenShortName} Amount`}
									variant="outlined"
									size="small"
									autoFocus
									onFocus={(e) => e.target.select()}
									value={forecastSettings.forecastAmount}
									onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetAmount, payload: e.target.value })} />
							</>
						}


						return `${BNToDecimal(amount, true)}`
					}

					const getUnmintedBlocks = () => {
						if (forecastSettings.enabled) {
							return forecastSettings.blocks
						}
						return addressDetails.blockNumber - addressLock.lastMintBlockNumber;
					}

					const isCurrentAddress = selectedAddress === displayedAddress;
					const getBurnButton = () => {
						const showBurnDialog = () => {
							dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Burn } })
						}

						const getButton = () => {
							const isDisabled = !isCurrentAddress || addressDetails.fluxBalance.isZero()
							const button = <Button disabled={isDisabled} size="small" variant="outlined" onClick={() => showBurnDialog()} startIcon={<WhatshotIcon style={{ color: '#8b0000' }} />}>Burn {mintableTokenShortName}</Button>

							if (addressDetails.fluxBalance.isZero()) {
								return <LightTooltip title={`This address must have ${mintableTokenShortName} tokens to burn.`}><Box display="inline-block">{button}</Box></LightTooltip>
							}
							if (!isCurrentAddress) {
								return <LightTooltip title={`You must select this account in your wallet to Burn {mintableTokenShortName} for this address.`}><Box display="inline-block">{button}</Box></LightTooltip>
							}

							return button;
						}

						return <Box mx={1} display="inline-block">{getButton()}</Box>
					}

					const unmintedBlocks = getUnmintedBlocks()

					const getLockedInAmount = () => {
						if (forecastSettings.enabled) {
							return forecastSettings.amount
						}
						return addressLock.amount;
					}

					const rawAmount = getLockedInAmount().div(new BN(10).pow(new BN(mintableTokenMintPerBlockDivisor))).mul(new BN(unmintedBlocks));

					const blanceWithoutBonusesInUsdc = getPriceToggle({ value: rawAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6 });
					const blanceWitMaxBonusesInUsdc = getPriceToggle({ value: rawAmount.mul(new BN(3 * maxBurnMultiplier)), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6 });

					const getMintAmount = () => {
						if (forecastSettings.enabled) {
							const percentMultiplier = new BN("10000");
							return rawAmount.mul(new BN(forecastSettings.forecastBurn)).div(percentMultiplier).mul(new BN(forecastSettings.forecastTime)).div(percentMultiplier)
						}
						return addressDetails.mintAmount
					}

					const getUsdcMint = () => {
						const mintAmount = getMintAmount();

						const balanceInUsdc = getPriceToggle({ value: mintAmount, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 6, removeCommas: true });

						const getMintTooltip = () => {
							const getMaxMultipliers = () => {
								if (blanceWitMaxBonusesInUsdc === blanceWithoutBonusesInUsdc) {
									return null;
								}
								return <TableRow>
									<TableCell>
										With {3 * maxBurnMultiplier}x Multiplier
									</TableCell>
									<TableCell align="right">
										$ {blanceWitMaxBonusesInUsdc} USD
									</TableCell>
								</TableRow>
							}
							return <>
								<Table size="small" style={{backgroundColor: '#c8c8c8'}}>
								Current Balance
									<TableBody>
										<TableRow>
											<TableCell width={30}>
												Without Any Multipliers
											</TableCell>
											<TableCell align="right">
												$ {blanceWithoutBonusesInUsdc} USD
											</TableCell>
										</TableRow>
										{getMaxMultipliers()}
									</TableBody>
								</Table>
							</>
						}

						const amount = parseFloat(balanceInUsdc) * clientSettings.priceMultiplier
						const moneyAmount = formatMoney({ amount, currency: clientSettings.currency })

						return <>
							<LightTooltip title={getMintTooltip()}>
								<Box>
									{moneyAmount} <Typography color="textSecondary" display="inline">{clientSettings.currency}</Typography>
								</Box>
							</LightTooltip>
						</>
					}

					const { isTargetReached, fluxRequiredToBurn, fluxRequiredToBurnInUsdc } = getRequiredFluxToBurn({ addressDetails, addressLock, balances, targetMultiplier: new BN(maxBurnMultiplier - 1) });


					const getFluxBurnTooltip = () => {
						const getBurnTooltip = () => {
							return <>
								<Box fontWeight="bold">{fluxRequiredToBurn} {mintableTokenShortName}</Box>
								<Box fontWeight="bold">{fluxRequiredToBurnInUsdc}</Box>
							</>
						}
						const getDescription = () => {
							if (isTargetReached) {
								return <>You've burned enough {mintableTokenShortName} for x100 burn bonus. <Typography color="secondary" display="inline">OVERBURNED</Typography> {mintableTokenShortName} remaining: </>
							}
							return <>The amount of {mintableTokenShortName} you burn is permanent and will be used in the burn ratio equation. To get the full {maxBurnMultiplier}x burn bonus you will need to burn:</>
						}
						return <>
							{getDescription()}
							<Box py={2}>
								<Divider />
							</Box>
							<Box fontWeight="bold">{getBurnTooltip()}</Box>
						</>
					}

					/*const getForecastAmount = ()=>{
						if (!forecastSettings.enabled) {
							return null;
						}

						const totalDamSupply = balances.damTotalSupply.div(new BN(10).pow(new BN(18))).toNumber()
						const damTokenBalance = balances.damToken.div(new BN(10).pow(new BN(18))).toNumber()

						return <Slider
							color="secondary"
							valueLabelDisplay="off"
							defaultValue={damTokenBalance}
							value={forecastSettings.forecastAmount}
							min={0}
							max={totalDamSupply}
							onChangeCommitted={(event: any, newValue: number | number[])=> {
								dispatch({ type: commonLanguage.commands.ForecastSetAmount, payload: newValue as number });
								return true;
							}}
							/>
					}*/

					const getForecastingSlider = (type: ForecastMultiplierType) => {
						if (!forecastSettings.enabled) {
							return null;
						}

						return <>Test</>
					}
					const getUnlockButton = () => {
						const showUnlockDialog = () => {
							dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Unlock } })
						}

						if (new BN(addressLock.amount).isZero()) {
							return;
						}

						const getButton = () => {
							const button = <Button disabled={!isCurrentAddress} size="small" variant="outlined" color="secondary" onClick={() => showUnlockDialog()} startIcon={<LockOpenIcon style={{ color: '#0FF' }} />}>Stop Mint</Button>

							if (!isCurrentAddress) {
								return <LightTooltip title="You must select this account in your wallet to stop a validator for this address."><Box display="inline-block">{button}</Box></LightTooltip>
							}

							return button;
						}

						return <Box mx={1} display="inline-block">{getButton()}</Box>
					}

					const getStartDateArea = () => {
						if (!forecastSettings.enabled) {
							return null
						}
						const getStartArea = () => {
							const value = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(parseFloat(forecastSettings.forecastStartBlocks) / (60 / 12), 'minutes')

							const getBlocksDropdown = () => {
								return <MuiPickersUtilsProvider utils={MomentUtils}>
									<DatePicker
										variant="inline"
										label="From"
										inputVariant="outlined"
										//value={new Date()}
										format="YYYY/MM/DD"
										value={value.toDate()}
										size="small"
										autoOk={true}
										PopoverProps={{
											anchorOrigin: {
												vertical: 'top',
												horizontal: 'left',
											},
											transformOrigin: {
												vertical: 'bottom',
												horizontal: 'right',
											},
											className: classes.datePicker
										}}
										onChange={(date: Moment | null) => {
											if (date) {
												date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const currentDate = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const blocksDiff = date.diff(currentDate, 'minutes') * (60 / 12)
												//const additionalBlocks = addressLock.amount.isZero() ? 0 : (forecastSettings.alreadyMintedBlocks)

												dispatch({ type: commonLanguage.commands.ForecastSetStartBlocks, payload: (blocksDiff).toString() })
											}
										}}
									/>
								</MuiPickersUtilsProvider>
							}
							return <>
								<Box display="flex" alignItems="center">
									{getBlocksDropdown()}
									{/*}
										<TextField
											label="Blocks"
											variant="outlined"
											size="small"
											onFocus={(e) => e.target.select()}
											value={forecastSettings.forecastBlocks}
											onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: e.target.value })} />
										<BlocksDropdown onClick={(blocks) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: blocks.toString() })} />
										*/}
								</Box>


							</>
						}

						return <TableRow>
							<TableCell align="left">
								<Typography color="textSecondary" variant="body1">
									Mint Start Date / Last Mint Date
								</Typography>
							</TableCell>
							<TableCell align="left">
								<InsertInvitationIcon style={{ color: '#8b0000', verticalAlign: 'middle' }} />
							</TableCell>
							<TableCell component="th" scope="row" align="left">
								{getStartArea()}
							</TableCell>
						</TableRow>
					}

					const getUnmintedBlocksArea = () => {
						const blocksDiff = addressDetails.blockNumber - addressLock.lastMintBlockNumber;


						if (forecastSettings.enabled) {
							//const additionalBlocks = forecastSettings.forecastStartBlocks
							const value = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).add(parseFloat(forecastSettings.forecastBlocks) / (60 / 12), 'minutes')

							const getBlocksDropdown = () => {
								return <MuiPickersUtilsProvider utils={MomentUtils}>
									<DatePicker
										variant="inline"
										label="To"
										inputVariant="outlined"
										//value={new Date()}
										format="YYYY/MM/DD"
										value={value.toDate()}
										size="small"
										autoOk={true}
										PopoverProps={{
											anchorOrigin: {
												vertical: 'top',
												horizontal: 'left',
											},
											transformOrigin: {
												vertical: 'bottom',
												horizontal: 'right',
											},
											className: classes.datePicker
										}}
										onChange={(date: Moment | null) => {
											if (date) {
												date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const currentDate = moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

												const blocksDiff = date.diff(currentDate, 'minutes') * (60 / 12)
												//const additionalBlocks = addressLock.amount.isZero() ? 0 : (forecastSettings.alreadyMintedBlocks)

												dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: blocksDiff.toString() })
											}
										}}
									/>
								</MuiPickersUtilsProvider>
							}
							return <>
								<Box display="flex" alignItems="center">
									{getBlocksDropdown()}
									{/*}
									<TextField
										label="Blocks"
										variant="outlined"
										size="small"
										onFocus={(e) => e.target.select()}
										value={forecastSettings.forecastBlocks}
										onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: e.target.value })} />
									<BlocksDropdown onClick={(blocks) => dispatch({ type: commonLanguage.commands.ForecastSetBlocks, payload: blocks.toString() })} />
									*/}
								</Box>


							</>
						}

						return <>x {blocksDiff}</>
					}

					const getUnmintedBlocksDuration = () => {
						if (forecastSettings.enabled) {
							const blocksRemaining = getBlocksRemaining(forecastSettings.blocks, 0, 0, 'None', false)

							const getForecastedDate = () => {
								const blocksDuration = Math.max(0, forecastSettings.blocks + (addressLock.lastMintBlockNumber - addressDetails.blockNumber)); // This number comes from migration (28 days approx)
								if (blocksDuration === 0 || true) {
									return null;
								}

								const getDateFormat = () => {
									const date = getBlocksDateFromNow(blocksDuration)
									if (blocksDuration * 12 < 60 * 60 * 24) {
										return `. Mint ${date.fromNow()}`
									}

									const blocksDate = date.format('MMMM Do YYYY')
									return `. Mint on ${blocksDate}`
								}
								return getDateFormat()
							}

							return <>{blocksRemaining}{getForecastedDate()}</>
						}
						return getBlocksRemaining(addressDetails.blockNumber, 0, addressLock.lastMintBlockNumber, 'None', false)
					}

					const getBurnSlider = () => {
						if (forecastSettings.enabled) {
							return <Slider
								color="secondary"
								valueLabelDisplay="off"
								value={forecastSettings.forecastBurn}
								className={classes.largeSlider}
								min={10000}
								max={10000 * maxBurnMultiplier}
								onChange={(event: any, newValue: number | number[]) => {
									dispatch({ type: commonLanguage.commands.ForecastSetBurn, payload: newValue as number });
								}}
							/>
						}
						const maxBurnBarWidth = 10000 * maxBurnMultiplier

						return <Box mt={0.5}>
							<Grid container>
							<Grid item style={{ width: `${Math.floor((addressDetails.addressBurnMultiplier / maxBurnBarWidth) * 100)}%` }}>
									<LightTooltip title={getFluxBurnTooltip()}>
										<LinearProgress variant="determinate" value={100} color="secondary" className={classes.progressBarLeft} />
									</LightTooltip>
								</Grid>
								<Grid item style={{ width: `${Math.ceil(((maxBurnBarWidth - addressDetails.addressBurnMultiplier) / maxBurnBarWidth) * 100)}%` }}>
									<LightTooltip title={getFluxBurnTooltip()}>
										<LinearProgress variant="determinate" value={0} color="secondary" className={classes.progressBarRight} />
									</LightTooltip>
								</Grid>
							</Grid>
						</Box>
					}

					const getTimeSlider = () => {
						if (forecastSettings.enabled) {
							return <Slider
								color="secondary"
								valueLabelDisplay="off"
								value={forecastSettings.forecastTime}
								className={classes.largeSlider}
								min={10000}
								max={30000}
								onChange={(event: any, newValue: number | number[]) => {
									dispatch({ type: commonLanguage.commands.ForecastSetTime, payload: newValue as number });
								}}
							/>
						}

						return <Box mt={0.5}>
							<Grid container>
								<Grid item style={{ width: `${Math.floor((addressDetails.addressTimeMultiplier / 30000) * 100)}%` }}>
									<LightTooltip title="Your current HODL bonus is permanent for duration of your mint. If you stop your mint this bonus is reset.">
										<LinearProgress variant="determinate" value={100} color="secondary" className={classes.progressBarLeft} />
									</LightTooltip>
								</Grid>
								<Grid item style={{ width: `${Math.ceil(((30000 - addressDetails.addressTimeMultiplier) / 30000) * 100)}%` }}>
									<LightTooltip title={`You will receive the full x3 HODL multiplier after leaving your ${lockableTokenShortName} locked-in for another ${getBlocksRemaining(addressLock.blockNumber, 161280 + 5760, addressDetails.blockNumber, 'Awaiting Mint Start')}`}>
										<LinearProgress variant="determinate" value={0} color="secondary" className={classes.progressBarRight} />
									</LightTooltip>
								</Grid>
							</Grid>
						</Box>
					}

					const getBurnMultiplierText = () => {
						if (forecastSettings.enabled) {
							return <>
								<TextField
									label="Burn Multiplier"
									variant="outlined"
									size="small"
									inputProps={{
										maxLength: 7,
									}}
									onFocus={(e) => e.target.select()}
									value={forecastSettings.forecastBurnAmount}
									onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetBurnAmount, payload: e.target.value })} />
							</>
						}


						return getFormattedMultiplier(addressDetails.addressBurnMultiplier)
					}
					const getTimeMultiplierText = () => {
						if (forecastSettings.enabled) {
							return <>
								<TextField
									label="HODL Multiplier"
									variant="outlined"
									size="small"
									inputProps={{
										maxLength: 7,
									}}
									onFocus={(e) => e.target.select()}
									value={forecastSettings.forecastTimeAmount}
									onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetTimeAmount, payload: e.target.value })} />
							</>
						}

						return getFormattedMultiplier(addressDetails.addressTimeMultiplier)
					}

					const getBurnBonusDescription = () => {

						const getTargetBurnMultiplier = () => {
							if (forecastSettings.enabled) {
								return Math.floor(forecastSettings.forecastBurn / 10000)
							}

							return 1;
						}

						const getTargetBurnMultiplierDecimal = () => {
							if (forecastSettings.enabled) {
								return (forecastSettings.forecastBurn / 10000)
							}

							return 1;
						}

						if (forecastSettings.enabled) {
							const fluxRequiredToBurn = getRequiredFluxToBurnDecimal({
								globalFluxBurned: new Big(addressDetails.globalBurnedAmount.toString()),
								targetMultiplier: getTargetBurnMultiplierDecimal(),
								globalDamLockedIn: new Big(addressDetails.globalLockedAmount.toString()),
								myFluxBurned: new Big(addressLock.burnedAmount.toString()),
								myDamLockedIn: new Big(forecastSettings.amount.toString()),
							})

							if (fluxRequiredToBurn.gt(new Big(0))) {
								const actualFluxRequiredToBurn = fluxRequiredToBurn.mul(new Big(10).pow(18)).round(0).toFixed()
								const amountToBurnUsd = getPriceToggle({ value: new BN(actualFluxRequiredToBurn), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })
								return <>(~<strong style={{ color: '#8b0000' }}>{numberWithCommas(fluxRequiredToBurn.toFixed(4))} {mintableTokenShortName}</strong> / <strong style={{ color: '#8b0000' }}>${amountToBurnUsd}</strong> left to burn for x{getTargetBurnMultiplierDecimal().toFixed(4)} burn multiplier)</>
							}

						}


						return <>(x{maxBurnMultiplier} max - burn BRAIN to increase your multiplier. Decreases when others burn)</>
					}
					const getDisabledText = () => {
						if (!isLocked) {
							return <>This option will be available once you start your Mint using this address.</>
						}
						if (!isDelegatedMinter) {
							return <>Select the <Box fontWeight="bold" display="inline">Delegated Minter Address</Box> account in your wallet to mint for this address.</>
						}
						if (isForecastingModeEnabled) {
							return <>You must disable forecasting mode to mint.</>
						}

						return null
					}

					const getFluxPriceRow = () => {
						if (!isForecastingModeEnabled) {
							return null;
						}
						//return null //@todo
						const getPriceArea = () => {
							const blocksDiff = addressDetails.blockNumber - addressLock.lastMintBlockNumber;

							if (forecastSettings.enabled) {
								return <>
									<Box display="flex">
										<TextField
											label="Price"
											variant="outlined"
											size="small"
											value={forecastSettings.forecastFluxPrice}
											onChange={(e) => dispatch({ type: commonLanguage.commands.ForecastSetFluxPrice, payload: e.target.value })} />
									</Box>
								</>
							}

							return <>x {blocksDiff}</>
						}
						return <TableRow>
							<TableCell align="left">
								<Typography color="textSecondary" variant="body1">
									Forecast {mintableTokenShortName} Price (in USD)
								</Typography>
							</TableCell>
							<TableCell align="left">
								<AttachMoneyIcon style={{ color: '#8b0000' }} />
							</TableCell>
							<TableCell component="th" scope="row" align="left">
								{getPriceArea()}
							</TableCell>
						</TableRow>
					}

					const getUnmintedBlocksText = () => {
						if (forecastSettings.enabled) {

							return <>
								Forecast {forecastSettings.blocks.toFixed(0)} Unminted Blocks <LightTooltip title="This estimated time is based on assumption that 1 Ethereum Block is genereated every 15 seconds"><Box display="inline">({getUnmintedBlocksDuration()})</Box></LightTooltip>
							</>
						}

						return <>
							Unminted Blocks <LightTooltip title="This estimated time is based on assumption that 1 Ethereum Block is genereated every 15 seconds"><Box display="inline">({getUnmintedBlocksDuration()})</Box></LightTooltip>
						</>
					}

					const getDamLockedUsdc = () => {
						const lockedAmount = forecastSettings.enabled ? new Big(forecastSettings.forecastAmount).mul(new Big(10).pow(18)) : new Big(addressLock?.amount.toString());
						if (lockedAmount.toString() === '0') {
							return null;
						}

						const usdcAmount = getPriceToggle({ value: new BN(lockedAmount.toFixed(0)), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })
						return `($ ${usdcAmount} USD)`
					}

					const getApyHeader = () => {
						if (!balances) {
							return null;
						}

						const apyPools = new Map<TokenPair, any>();
						apyPools.set(TokenPair.DAM_ETH, {
							Reserve0: balances.uniswapDamTokenReserves.eth.toString(),
							Reserve1: balances.uniswapDamTokenReserves.dam.toString(),
						});
						apyPools.set(TokenPair.FLUX_ETH, {
							Reserve0: balances.uniswapFluxTokenReserves.flux.toString(),
							Reserve1: balances.uniswapFluxTokenReserves.eth.toString(),
						});
						apyPools.set(TokenPair.USDC_ETH, {
							Reserve0: balances.uniswapUsdcEthTokenReserves.usdc.toString(),
							Reserve1: balances.uniswapUsdcEthTokenReserves.eth.toString(),
						});

						const getBurnMultiplier = () => {
							if (forecastSettings.enabled) {
								return forecastSettings.forecastBurn / 10000
							}
							return addressDetails.addressBurnMultiplier / 10000
						}
						const burnMultiplier = getBurnMultiplier();

						const apy = getApy(apyPools)
						if (!apy) {
							return null;
						}
						const actualApy = apy.apyPercent.noBurn * burnMultiplier
						if (!actualApy) {
							return null
						}

						return <>
							<Typography color="textSecondary" display="inline">&nbsp;({actualApy.toFixed(2)}% APY)</Typography>
						</>
					}

					return {
						disabledText: getDisabledText(),
						title: <>
							<Grid container justify="space-between">
								<Grid item>
								Brainlet Gainz: Minting Dashboard{getMintHeaderLabel()} <span style={{ backgroundColor: '#e0dede' }}>{getApyHeader()}
								</span></Grid>
								<Grid item>
									<FormControlLabel
										value="start"
										control={<Switch checked={forecastSettings.enabled} color="secondary" onChange={() => dispatch({ type: commonLanguage.commands.ToggleForecastMode })} />}
										label={<>
											<Grid container alignItems="center">
												<Grid item>
													<Box mr={0.5}><DateRangeIcon color={forecastSettings.enabled ? 'secondary' : undefined} /></Box>
												</Grid>
												<Grid item>
													{forecastSettings.enabled ? <Typography color="secondary">Fortune Teller Activated</Typography> : <Typography>Fortune Teller</Typography>}
												</Grid>
											</Grid>
										</>}
										labelPlacement="start"
									/>
								</Grid>
							</Grid>
						</>,
						bottomRightItem: <Grid item>
							<Box textAlign="right">
								<Box display="inline-block" mb={1}>
									<Box mb={1}>
										<Typography color="textSecondary">
											= {`${BNToDecimal(getMintAmount(), true)} ${mintableTokenShortName}`}
										</Typography>
									</Box>
									<Typography variant="h4">{getUsdcMint()}</Typography>
								</Box>
							</Box>
						</Grid>,
						body: <>
							<Box>
								<TableContainer className={classes.tableContainer} >
									<Table aria-label={`${mintableTokenShortName} Token Breakdown`} style={{ minWidth: 450 }}>
										<TableBody>
											<TableRow>
												<TableCell align="left">
													<Typography color="textSecondary" variant="body1">
														${lockableTokenShortName} (locked) {getDamLockedUsdc()}
													</Typography>
												</TableCell>
												<TableCell align="left" style={{ width: 25 }}>
													<LockIcon style={{ color: '#8b0000', verticalAlign: 'middle' }} />
												</TableCell>
												<TableCell className={classes.formCell} component="th" scope="row" align="left" style={{ width: 140 }}>
													{getLockedInAmountArea()}
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell align="left">
													<Typography color="textSecondary" variant="body1">
														${mintableTokenShortName} minted per block
													</Typography>
												</TableCell>
												<TableCell align="left">
													<AddIcon style={{ color: '#8b0000', verticalAlign: 'middle' }} />
												</TableCell>
												<TableCell component="th" scope="row" align="left">
													x {(1 / (10 ** mintableTokenMintPerBlockDivisor)).toFixed(mintableTokenMintPerBlockDivisor)}
												</TableCell>
											</TableRow>
											{getStartDateArea()}
											<TableRow>
												<TableCell align="left">
													<Typography color="textSecondary" variant="body1">
														{getUnmintedBlocksText()}

													</Typography>
												</TableCell>
												<TableCell align="left">
													<AppsIcon style={{ color: '#8b0000', verticalAlign: 'middle' }} />
												</TableCell>
												<TableCell component="th" scope="row" align="left">
													{getUnmintedBlocksArea()}
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell align="left">
													<Typography color="textSecondary" variant="body1">
														BURN Multiplier <Typography variant="body2" display="inline">{getBurnBonusDescription()}</Typography>
														{getBurnButton()}
													</Typography>

													{getBurnSlider()}
												</TableCell>
												<TableCell align="left">
													<WhatshotIcon style={{ color: '#8b0000', verticalAlign: 'middle' }} />
												</TableCell>
												<TableCell component="th" scope="row" align="left">
													{getBurnMultiplierText()}
												</TableCell>
											</TableRow>
											<TableRow>
												<TableCell align="left">
													<Typography color="textSecondary" variant="body1">
														HODL Multiplier <Typography variant="body2" display="inline">(x3 max - achieved after keeping ArbiFLUX locked for 28 days. Timer resets with each unlock)</Typography>
													</Typography>

													{getTimeSlider()}
												</TableCell>
												<TableCell align="left">
													<AlarmIcon style={{ color: '#8b0000', verticalAlign: 'middle' }} />
												</TableCell>
												<TableCell component="th" scope="row" align="left">
													{getTimeMultiplierText()}
												</TableCell>
											</TableRow>
											{getFluxPriceRow()}
										</TableBody>
									</Table>
								</TableContainer>

							</Box>
						</>,
						action: <><strong>Mint {mintableTokenShortName}</strong></>,
						actionIcon: <AutorenewRoundedIcon style={{ color: '#8b0000' }} />,
						onClick: () => {
							dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.Mint } })
						},
						learnMoreHref: isHelpPageEnabled ? '#help/dashboard/mintFluxTokens' : undefined
					}
				}
			}


			return {
				title: <>Brainlet Mint (Continue Here)</>,
				body: <>
					<Box mx={2} mt={3}>Oh, snap! Only a certified brainlet would have given the green light to that transaction. Bravo, you've earned your honorary Brainlet badge! Now, it's time to kickstart your Brain Minting extravaganza. Just give that "Activate Gainz" button a good ol' click down below, and like magic, you'll instantly become a proud generator of BRAIN tokens! Prepare yourself for an epic influx of brainy goodness. Let the minting (and burning) madness begin!</Box>
				</>,
				action: <>Activate Gainz</>,
				actionIcon: <LockIcon />,
				onClick: () => {
					dispatch({ type: commonLanguage.commands.ShowDialog, payload: { dialog: DialogType.LockIn } })
				},
				learnMoreHref: isHelpPageEnabled ? '#help/dashboard/startingDecentralizedMint' : undefined
			}
		}

		const getMintingText = () => {
			if (isArbitrumMainnet) {
				return `Ready to kickstart the madness? First, you gotta check that you're running on pure, unadulterated zero brain cells. Slap the 'Zero IQ, That's Me!' button below to confirm your true Brainlet nature and get the burn-party started!`

			}
			return `To run your own validator you must first enable ${mintableTokenShortName} minting. Click the "Enable" button below to continue.`
		}

		return {
			title: <>
				<Grid container justify="space-between">
					<Grid item>
					Brainlet Mint (Start Here) {getMintHeaderLabel()}
					</Grid>
					<Grid item>
						<FormControlLabel
							value="start"
							control={<Switch checked={forecastSettings.enabled} color="secondary" onChange={() => dispatch({ type: commonLanguage.commands.ToggleForecastMode })} />}
							label={<>
								<Grid container alignItems="center">
									<Grid item>
										<Box mr={0.5}><DateRangeIcon /></Box>
									</Grid>
									<Grid item>
										{forecastSettings.enabled ? <Typography color="secondary">Fortune Teller Enabled</Typography> : <Typography>Fortune Teller</Typography>}
									</Grid>
								</Grid>
							</>}
							labelPlacement="start"
						/>
					</Grid>
				</Grid>
			</>,
			body: <><Box mx={2} mt={3}>
				{getMintingText()}
			</Box></>,
			action: <strong>Zero IQ, That's Me!</strong>,
			actionIcon: <CheckCircleOutlineIcon style={{ color: 'green' }} />,
			onClick: () => {
				dispatch({ type: commonLanguage.commands.AuthorizeFluxOperator });
			},
			learnMoreHref: isHelpPageEnabled ? '#help/onboarding/connectingMetamask' : undefined
		}
	}

	const ctaDetails = getCtaDetails();
	if (!ctaDetails) {
		return null;
	}

	const { disabledText } = ctaDetails;

	const getButton = () => {
		const button = <Button color="secondary" disabled={!!disabledText} size="large" variant="outlined" onClick={() => ctaDetails.onClick()} startIcon={<Box display="flex" style={{ color: '#0ff' }}>{ctaDetails.actionIcon}</Box>}>
			{ctaDetails.action}
		</Button>

		if (disabledText) {
			return <LightTooltip title={disabledText}><Box display="inline-block">{button}</Box></LightTooltip>
		}

		return button
	}
	const getNetworkDropdown = () => {
		if (!selectedAddress || isArbitrumOnlyToken) {
			return null;
		}

		return <Box mr={1}>
			<FormControl size="small" variant="outlined" fullWidth style={{ width: 190 }} >
				<InputLabel id="network-type">Network</InputLabel>
				<Select
					labelId="network-type"
					value={!isArbitrumMainnet ? NetworkType.Mainnet : NetworkType.Arbitrum}
					onChange={(e) => {
						switchNetwork(e.target.value === NetworkType.Arbitrum ? '0xa4b1' : '0x1')
					}}
					label="Network"
				>
					<MenuItem value={NetworkType.Mainnet}>
						<Grid
							container
							direction="row"
							justify="flex-start"
							alignItems="center"
						>
							<Grid item style={{ lineHeight: 0 }}>
								<Box mr={1}><img src={EthereumPurpleLogo} width="24" height="24" /></Box>
							</Grid>
							<Grid item>
								Ethereum
							</Grid>
						</Grid>
					</MenuItem>
					<MenuItem value={NetworkType.Arbitrum}>

						<Grid
							container
							direction="row"
							justify="flex-start"
							alignItems="center"
						>
							<Grid item style={{ lineHeight: 0 }}>
								<Box mr={1}><img src={ArbitrumLogo} width="24" height="24" /></Box>
							</Grid>
							<Grid item>
								Arbitrum (L2)
							</Grid>
						</Grid>
					</MenuItem>
				</Select>
			</FormControl>
		</Box >
	}

	const getBridgeButton = () => {
		if (addressDetails.fluxBalance.isZero()) {
			return null;
		}
	}

	const getRealtimePrices = () => {
		const getIcon = (type: Token) => {
			switch (type) {
				case Token.ETH:
					return <img src={EthereumPurpleLogo} width={24} height={24} style={{ verticalAlign: 'middle' }} />
				case Token.Mintable:
					if (!isTokenLogoEnabled) {
						return null
					}
					return <img src={fluxLogo} width={24} height={24} style={{ verticalAlign: 'middle' }} />
				case Token.Lockable:
					if (isArbitrumMainnet) {
						return <img src={arbiFluxLogo} width={24} height={24} style={{ verticalAlign: 'middle' }} />
					}
					return <img src={damLogo} width={24} height={24} style={{ verticalAlign: 'middle' }} />
			}
		}

		const getFluxPrice = () => {
			const shortFluxPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 10})}`
			const actualFluxPrice = `$ ${shortFluxPrice}`;

			return <>
				<Box display="inline" className={classes.topLeftPrices}>{getIcon(Token.Mintable)} <Typography variant="body2" color="textPrimary" display="inline">{mintableTokenShortName}:</Typography> {actualFluxPrice}</Box>
			</>
		}
		const getDamPrice = () => {
			const shortDamPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`
			const actualDamPrice = `$ ${shortDamPrice}`;

			return <>
				<Box display="inline" className={classes.topLeftPrices}>{getIcon(Token.Lockable)} <Typography variant="body2" color="textPrimary" display="inline">{lockableTokenShortName}:</Typography> {actualDamPrice}</Box>
			</>
		}
		const getEthPrice = () => {
			const shortFluxPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })}`
			const actualFluxPrice = `$ ${shortFluxPrice}`;

			return <>
				<Box display="inline" className={classes.topLeftPrices}>{getIcon(Token.ETH)} <Typography variant="body2" color="textPrimary" display="inline">ETH:</Typography> {actualFluxPrice}</Box>
			</>
		}
		return <>
			<Grid container justify="space-between" alignItems="center" spacing={3} className={classes.topLeftPricesContainer}>
				<Grid item>
					{getFluxPrice()}
				</Grid>
				<Grid item>
					{getDamPrice()}
				</Grid>
				<Grid item>
					{getEthPrice()}
				</Grid>
			</Grid>
		</>
	}

	const getLearnMoreButton = () => {
		if (!isHelpPageEnabled) {
			return null;
		}
		return (
			<Box ml={2} display={"inline-block"}>
				<Link href={ctaDetails.learnMoreHref} rel="noopener noreferrer" target="_blank">
					<Button size="large">
						Learn More
					</Button>
				</Link>
			</Box>
		)
	}

	return <>
		<Box mb={1.5}>
			<Grid container justify="space-between" alignItems="center" className={classes.topContainer} spacing={3}>
				<Grid item>
					{getRealtimePrices()}
				</Grid>
				<Grid item>
					<Grid container justify="flex-end" alignItems="center" className={classes.topRightContainer} spacing={2}>
						<Grid item>
							{getBridgeButton()}
						</Grid>
						<Grid item>
							{getNetworkDropdown()}
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Box>
		<Card elevation={5}>
			<CardContent>
				<Typography variant="h5" component="h2">
					{ctaDetails.title}
				</Typography>
				<Box mt={1} mb={1}>
					<Divider />
				</Box>
				<Box mt={1}>
					{ctaDetails.body}
				</Box>
			</CardContent>
			<CardActions>
				<Box mx={2} width="100%">
					<Grid
						container
						justify="space-between"
						alignItems="flex-end">
						<Grid item>
							<Box mb={2}>
								{getButton()}
								{getLearnMoreButton()}
							</Box>
						</Grid>
						{ctaDetails.bottomRightItem}
					</Grid>
				</Box>
			</CardActions>
		</Card>
	</>
});

const CallToActionCard: React.FC = () => {
	const { state: web3State, dispatch: web3Dispatch } = useContext(Web3Context)

	const { addressLock, address, selectedAddress, addressDetails, addressTokenDetails, balances, forecastSettings, clientSettings, isArbitrumMainnet } = web3State;
	if (!addressLock || !selectedAddress || !addressDetails || !addressTokenDetails || !balances) {
		return null;
	}

	const displayedAddress = address ?? selectedAddress

	return <Render
		addressLock={addressLock}
		selectedAddress={selectedAddress}
		addressDetails={addressDetails}
		addressTokenDetails={addressTokenDetails}
		displayedAddress={displayedAddress}
		balances={balances}
		dispatch={web3Dispatch}
		forecastSettings={forecastSettings}
		clientSettings={clientSettings}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default CallToActionCard;