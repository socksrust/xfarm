import { useWalletDialog } from "@solana/wallet-adapter-material-ui";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useConnectedWallet, useSolana } from "@saberhq/use-solana";
import { ConnectWalletButton } from "@gokiprotocol/walletkit";

export const ConnectWallet: React.FC<IButtonProps> = ({ ...props }) => {
  const solana = useSolana();
  const wallet = useConnectedWallet();
  console.log("solana", solana);
  console.log("wallet", wallet);
  if (wallet) {
    return (
      <Button
        onClick={solana.disconnect}
        {...props}
        style={{ borderRadius: "2rem" }}
        size="sm"
      >
        Disconnect
      </Button>
    );
  }

  return <ConnectWalletButton style={{ whiteSpace: "pre" }} />;
};
