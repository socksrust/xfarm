
import { PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { connection } from "src/programUtils/helpers";

import * as spl from '@solana/spl-token';


export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const PROGRAM_ID = 'CPewZEDcbVeDPxeh7Mq5K6zwAMA9CoC6jNyNWFX4zZLr';
export const SOURCE_EXISTING = "existing";
export const C_MINT = new PublicKey('AFvt4EhTybpRHJpU5X9kYTWDqsgwD9gxittNtSsqMQxX')
export const POOL_ADDRESS = new PublicKey('4q3nER8cJ5ZWLSZ9itoZb2h5jAnFwUcDSrERLondoSup');

const usdcToken = new spl.Token(
  connection,
  USDC_MINT,
  spl.TOKEN_PROGRAM_ID,
  Keypair.generate(),
)

export const getCurrentUser = async ({ publicKey, cMint, mint }) => {
  const usdcTokenAccount = (await connection.getTokenAccountsByOwner(publicKey, { mint: new PublicKey(mint) }))?.value[0]?.pubkey;
  const cTokenAccount = (await connection.getTokenAccountsByOwner(publicKey, { mint: new PublicKey(cMint) }))?.value[0]?.pubkey;

  return {
    publicKey,
    mintTokenAccount: usdcTokenAccount,
    ctokenMintTokenAccount: cTokenAccount
  }
}

export const getCTokenAccount = async ({ publicKey, cMint }) => {

  try {
    const userAccounts = await connection.getTokenAccountsByOwner(publicKey, { mint: new PublicKey(cMint) });
    console.log('userAccounts:', userAccounts);
    return !!userAccounts?.value[0] && !!userAccounts?.value[0].pubkey
  } catch (e) {
    console.log('(userAccounts)getCTokenAccount error', e);
    return;
  }

}

export const createUserTokenAccount = async ({ publicKey, sendTransaction, mint, cMint }) => {
  const transaction = new Transaction();

  const cTokenAccount = (await connection.getTokenAccountsByOwner(publicKey, { mint: new PublicKey(cMint) }))?.value[0]?.pubkey;

  if (!cTokenAccount) {
    const tokenAddress = await spl.Token.getAssociatedTokenAddress(spl.ASSOCIATED_TOKEN_PROGRAM_ID, spl.TOKEN_PROGRAM_ID, cMint, publicKey)
    const initInstr = spl.Token.createAssociatedTokenAccountInstruction(spl.ASSOCIATED_TOKEN_PROGRAM_ID, spl.TOKEN_PROGRAM_ID, cMint, tokenAddress, publicKey, publicKey)
    transaction.add(initInstr);
  }

  transaction.feePayer = publicKey || undefined;
  transaction.recentBlockhash = await (
    await connection.getLatestBlockhash()
  ).blockhash;


  const txid = await sendTransaction(transaction, connection);

}


export const getTotalLiquidity = async ({cMint}) => {

  let totalLiquidity = 0;
  try {
    totalLiquidity = Number((await connection.getTokenSupply(new PublicKey(cMint)))?.value?.amount || 0);
  } catch (e) {
    console.log('error total', e.message)
  }

  return totalLiquidity
}

export const getUsdcMint = ({ program }) => ({
  program,
  connection,
  decimals: 6,
  existingTokenAccSrc: undefined,
  existingTokenAccSrcAuth: undefined,
  source: SOURCE_EXISTING,
  splToken: usdcToken,
})

export const getTokenMint = ({ program, decimals, mint }) => ({
  program,
  connection,
  decimals,
  existingTokenAccSrc: undefined,
  existingTokenAccSrcAuth: undefined,
  source: SOURCE_EXISTING,
  splToken: new spl.Token(
    connection,
    new PublicKey(mint),
    spl.TOKEN_PROGRAM_ID,
    Keypair.generate(),
  )
})

export interface TokenDefinition {
  symbol: string,
  mint: PublicKey,
  decimals: number,
}
