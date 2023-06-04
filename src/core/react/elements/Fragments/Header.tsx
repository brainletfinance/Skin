import React from 'react';
import { Box, Container, Typography, Grid, Button, makeStyles, CardActionArea, CardMedia, Card } from '@material-ui/core';

import ArrowRightIcon from '@material-ui/icons/PlayArrow';

import logo from '../../../../svgs/logo.svg';

import { theme } from '../../../styles'
import LightTooltip from '../../elements/LightTooltip';
import ExploreLiquidityPools, { LiquidityPoolButtonType } from './ExploreLiquidityPools';
import { getConfig } from '../../../../config';

const useStyles = makeStyles(() => ({
	logoContainer: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			flexGrow: '1',
			textAlign: 'center'
		},
	},
	title: {
		fontSize: '2.4rem',
		'& .MuiGrid-item': {
			display: 'flex',
			alignItems: 'center'
		},

		[theme.muiTheme.breakpoints.down('md')]: {
			fontSize: '2rem',
		},
		[theme.muiTheme.breakpoints.down('sm')]: {
			fontSize: '1.5rem',
			textAlign: 'center',
			'& .MuiGrid-container': {
				justifyContent: 'center'
			},
			marginBottom: theme.muiTheme.spacing(3)
		},
	},
	titleSlogan: {
		[theme.muiTheme.breakpoints.down('sm')]: {
			textAlign: 'center',
		}
	},
	arrow: {
		color: '#0ff',
		fontSize: '2rem',
		verticalAlign: 'middle',
		[theme.muiTheme.breakpoints.down('md')]: {
			fontSize: '1.5rem',
		},
		[theme.muiTheme.breakpoints.down('sm')]: {
			fontSize: '1rem',
		},
	},
	playIcon: {
		fontSize: 200,
		opacity: 0.2,
		marginLeft: -100,
		marginTop: -100
	},
	oldCoin: {
		width: 128,
		position: 'relative',
		left: 24
	},
	proofOfBurn: {
		color: '#8b0000',
	},
}));


interface Props {
	isSubPage: boolean;
	isVideoVisible?: boolean;
}
const Header: React.FC<Props> = React.memo(({ isSubPage, isVideoVisible }) => {
	const classes = useStyles();

	const { isLiquidityPoolsEnabled, navigation, ecosystemName } = getConfig()
	const { isHelpPageEnabled } = navigation

	const navigateDashboard = () => {
		window.location.href = '#dashboard' // @todo
	}

	const getLogo = () => {
		return <>
			<img src="./images/oldCoin.png" alt={ecosystemName} className={classes.oldCoin} />
			<img src={logo} alt={ecosystemName} style={{ width: '128px' }} />
		</>
	}

	const getArrow = () => {
		return <Box display="inline"><ArrowRightIcon fontSize="large" className={classes.arrow} /></Box>
	}
	const getTitle = () => {
		if (isSubPage) {
			return <Typography component="h3" variant="h3" color="textPrimary" gutterBottom display="block" className={classes.title}>
				The MIT License {getArrow()}
			</Typography>
		}
		return <Typography component="h3" align="left" variant="h3" color="textPrimary" gutterBottom display="block" className={classes.title} style={{ fontWeight: 'bold' }}>
			No Brains more Gainz  </Typography>
	}

	const getSubHeader = () => {
		if (isSubPage) {
			return <Box mt={4}>
				<Box mt={3}>
					<Grid container spacing={3} justify="center">
						<Grid item>
							<Button variant="text" href="#">
								Homepage
							</Button>
						</Grid>
						<Grid item>
							<Button variant="text" href="#dashboard">
								Dashboard
							</Button>
						</Grid>
					</Grid>
				</Box>
			</Box>
		}
		const getLiqudityPoolsButton = () => {
			if (!isLiquidityPoolsEnabled) {
				return null;
			}
			return <Grid item>

				<ExploreLiquidityPools buttonType={LiquidityPoolButtonType.ExtraLargeButton} />
			</Grid>
		}
		const getHelpButton = () => {
			if (!isHelpPageEnabled) {
				return null
			}
			return (<Grid item>
				<Button variant="text" href="#help">
					Help &amp; Knowledgebase
				</Button>
			</Grid>)
		}
		return <Box mt={4}>
			<Grid container spacing={4} justify="center" alignItems="center">
				{getLiqudityPoolsButton()}
				<Grid item>
					<Button variant="outlined" color="secondary" size="large" style={{ fontSize: '1.5rem' }} onClick={navigateDashboard}>
						<Grid container alignItems="center">
							<Grid item>
								Start Mint 
							</Grid>
						</Grid>
					</Button>
				</Grid>
			</Grid>
			{getVideo()}
			<Box mt={3}>
				<Grid container spacing={3} justify="center">
					<Grid item>
						<Button variant="text" href="https://github.com/DatamineGlobal/whitepaper/blob/d8b1e007f229878cba0a617398f3e1d40a3ea79a/Datamine.pdf" rel="noopener noreferrer" target="_blank">
							Economic Whitepaper
						</Button>
					</Grid>
					<Grid item>
						<Button variant="text" href="https://github.com/Datamine-Crypto/white-paper/blob/master/docs/datamine-smart-contracts.md" rel="noopener noreferrer" target="_blank">
							Technical Whitepaper
						</Button>
					</Grid>
					{getHelpButton()}
					<Grid item>
						<Button variant="text" href="https://github.com/Datamine-Crypto/white-paper/blob/master/audits/SlowMist%20-%20Smart%20Contract%20Security%20Audit%20Report%20-%20FluxToken.pdf" rel="noopener noreferrer" target="_blank">
							View Security Audit
						</Button>
					</Grid>
				</Grid>
			</Box>
		</Box>
	}

	const getVideo = () => {
		if (!isVideoVisible) {
			return null;
		}

		return <Box mt={5} mb={3}><Grid container justify="center">
			<Grid item>
				<Box display="inline-block">
					<Card elevation={3} >
						<LightTooltip title={`Watch How ${ecosystemName} Ecosystem Works`} placement="top">
							<CardActionArea href="https://youtu.be/dsqz3XGx7RY" target="_blank" rel="noopener noreferrer">
								<CardMedia component="img" image="./images/videoSplash.png" style={{ maxWidth: 600 }} />
							</CardActionArea>
						</LightTooltip>
					</Card>
				</Box>
			</Grid>
		</Grid>
		</Box>
	}

	const defiTitle = `DeFi is an abbreviation of the phrase decentralized finance which generally refers to the digital assets and financial smart contracts, protocols, and decentralized applications (DApps) built on Ethereum. In simpler terms, it's financial software built on the blockchain that can be pieced together like Money Legos.`
	const getHeader = () => {
		return <>
			<Grid
				container
				spacing={4}
				justify="center"
				alignItems="center">
				<Grid item className={classes.logoContainer}>
					{getLogo()}
				</Grid>
				<Grid item md={8} lg={7}>
					<Box>
						{getTitle()}
						<Typography variant="h6" align="left" color="textSecondary" paragraph className={classes.titleSlogan}>
						<Typography display="inline" variant="h6" color="textPrimary">Wave goodbye to</Typography>  Froggy's extra thicc 6.9% premine and give a big ol' welcome to our sexy 0% masterplan! We're whipping up gainz like a Michelin-star chef with the IQ of a doorknob. It's so simple, even if you donated your brain cells to lab rats, you'd nail it. Who needs smarts when you've got the mind-blowing might of a Brainlet? <br />
						</Typography>
					</Box>
				</Grid>
			</Grid>
			{getSubHeader()}
		</>
	}

	return <>
		<Box mt={6} mb={6}>
			<Container>
				{getHeader()}
			</Container>
		</Box>
	</>
})

export default Header;