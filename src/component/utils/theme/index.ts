import { createTheme } from "@mui/material/styles";
/** 
* default theme
* reference: https://mui.com/material-ui/customization/default-theme/
*/
declare module '@mui/material/styles' {

  interface Palette {
    neutral: Palette['primary'];
  }
  interface PaletteOptions {
    neutral: PaletteOptions['primary'];
  }
  
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    neutral: {
      main: '#FFFBFE',
      contrastText: '#1C1B1F',
      light: '#E6E1E5',
      dark: '#E7E0EC'
    }
  },
});
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    neutral: {
      main: '#1C1B1F',
      contrastText: '#E6E1E5',
      light: '#313033',
      dark: '#49454F'
    }
  },
});
/**
* define more custom theme with custom settings inside
*/