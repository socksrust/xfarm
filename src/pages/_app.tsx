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
import { WalletListener } from "../providers/WalletListener";
import { WalletProvider } from "../providers/WalletProvider";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { SolletWalletAdapter } from "@solana/wallet-adapter-sollet";
import { SlopeWalletAdapter } from "@solana/wallet-adapter-slope";
import { GlowWalletAdapter } from "@solana/wallet-adapter-glow";
import { Layout } from "src/components/layout";
import "../utils/styles.css";
import useDarkMode from "use-dark-mode";

function MyApp({ Component, pageProps }: AppProps) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new SlopeWalletAdapter(),
      new GlowWalletAdapter(),
    ],
    []
  );
  const darkMode = useDarkMode(false);

  return (
    <ThemeProvider theme={darkMode.value ? darkTheme : lightTheme}>
      <WalletProvider wallets={wallets}>
        <DefaultSeo {...SEO} />
        <WalletListener />
        <NextUIProvider theme={darkMode.value ? nextDarkTheme : nextLightTheme}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </NextUIProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default MyApp;
