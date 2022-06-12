import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { bn } from "../general/utils";
import * as _ from "lodash";
import * as u from "../general/utils";
import { Pool } from '../pool/classes';
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import fs from 'fs'


const SOURCE_NEW = "new";
const SOURCE_EXISTING = "existing";

const globalKeypair = Keypair.generate()

export class Mint {
    program: Program<any>;
    connection: Connection;

    // new mint
    authority?: User;
    decimals?: number;

    // existing mint
    existingTokenAccSrc?: anchor.web3.PublicKey;
    existingTokenAccSrcAuth?: anchor.web3.Keypair;
    
    source?: String;
    splToken?: spl.Token;


    // create a new mint object from an entirely new mint
    static createNew(program: Program<any>, connection: Connection, authority: User, decimals: number) {
        const mint = new Mint();
        mint.program = program;
        mint.connection = connection;
        mint.authority = authority;
        mint.decimals = decimals;
        mint.source = SOURCE_NEW;
        return mint;
    }

    // create a new mint object from an existing mint
    static createExisting(
        program: Program<any>,
        connection: Connection,
        key: anchor.web3.PublicKey, 
        existingTokenAccSrc?: anchor.web3.PublicKey,  // used to fund the account
        existingTokenAccSrcAuth?: anchor.web3.Keypair, // cant fund account if devnet AND not wSOL
    ) {
        const mint = new Mint();
        mint.program = program;
        mint.connection = connection;
        mint.splToken = new spl.Token(
            connection,
            key,
            spl.TOKEN_PROGRAM_ID,
            globalKeypair,
        );
        mint.source = SOURCE_EXISTING;
        mint.existingTokenAccSrc = existingTokenAccSrc;
        mint.existingTokenAccSrcAuth = existingTokenAccSrcAuth;
        return mint;
    }

    async initialize() {
        if (this.source === SOURCE_NEW) {  // new mint
            this.splToken = await spl.Token.createMint(
                this.connection,
                this.authority?.keypair!,
                this.authority?.publicKey!,
                this.authority?.publicKey!,
                this.decimals!,
                spl.TOKEN_PROGRAM_ID,
            );
            return this.splToken;
        } else if (this.source === SOURCE_EXISTING) {  // existing mint
            //@ts-ignore
            this.decimals = (await this.splToken?.getMintInfo()).decimals;
        } else {
            throw Error("Mint must be created from createNew or createExisting functions");
        }
    }

}

export class User {
    vault?: Vault;
    originalMintAmount?: anchor.BN;
    depositAmount?: anchor.BN;

    keypair: anchor.web3.Keypair;
    publicKey: anchor.web3.PublicKey;
    mintTokenAccount?: anchor.web3.PublicKey;
    ctokenMintTokenAccount?: anchor.web3.PublicKey;

    constructor(
        vault?: Vault,
        originalMintAmount?: anchor.BN,
        depositAmount?: anchor.BN,
    ) {
        this.vault = vault;
        this.originalMintAmount = originalMintAmount || bn(0);
        this.depositAmount = depositAmount;

        this.keypair = anchor.web3.Keypair.generate();
        this.publicKey = this.keypair.publicKey;
    }

    async initialize() {
        // create token account (if vault)
        if (this.vault) {
            this.mintTokenAccount = await this.createTokenAccount(
                this.vault.mint,
            );
        }
    }

    async initializeAccrueTokenAccount() { // can only be called after ctokenMint is created
        if (this.vault) {
            this.ctokenMintTokenAccount = await this.vault?.ctokenMint?.createAssociatedTokenAccount(
                this.publicKey
            );
        }
    }

    async createTokenAccount(mint: Mint) {
        const tokenAccount = await mint?.splToken?.createAccount(
            this.publicKey
        );
        return tokenAccount;
    }
}

export class CurrentUser {
    vault?: Vault;
    originalMintAmount?: anchor.BN;
    depositAmount?: anchor.BN;

    keypair: anchor.web3.Keypair;
    publicKey: anchor.web3.PublicKey;
    mintTokenAccount?: anchor.web3.PublicKey;
    ctokenMintTokenAccount?: anchor.web3.PublicKey;

    constructor(
        keypair: Keypair,
    ) {
        this.originalMintAmount = bn(0);

        this.keypair = keypair;
        this.publicKey = this.keypair.publicKey;
    }

    async initialize() {
        // create token account (if vault)
        if (this.vault) {
            this.mintTokenAccount = await this.createTokenAccount(
                this.vault.mint,
            );
        }
    }

    async initializeAccrueTokenAccount() { // can only be called after ctokenMint is created
        if (this.vault) {
            this.ctokenMintTokenAccount = await this.vault?.ctokenMint?.createAssociatedTokenAccount(
                this.publicKey
            );
        }
    }

    async createTokenAccount(mint: Mint) {
        const tokenAccount = await mint.splToken?.createAccount(
            this.publicKey
        );
        return tokenAccount;
    }
}

const vaultCreator = new PublicKey('BrfV8TjWPM1EPeXkVVAiLnJfwrV8hxdEK6oAtHxNpNhs');

export class Vault {
    version: number = 56;  // why not 0? Because we need to test a non-zero value to make sure our instruction actually uses our passed in value
    cluster: number = 1;
    mint: Mint;
    vaultCreator: User;
    client: PublicKey = SystemProgram.programId;  // 111... represents that anyone can deposit
    protocolsMax: number = 4;  // why not 0? same as `version` reason. But also we want to add protocols later

    vaultInfo?: anchor.web3.PublicKey;
    vaultInfoBump?: number;
    ctokenMint?: spl.Token;
    ctokenMintBump?: number;
    
    // Pool
    pool?: Pool;

    // Fees
    depositFee: anchor.BN = u.bn(0);
    withdrawFee: anchor.BN = u.bn(0);
    interestFee: anchor.BN = u.bn(0);
    balanceEstimate: anchor.BN = u.bn(0);
    collectibleFee: anchor.BN = u.bn(0);

    // Protocols
    protocols: any[] = [];

    userWithdrawsDisabled: boolean = false;

    constructor(
        mint: Mint,
        vaultCreator: User,
    ) {
        this.mint = mint;
        this.vaultCreator = vaultCreator;
        this.pool = new Pool(this);
    }

    async initialize() {
        [this.vaultInfo, this.vaultInfoBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("vault_info", "utf-8"), 
            this.mint?.splToken?.publicKey?.toBuffer()!,
            vaultCreator.toBuffer()],
            this.mint.program.programId
        );

        const [ctokenMint, ctokenMintBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from("ctoken_mint", "utf-8"), 
            this.mint.splToken?.publicKey.toBuffer()!,
            vaultCreator.toBuffer()],
            this.mint.program.programId
        );
        this.ctokenMint = new spl.Token(
            this.mint.connection,
            ctokenMint,
            spl.TOKEN_PROGRAM_ID,
            this.vaultCreator.keypair,
        );
        this.ctokenMintBump = ctokenMintBump;

        await this.pool?.initialize(this.mint.program, this.mint.splToken?.publicKey!, vaultCreator);
        // this doesn't do anything, bc no protocols are added yet:
        for (let i = 0; i < this.protocols.length; i++) {
            await this.protocols[i].initialize(this.mint.program);
        }
    }
    
    // Add funds to the wallet without generating supply, which mimics
    // the concept of accruing interest
    async accrueInterest(amountToAccrue: number) {
        return await this.mint.splToken?.mintTo(
            this.pool?.publicKey!,
            this.mint.authority?.publicKey!,
            [],
            new spl.u64(amountToAccrue),  // must use spl.u64 with mintTo
        )
    }

    getProtocol (uuid: String) {
        return _.find(this.protocols, p => _.isEqual(p.uuid, u.convertStrToUint8(uuid)));
    }
}


export class LastUpdate {
    slot: anchor.BN = bn(0);
    stale: boolean = true;

}