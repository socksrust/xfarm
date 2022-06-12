import type { Idl } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor";
import AnchorProvider from "@project-serum/anchor";
import { chaiSolana } from "@saberhq/chai-solana";
import { SolanaProvider } from "@saberhq/solana-contrib";
import chai, { assert } from "chai";
import { connection } from '../solana/connection';
import type { Programs } from "@quarryprotocol/quarry-sdk";
import { QuarrySDK } from "@quarryprotocol/quarry-sdk";

chai.use(chaiSolana);

export type Workspace = Programs;


export const initSdk = async ({ wallet }) => {

  if(!wallet) {
    return null;
  }

  const provider = SolanaProvider.load({
    connection,
    sendConnection: connection,
    wallet,
  });
  return (await QuarrySDK.load({
    provider,
  }));
}

