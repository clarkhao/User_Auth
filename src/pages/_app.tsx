//应用模块
import React from "react";
import { useRouter } from "next/router";
//style
import "../styles/globals.css";
import "src/component/ui/Complete.css";
import { ThemeProvider } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import { css } from "@emotion/react";
//组件
import { StrictMode } from "react";
import type { AppProps } from "next/app";
import { useThemeStore } from "src/store";
import Head from "next/head";
import Authentication from "src/component/layout/Authen";
//hooks

function MyApp({ Component, pageProps }: AppProps) {
  const theme = useThemeStore((state) => state.theme);
  return (
    //<Authentication>
      <ThemeProvider theme={theme}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <Component {...pageProps} css={css`
          --bg-color: ${theme.palette.background.default};
        `}/>
      </ThemeProvider>
    //</Authentication>
  );
}

export default MyApp;
