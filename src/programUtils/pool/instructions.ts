import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import _ from 'lodash';
import { User, Vault } from "../vault/classes";

type depositPoolOverrides = {
    depositAmount?: anchor.BN,
    depositor?: anchor.web3.PublicKey,
    vaultInfo?: anchor.web3.PublicKey,
    pool?: anchor.web3.PublicKey,
    depositorTokenAccount?: anchor.web3.PublicKey,
    ctokenMint?: anchor.web3.PublicKey,
    depositorCTokenAccount?: anchor.web3.PublicKey,
    tokenProgram?: anchor.web3.PublicKey,
    rent?: anchor.web3.PublicKey,
    clock?: anchor.web3.PublicKey,
    signers?: anchor.web3.Keypair[],
}
function depositPoolInstr(program, depositor: User, overrides: depositPoolOverrides = {}) {

  return program.instruction.depositPool(
    //@ts-ignore
    _.get(overrides, "depositAmount", depositor.depositAmount),
    {
      accounts: {
        depositor: _.get(overrides, "depositor", depositor.publicKey),
        vaultInfo: _.get(overrides, "vaultInfo", depositor?.vault?.vaultInfo),
        pool: _.get(overrides, "pool", depositor?.vault?.pool?.publicKey),
        ctokenMint: _.get(overrides, "ctokenMint", depositor?.vault?.ctokenMint?.publicKey), 
        depositorTokenAccount: _.get(overrides, "depositorTokenAccount", depositor.mintTokenAccount),
        depositorCTokenAccount: _.get(overrides, "depositorCTokenAccount", depositor.ctokenMintTokenAccount),
        tokenProgram: _.get(overrides, "tokenProgram", spl.TOKEN_PROGRAM_ID),
        rent: _.get(overrides, "rent", anchor.web3.SYSVAR_RENT_PUBKEY),
        clock: _.get(overrides, "clock", anchor.web3.SYSVAR_CLOCK_PUBKEY),
      },
  })
}
  
async function depositPool(depositor: User, overrides: depositPoolOverrides = {}, simulate: boolean = false) {
  const txn = new anchor.web3.Transaction();

  //@ts-ignore
  txn.add(depositPoolInstr(depositor, overrides))
  
  
  const signers = _.get(overrides, "signers", [depositor.keypair]);
  if (simulate) {
    return await depositor?.vault?.mint.program.provider.simulate(txn, signers);
  } else {
    return await depositor?.vault?.mint.program.provider.send(txn, signers); 
  }
}
  
  
  type withdrawPoolOverrides = {
    withdrawAmount?: anchor.BN,
    withdrawer?: anchor.web3.PublicKey,
    vaultInfo?: anchor.web3.PublicKey,
    pool?: anchor.web3.PublicKey,
    mint?: anchor.web3.PublicKey,
    withdrawerTokenAccount?: anchor.web3.PublicKey,
    ctokenMint?: anchor.web3.PublicKey,
    withdrawerCTokenAccount?: anchor.web3.PublicKey,
    tokenProgram?: anchor.web3.PublicKey,
    associatedTokenProgram?: anchor.web3.PublicKey,
    rent?: anchor.web3.PublicKey,
    clock?: anchor.web3.PublicKey,
    signers?: anchor.web3.Keypair[],
  }

function withdrawPoolInstr(
  program,
  withdrawer: User, 
  overrides: withdrawPoolOverrides = {}
) {
  return program.instruction.withdrawPool(
    // @ts-ignore
    _.get(overrides, "withdrawAmount", new anchor.BN(10)),
    {
      accounts: {
        withdrawer: _.get(overrides, "withdrawer", withdrawer.publicKey),
        vaultInfo: _.get(overrides, "vaultInfo", withdrawer.vault?.vaultInfo),
        pool: _.get(overrides, "pool", withdrawer?.vault?.pool?.publicKey),
        mint: _.get(overrides, "mint", withdrawer?.vault?.mint?.splToken?.publicKey),
        ctokenMint: _.get(overrides, "ctokenMint", withdrawer.vault?.ctokenMint?.publicKey),
        withdrawerCTokenAccount: _.get(overrides, "withdrawerCTokenAccount", withdrawer.ctokenMintTokenAccount),
        withdrawerTokenAccount: _.get(overrides, "withdrawerTokenAccount", withdrawer.mintTokenAccount),
        tokenProgram: _.get(overrides, "tokenProgram", spl.TOKEN_PROGRAM_ID),
        rent: _.get(overrides, "rent", anchor.web3.SYSVAR_RENT_PUBKEY),
        clock: _.get(overrides, "clock", anchor.web3.SYSVAR_CLOCK_PUBKEY),
      },
  });
}
  
  async function withdrawPool(
    withdrawer: User, 
    overrides: withdrawPoolOverrides = {}, 
    simulate: boolean = false) {
    const txn = new anchor.web3.Transaction();

    // @ts-ignore
    txn.add(withdrawPoolInstr(withdrawer, overrides));
    
    const signers = _.get(overrides, "signers", [withdrawer.keypair]);
    if (simulate) {
      return await withdrawer.vault?.mint.program.provider.simulate(txn, signers);
    } else {
      return await withdrawer.vault?.mint.program.provider.send(txn, signers); 
    }
  }
  
  export {
    depositPoolInstr,
    depositPool,
    withdrawPoolInstr,
    withdrawPool,
  };