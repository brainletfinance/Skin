import React, { useContext } from 'react';
import { Box, Typography, Grid, List, ListItem, ListItemText, CardContent, Divider, Button, Link, Card } from '@material-ui/core';

import { Web3Context } from '../../../web3/Web3Context'

import { BNToDecimal, getBNPercent, getPriceToggle } from '../../../web3/helpers';
import { FluxAddressDetails, FluxAddressTokenDetails, Token } from '../../../interfaces';
import { Balances } from '../../../web3/web3Reducer';
import uniswap from '../../../../svgs/uniswap.svg';
import sushiSwapLogo from '../../../../svgs/sushiSwap.svg';
import LightTooltip from '../LightTooltip';
import BN from 'bn.js'
import DetailedListItem from '../Fragments/DetailedListItem';
import { getConfig } from '../../../../config';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from '../Fragments/ExploreLiquidityPools';
import { getTradeButton } from '../Fragments/TradeButton';


interface RenderParams {
	balances: Balances;
	addressTokenDetails: FluxAddressTokenDetails;
	addressDetails: FluxAddressDetails;
	isArbitrumMainnet: boolean;
}
const Render: React.FC<RenderParams> = React.memo(({ balances, addressDetails, isArbitrumMainnet }) => {
	const config = getConfig(isArbitrumMainnet);
	const { mintableTokenShortName, lockableTokenShortName } = config

	const commaRegex = /(\d)(?=(\d{3})+(?!\d))/g;

	const { uniswapDamTokenReserves, uniswapFluxTokenReserves } = balances;

	const getAvailableLiquidity = (token: Token) => {
		switch (token) {
			case Token.Lockable:
				const damSupply = getBNPercent(balances.uniswapDamTokenReserves.dam, balances.damTotalSupply, false)
				return <> <Typography variant="body2" color="textSecondary" display="inline">({damSupply}% of {isArbitrumMainnet ? 'L2' : 'lifetime'} supply)</Typography></>
			case Token.Mintable:
				const fluxSupply = getBNPercent(balances.uniswapFluxTokenReserves.flux, balances.fluxTotalSupply, false)
				return <> <Typography variant="body2" color="textSecondary" display="inline">({fluxSupply}% of current supply)</Typography></>
		}
	}

	const lockedPercent = getBNPercent(addressDetails.globalLockedAmount, balances.damTotalSupply, false)


	const shortDamPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 4 })}`

	const actualDamMarketCap = `$ ${getPriceToggle({ value: balances.damTotalSupply, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
	const circulatingDamMarketCap = `$ ${getPriceToggle({ value: balances.damTotalSupply.sub(addressDetails.globalLockedAmount), inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;

	const shortFluxPrice = `${getPriceToggle({ value: new BN(1).mul(new BN(10).pow(new BN(18))), inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: config.mintableTokenPriceDecimals })}`
	const actualFluxPrice = `$ ${shortFluxPrice} USD`;
	const actualFluxMarketCap = `$ ${getPriceToggle({ value: balances.fluxTotalSupply, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;

	document.title = `${mintableTokenShortName}: $${shortFluxPrice} ${lockableTokenShortName}: $${shortDamPrice}`

	const getDamMarketCap = () => {

		return <DetailedListItem
			title={<><Box display="inline">{lockableTokenShortName} Realtime Market Cap{isArbitrumMainnet ? ' (on L2)' : ''}:</Box></>}
			main={<><Box display="inline">{circulatingDamMarketCap} <Typography variant="body2" color="textSecondary" display="inline">(Circulating)</Typography></Box></>}
			sub={<><Box display="inline">{actualDamMarketCap} <Typography variant="body2" color="textSecondary" display="inline">(Total)</Typography></Box></>}
		/>
	}

	const getDamEthAvailableLiquidity = () => {
		const ethLiquidity = parseFloat(getPriceToggle({ value: uniswapDamTokenReserves.eth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2, removeCommas: true }))
		const damLiquidity = parseFloat(getPriceToggle({ value: uniswapDamTokenReserves.dam, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2, removeCommas: true }))
		const totalLiquidity = (damLiquidity + ethLiquidity).toFixed(2).replace(commaRegex, '$1,')

		const damEthUsdcLiquidity = `$ ${totalLiquidity} USD`;

		return <DetailedListItem
			title={`${lockableTokenShortName} / ETH Total Liquidity${isArbitrumMainnet ? '' : ''}:`}
			main={<>{damEthUsdcLiquidity}</>}
		/>
	}

	const getDamAvailableLiquidity = () => {
		const damEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapDamTokenReserves.dam, inputToken: Token.Lockable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <DetailedListItem
			title={`${lockableTokenShortName} Available ${isArbitrumMainnet ? 'SushiSwap' : 'Uniswap'} Liquidity :`}
			main={<>{BNToDecimal(uniswapDamTokenReserves.dam, true, 18, 2)} {lockableTokenShortName}</>}
			sub={<>{damEthUsdcLiquidity}</>}
			description={<>{getAvailableLiquidity(Token.Lockable)}</>}
			buttons={[
				getTradeButton({ token: Token.Lockable, isBuy: true, isArbitrumMainnet }),
				getTradeButton({ token: Token.Lockable, isBuy: false, isArbitrumMainnet })
			]}
		/>
	}
	const getDamAvailableLiquidityEth = () => {
		const damEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapDamTokenReserves.eth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <DetailedListItem
			title={`${lockableTokenShortName} ${isArbitrumMainnet ? 'SushiSwap' : 'Uniswap'} Available ETH:`}
			main={<>{BNToDecimal(uniswapDamTokenReserves.eth, true, 18, 2)} ETH</>}
			sub={<>{damEthUsdcLiquidity}</>}
		/>
	}

	const getFluxMarketCap = () => {
		return <DetailedListItem
			title={<><Box display="inline">{mintableTokenShortName} Realtime Market Cap: </Box></>}
			main={<><Box display="inline">{actualFluxMarketCap}</Box></>}
		/>
	}

	const getFluxEthAvailableLiquidity = () => {
		const ethLiquidity = parseFloat(getPriceToggle({ value: uniswapFluxTokenReserves.eth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2, removeCommas: true }))
		const fluxLiquidity = parseFloat(getPriceToggle({ value: uniswapFluxTokenReserves.flux, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2, removeCommas: true }))
		const totalLiquidity = (fluxLiquidity + ethLiquidity).toFixed(2).replace(commaRegex, '$1,')

		const fluxEthUsdcLiquidity = `$ ${totalLiquidity} USD`;

		return <DetailedListItem
			title={`${mintableTokenShortName} / ETH Total Liquidity:`}
			main={<>{fluxEthUsdcLiquidity}</>}
		/>

	}

	const getFluxAvailableLiquidity = () => {
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapFluxTokenReserves.flux, inputToken: Token.Mintable, outputToken: Token.USDC, balances, round: 2 })} USD`;
		return <DetailedListItem
			title={`${mintableTokenShortName} Available ${isArbitrumMainnet ? 'SushiSwap' : 'Uniswap'} Liquidity:`}
			main={<>{BNToDecimal(uniswapFluxTokenReserves.flux, true, 18, 2)} {mintableTokenShortName}</>}
			sub={<>{fluxEthUsdcLiquidity}</>}
			description={<>{getAvailableLiquidity(Token.Mintable)}</>}
			buttons={[
				getTradeButton({ token: Token.Mintable, isBuy: true, isArbitrumMainnet }),
				getTradeButton({ token: Token.Mintable, isBuy: false, isArbitrumMainnet }),
			]}
		/>
	}

	const getFluxAvailableLiquidityEth = () => {
		const getPoolButton = () => {

			const getButton = () => {

				const getAddToPoolLink = () => {
					if (isArbitrumMainnet) {
						return `https://app.sushi.com/add/${config.mintableTokenContractAddress}/ETH`
					}
					return `https://uniswap.exchange/add/${config.mintableTokenContractAddress}/ETH/10000`
				}
				const button = <Link href={getAddToPoolLink()} target="_blank" rel="noopener noreferrer">
					<Button size="small" variant="outlined" color="secondary">
						<img src={isArbitrumMainnet ? sushiSwapLogo : uniswap} width={24} height={24} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Add To Pool
					</Button>
				</Link>


				const getAddToPoolTooltip = () => {
					if (isArbitrumMainnet) {
						return `Add to ${mintableTokenShortName} / ETH SushiSwap Pool. Liquidity pool participants share 0.25% from each ${mintableTokenShortName} <-> ETH SushiSwap transaction! `
					}

					return `Add to ${mintableTokenShortName} / ETH Uniswap Pool. Liquidity pool participants share 1.00% from each ${mintableTokenShortName} <-> ETH Uniswap transaction! `
				}
				return <LightTooltip title={getAddToPoolTooltip()}>
					{button}
				</LightTooltip>;
			}

			return <Box mx={1} display="inline-block">{getButton()}</Box>
		}
		const fluxEthUsdcLiquidity = `$ ${getPriceToggle({ value: uniswapFluxTokenReserves.eth, inputToken: Token.ETH, outputToken: Token.USDC, balances, round: 2 })} USD`;

		return <DetailedListItem
			title={`${mintableTokenShortName} / ETH ${isArbitrumMainnet ? 'SushiSwap' : 'Uniswap'} Available ETH:`}
			main={<>{BNToDecimal(uniswapFluxTokenReserves.eth, true, 18, 2)} ETH</>}
			sub={<>{fluxEthUsdcLiquidity}</>}
			buttons={[
			]}
		/>
	}

	const getCardTitle = () => {
		if (isArbitrumMainnet) {
			return 'Liquidity Info --- 100% Community-Fueled Liquidity! (No Premine)'
		}
		return 'Realtime Available Uniswap v3 Liquidity'
	}

	return <Card >
		<CardContent>
			<Grid container justify="space-between" alignItems="center">
				<Grid item>
					<Typography variant="h5" component="h2">
							{getCardTitle()}
						</Typography>
					</Grid>
				<Grid item>
					<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.SmallButton} />
				</Grid>
			</Grid>
			<Box mt={1} mb={1}>
				<Divider />
			</Box>
			<Grid container>
				<Grid item xs={12} md={6}>
					{getFluxAvailableLiquidity()}
					{getFluxAvailableLiquidityEth()}
					{getFluxEthAvailableLiquidity()}
					{getFluxMarketCap()}
				</Grid>
				<Grid item xs={12} md={6}>
					{getDamAvailableLiquidity()}
					{getDamAvailableLiquidityEth()}
					{getDamEthAvailableLiquidity()}
					{getDamMarketCap()}
				</Grid>
			</Grid>
		</CardContent>
	</Card>
});

const RealtimeLiqudityCard: React.FC = () => {
	const { state: web3State } = useContext(Web3Context)

	const { balances, addressTokenDetails, addressDetails, isArbitrumMainnet } = web3State;
	if (!balances || !addressTokenDetails || !addressDetails) {
		return null;
	}


	return <Render
		balances={balances}
		addressTokenDetails={addressTokenDetails}
		addressDetails={addressDetails}
		isArbitrumMainnet={isArbitrumMainnet}
	/>
}

export default RealtimeLiqudityCard;