import React from 'react';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey, Connection } from '@solana/web3.js';
import { PROGRAM_ID } from 'src/utils/constants';
import dbConnect from 'src/db/mongodb';
import Pool from 'src/db/models/pool.js';
import { updatePool } from 'src/utils/fetch';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const connection = new Connection('https://divine-white-river.solana-mainnet.quiknode.pro/4d2c6937e9152d8111a4c43e6ca110dd793e64c2/')

export const fetchVoltLiquidities = async ({wallet, cMint}) => {

  const walletTokens = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
    programId: TOKEN_PROGRAM_ID,
  })

  const poolTokenAccount = walletTokens.value
    .find((wt) => wt.account.data.parsed.info.mint === cMint)


  console.log('poolTokenAccount?.pubkey', poolTokenAccount?.pubkey.toString());
  let yourLiquidity = 0;
  try {
    yourLiquidity = Number((await connection.getTokenAccountBalance(poolTokenAccount?.pubkey!))?.value?.amount || 0);
  } catch(e) {}

  let totalLiquidity = 0;
  try {
    totalLiquidity = Number((await connection.getTokenSupply(new PublicKey(cMint)))?.value?.amount || 0);
  } catch (e) {
    console.log('error total', e.message)
  }

  return {
    yourLiquidity,
    totalLiquidity,
  }
}

export const updateDB = async ({id, poolAddress}) => {

  let totalLiquidity = 0;
  try {
    totalLiquidity = Number((await connection.getTokenAccountBalance(new PublicKey(poolAddress)))?.value?.amount || 0);
  } catch(e) {
    return;
  }

  await updatePool({ id, totalLiquidity })
}

export const getProgram = async ({ adapter }) => {
  const options = anchor.Provider.defaultOptions();

  const provider = new anchor.Provider(connection, adapter, options);

  anchor.setProvider(provider);

  const idl = await Program.fetchIdl(PROGRAM_ID)
  return new Program(idl, PROGRAM_ID, provider);
}
