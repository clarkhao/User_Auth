//应用模块
import React from "react";
import { useRouter } from "next/router";
//style
import "../styles/globals.css";
import "src/component/ui/Complete.css";
//组件
import { StrictMode } from "react";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@mui/material/styles";
import { useThemeStore } from "src/store";
import Head from "next/head";
//hooks

function MyApp({ Component, pageProps }: AppProps) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <Head>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </StrictMode>
  );
}

export default MyApp;
