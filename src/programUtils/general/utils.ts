import * as anchor from '@project-serum/anchor';
import * as spl from '@solana/spl-token';
import * as chai from "chai";
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, sendAndConfirmTransaction, Connection } from "@solana/web3.js";
import * as chaiAsPromised from "chai-as-promised";
import { TransactionInstruction } from '@solana/web3.js';

// Numbers
const U64_MAX = bn("18446744073709551615");  // verified that this is the max value of u64 in our smart contract

function bn(z: number | string): anchor.BN {
    return new anchor.BN(z);
}

// Strings
function convertStrToUint8(str: String): Uint8Array {
    return Uint8Array.from(str, x => x.charCodeAt(0));
    // To convert to program format: Array.from(convertStrToUint8(str))
}

export {
    bn,
    U64_MAX,
    convertStrToUint8,
}