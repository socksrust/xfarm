import React from "react";
import { Container } from "@nextui-org/react";
import { motion } from "framer-motion";
import { JupiterProvider } from "@jup-ag/react-hook";
import { useEffect } from "react";
import useMangoStore from "../stores/useMangoStore";
import { actionsSelector, connectionSelector } from "../stores/selectors";
import JupiterForm from "../components/mango/JupiterForm";
import { zeroKey } from "@blockworks-foundation/mango-client";
import { useWallet } from "@solana/wallet-adapter-react";
import PageBodyContainer from "../components/mango/PageBodyContainer";

export default function HomePage() {
  const connection = useMangoStore(connectionSelector);
  const { connected, publicKey, wallet } = useWallet();
  const actions = useMangoStore(actionsSelector);

  useEffect(() => {
    if (wallet && connected) {
      actions.fetchWalletTokens(wallet);
    }
  }, [connected, actions]);

  if (!connection) return null;

  const userPublicKey =
    publicKey && !zeroKey.equals(publicKey) ? publicKey : undefined;

  if (typeof window === "undefined") return <></>;

  const isMobile = window.innerWidth < 1400;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55 }}
      style={{ width: "100%", position: "relative" }}
    >
      <Container
        display="flex"
        direction={isMobile ? "column" : "row"}
        justify={"flex-start"}
        alignItems="flex-start"
        style={
          isMobile ? { padding: 0, marginTop: "150px" } : { marginTop: "150px" }
        }
      >
        <Container
          display="flex"
          direction="column"
          justify="flex-start"
          alignItems={"center"}
          style={isMobile ? {} : { flex: 1 }}
        >
          <JupiterProvider
            connection={connection}
            cluster="mainnet-beta"
            userPublicKey={connected ? userPublicKey : undefined}
          >
            <div
              className={`bg-th-bkg-1 text-th-fgd-1 transition-all`}
              style={{ backgroundColor: "transparent" }}
            >
              <PageBodyContainer>
                <JupiterForm />
              </PageBodyContainer>
            </div>
          </JupiterProvider>
        </Container>
      </Container>
    </motion.div>
  );
}
