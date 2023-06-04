import { makeStyles, createMuiTheme } from "@material-ui/core";

const palette = {
	highlight: '#8B0000',
	background: '#c8c8c8',
	secondaryBackground: '#202336',
	textSecondary: '#fade02',
	action: '#fade02',

}

const classes = {
	palette
}

const muiTheme = createMuiTheme({
	palette: {
		type: 'dark',
		primary: {
			// light: will be calculated from palette.primary.main,
			main: '#000000',
			contrastText: '#fff',

			// dark: will be calculated from palette.primary.main,
			// contrastText: will be calculated to contrast with palette.primary.main
		},
		secondary: {
			main: '#000000',
			// dark: will be calculated from palette.secondary.main,
			contrastText: '#fff',
		},
		// Used by `getContrastText()` to maximize the contrast between
		// the background and the text.
		contrastThreshold: 3,
		// Used by the functions below to shift a color's luminance by approximately
		// two indexes within its tonal palette.
		// E.g., shift from Red 500 to Red 300 or Red 700.
		tonalOffset: 0.2,
		text: {
        primary: "#000000",
		secondary: "000000"
    }
	},
	typography: {
    fontFamily: 'Comic Sans MS, Arial',
	h3: {
      fontSize: 33,
      fontFamily: "Courier, Arial",
      fontWeight: 300,
      letterSpacing: "0.0075em",
      verticalAlign: "middle",
      alignItems: "center",
      textAlign: "center"
    }
  	},


	

	overrides: {
		MuiBackdrop: {
			root: {
				backgroundColor: 'rgba(0, 0, 0, 0.50)'
			}
		},
		MuiPaper: {
			root: {
				backgroundColor: classes.palette.background,
				borderRadius: '0px', 
			}
		},
		MuiFormLabel: {
			root: {
				'&.Mui-focused': {
					color: '#'
				}
			}
		},
		MuiOutlinedInput: {
			root: {
				'&$focused $notchedOutline': {
					borderColor: '#8B0000F',
					borderWidth: 3,

				},
			}
		},
		MuiTypography: {
			root: {
				'TextSecondary': {
					color: '#fade02'
				} 
			}
		},

		MuiButton: {
			outlined: {
			  // Custom styles for the outlined button variant
			  border: '1px solid #131313', // Set the border
			  borderRadius: '2px',
			  borderTopColor: '#fff', // Set the top border color
			  borderLeftColor: '#fff', // Set the left border color
			  backgroundColor: '#e0dede', // Set the background color
			  padding: '5px 0', // Set the padding
			  float: 'right', // Float the button to the right
			  marginLeft: '5px', // Set the left margin
			  color: '#000', // Set the text color to black
			  fontWeight: 'bold',
			  '&:hover': {
				borderColor: '#999', // Set the border color on hover
				color: '#999', // Set the text color on hover
			  },
			},
			text: {
			  // Custom styles for the text button variant
			  color: '#000', // Set the text color to black
			  '&:hover': {
				color: '#999', // Set the text color on hover
			  },
			},
		  },

		
	}
});

const theme = {
	muiTheme,
	classes
}

export {
	theme
}