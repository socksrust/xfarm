import React from 'react';
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { connection } from "src/programUtils/helpers";
import dbConnect from 'src/db/mongodb';
import Pool from 'src/db/models/pool.js';
import { updatePool } from 'src/utils/fetch';
import * as spl from '@solana/spl-token';
import { notify } from '../stores/utils/notifications'
import {
    WhirlpoolContext, AccountFetcher, ORCA_WHIRLPOOL_PROGRAM_ID, buildWhirlpoolClient, Whirlpool, ORCA_WHIRLPOOLS_CONFIG,
    PDAUtil, PriceMath, increaseLiquidityQuoteByInputToken, IncreaseLiquidityInput
} from "@orca-so/whirlpools-sdk";
import { Provider } from "@project-serum/anchor";
import { DecimalUtil, Percentage } from "@orca-so/common-sdk";
import Decimal from "decimal.js";

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

  notify({
    type: 'confirm',
    title: 'Confirming create account transaction',
    txid,
  })
  await connection.confirmTransaction(txid, 'max');
  notify({
    type: 'success',
    title: 'Success',
    description: 'Successfully created account',
    txid,
  })
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

interface IncreaseLiquidityQuote {
  lower_tick_index: number,
  upper_tick_index: number,
  quote: IncreaseLiquidityInput
}

function get_increase_liquidity_quote(
  whirlpool: Whirlpool,
  lower_price: Decimal,
  upper_price: Decimal,
  token_input: TokenDefinition,
  amount_in: Decimal,
  acceptable_slippage: Decimal,
  token_a: TokenDefinition,
  token_b: TokenDefinition,
): IncreaseLiquidityQuote {
    const whirlpool_data = whirlpool.getData();
    //const token_a = whirlpool.getTokenAInfo();
    //const token_b = whirlpool.getTokenBInfo(); // waiting for bugfix
    const tick_spacing = whirlpool_data.tickSpacing;

    console.log("mint", token_a.mint.toBase58(), token_b.mint.toBase58());
    console.log("decimals", token_a.decimals, token_b.decimals);

    const lower_tick_index = PriceMath.priceToInitializableTickIndex(lower_price, token_a.decimals, token_b.decimals, tick_spacing);
    const upper_tick_index = PriceMath.priceToInitializableTickIndex(upper_price, token_a.decimals, token_b.decimals, tick_spacing);
    console.log("lower & upper tick_index", lower_tick_index, upper_tick_index);

    // get quote
    const quote = increaseLiquidityQuoteByInputToken(
      token_input.mint,
      amount_in,
      lower_tick_index,
      upper_tick_index,
      Percentage.fromDecimal(acceptable_slippage),
      whirlpool
    );

    console.log("tokenA max input", DecimalUtil.fromU64(quote.tokenMaxA, token_a.decimals).toString());
    console.log("tokenB max input", DecimalUtil.fromU64(quote.tokenMaxB, token_b.decimals).toString());
    console.log("liquidity", quote.liquidityAmount.toString());
    return {lower_tick_index, upper_tick_index, quote};
}

export const getApy = async ({ adapter }) => {
  const options = anchor.Provider.defaultOptions();

  const provider = new anchor.Provider(connection, adapter, options);

  const ctx = WhirlpoolContext.withProvider(provider, ORCA_WHIRLPOOL_PROGRAM_ID);
  const fetcher = new AccountFetcher(ctx.connection);
  const client = buildWhirlpoolClient(ctx, fetcher);

  const config_pubkey = ORCA_WHIRLPOOLS_CONFIG;
  const SOL : TokenDefinition = {symbol: "SOL", mint: new PublicKey("So11111111111111111111111111111111111111112"), decimals: 9};
  const USDC: TokenDefinition = {symbol: "USDC", mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6};
  const tick_spacing = 64;

  // get pool
  const whirlpool_pubkey = PDAUtil.getWhirlpool(
    ctx.program.programId,
    config_pubkey,
    SOL.mint, USDC.mint, tick_spacing).publicKey;
  console.log("whirlpool_pubkey", whirlpool_pubkey.toBase58());
  const whirlpool = await client.getPool(whirlpool_pubkey);

  // deposit
  const quote = get_increase_liquidity_quote(
    whirlpool,
    new Decimal(25), new Decimal(100), // range
    SOL, new Decimal(0.01 /* SOL */),  // est input token
    new Decimal("0.1"),                // slippage
    SOL,  // tokenA
    USDC, // tokenB
  );
  
  console.log('====== QUOTE: ', quote);
}
