import { AppProps } from "next/app";
import React, { useMemo } from "react";

import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "styled-components";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import {
  darkTheme,
  lightTheme,
  nextDarkTheme,
  nextLightTheme,
} from "../utils/theme";
import { DefaultSeo } from "next-seo";
import SEO from "../../next-seo.config";
import { ToastContainer } from "react-toastify";

import { Layout } from "src/components/layout";
import "../utils/styles.css";
import "rc-slider/assets/index.css";
import "react-toastify/dist/ReactToastify.css";

import useDarkMode from "use-dark-mode";
import { WalletKitProvider } from "@gokiprotocol/walletkit";

function MyApp({ Component, pageProps }: AppProps) {
  const darkMode = useDarkMode(false);

  return (
    <WalletKitProvider
      defaultNetwork="mainnet-beta"
      app={{
        name: "woof",
      }}
    >
      <ThemeProvider theme={darkMode.value ? darkTheme : lightTheme}>
        <DefaultSeo {...SEO} />
        <NextUIProvider theme={darkMode.value ? nextDarkTheme : nextLightTheme}>
          <Layout>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />{" "}
            <Component {...pageProps} />
          </Layout>
        </NextUIProvider>
      </ThemeProvider>
    </WalletKitProvider>
  );
}

export default MyApp;
