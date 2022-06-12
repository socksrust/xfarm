import React, {
  Fragment,
  useCallback,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { useWallet, Wallet } from "@solana/wallet-adapter-react";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { ThemeContext } from "styled-components";

import { notify } from "../stores/utils/notifications";
import useMangoStore from "../stores/useMangoStore";
import { useTranslation } from "next-i18next";
import { WalletSelect } from "../components/mango/WalletSelect";
import uniqBy from "lodash/uniqBy";

export const handleWalletConnect = (wallet: Wallet) => {
  if (!wallet) {
    return;
  }
  if (wallet.readyState === WalletReadyState.NotDetected) {
    window.open(wallet.adapter.url, "_blank");
  } else {
    wallet?.adapter?.connect().catch((e) => {
      if (e.name.includes("WalletLoadError")) {
        notify({
          title: `${wallet.adapter.name} Error`,
          type: "error",
          description: `Please install ${wallet.adapter.name} and then reload this page.`,
        });
      }
    });
    wallet?.adapter?.name &&
      localStorage.setItem("wallet", wallet?.adapter?.name);
  }
};

export const ConnectWalletButton: React.FC = () => {
  const { wallet, wallets, select, connected, publicKey } = useWallet();
  const { t } = useTranslation("common");
  const mangoGroup = useMangoStore((s) => s.selectedMangoGroup.current);
  const set = useMangoStore((s) => s.set);
  const theme = useContext(ThemeContext);
  const { primaryText, primaryBackground, secondaryBackground } = theme;
  const installedWallets = useMemo(() => {
    const installed: Wallet[] = [];

    for (const wallet of wallets) {
      if (wallet.readyState === WalletReadyState.Installed) {
        installed.push(wallet);
      }
    }

    return installed;
  }, [wallets]);

  const displayedWallets = useMemo(() => {
    return uniqBy([...installedWallets, ...wallets], (w) => {
      return w.adapter.name;
    });
  }, [wallets, installedWallets]);

  const handleConnect = useCallback(() => {
    if (wallet) {
      handleWalletConnect(wallet);
    }
  }, [wallet]);

  useEffect(() => {
    const wall = localStorage.getItem("wallet");
    //!wallet && wall && select(wallet)
    handleConnect();
    /*if (!wallet && displayedWallets?.length) {
      select(displayedWallets[0].adapter.name)
    }*/
  }, [wallet, displayedWallets, select]);

  const handleDisconnect = useCallback(() => {
    wallet?.adapter?.disconnect();
    set((state) => {
      state.mangoAccounts = [];
      state.selectedMangoAccount.current = null;
      state.tradeHistory = {
        spot: [],
        perp: [],
        parsed: [],
        initialLoad: false,
      };
    });
    notify({
      type: "info",
      title: t("wallet-disconnected"),
    });
  }, [wallet, set, t]);

  if (publicKey) {
    return (
      <div
        className="flex h-14 justify-between divide-x"
        id="connect-wallet-tip"
        style={{
          backgroundColor: "transparent",
          color: primaryText,
          border: "1px solid white",
          borderRadius: "0.20rem",
        }}
      >
        <button
          onClick={handleDisconnect}
          disabled={!mangoGroup}
          className="rounded-none bg-th-primary-dark text-th-bkg-1 hover:brightness-[1.1] focus:outline-none disabled:cursor-wait disabled:text-th-bkg-2"
          style={{
            backgroundColor: "transparent",
            color: primaryText,
            paddingLeft: 15,
            paddingRight: 15,
          }}
        >
          <div className="default-transition flex h-full flex-row items-center justify-center px-3">
            <div className="text-left">
              <div className="mb-0.5 whitespace-nowrap font-bold">
                Disconnect
              </div>
              {wallet?.adapter?.name && (
                <div className="text-xxs font-normal leading-3 tracking-wider text-th-bkg-2">
                  {wallet.adapter.name}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex h-14 justify-between divide-x"
      id="connect-wallet-tip"
      style={{
        backgroundColor: secondaryBackground,
        color: primaryText,
        borderRadius: "0.20rem",
      }}
    >
      <button
        onClick={handleConnect}
        disabled={!mangoGroup}
        className="rounded-none bg-th-primary-dark text-th-bkg-1 hover:brightness-[1.1] focus:outline-none disabled:cursor-wait disabled:text-th-bkg-2"
        style={{
          backgroundColor: secondaryBackground,
          color: primaryText,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: "0.20rem",
        }}
      >
        <div className="default-transition flex h-full flex-row items-center justify-center px-3">
          <div className="text-left">
            <div className="mb-0.5 whitespace-nowrap font-bold">Connect</div>
            {wallet?.adapter?.name && (
              <div className="text-xxs font-normal leading-3 tracking-wider text-th-bkg-2">
                {wallet.adapter.name || "Pick wallet"}
              </div>
            )}
          </div>
        </div>
      </button>
      <div className="relative">
        <WalletSelect wallets={displayedWallets} theme={theme} />
      </div>
    </div>
  );
};
