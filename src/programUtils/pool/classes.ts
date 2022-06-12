import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import { NonceAccount, PublicKey } from '@solana/web3.js';
import { bn, U64_MAX, convertStrToUint8 } from "../general/utils";
import { LastUpdate, Mint, User, Vault } from "../vault/classes";
import * as _ from "lodash";
import { Program } from '@project-serum/anchor';

export const POOL_UUID = "POOL";

export class Pool {
    uuid: Uint8Array = convertStrToUint8(POOL_UUID);
    vault: Vault;
    publicKey?: anchor.web3.PublicKey;
    bump?: number;
    distribution: anchor.BN = U64_MAX;
    balance: anchor.BN = bn(0);
    lastUpdate = new LastUpdate();

    constructor (vault: Vault) {
        this.vault = vault;
    }

    async initialize(program: Program<any>, mint: PublicKey, vaultCreator: PublicKey) {
        [this.publicKey, this.bump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("pool", "utf-8"), 
            mint.toBuffer(), 
            vaultCreator.toBuffer()],
            program.programId
        );
    }

    // "Accrues interest" by transferring user tokens into pool without minting aTokens
    async accrueInterestXfer(mint: Mint, citizen: User, amount: number) {
        return await mint?.splToken?.transfer(
            citizen?.mintTokenAccount!,
            this.publicKey!,
            citizen.publicKey,
            [citizen.keypair],
            amount,
        );
    }

}
