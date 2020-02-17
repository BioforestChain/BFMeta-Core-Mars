import crypto from "crypto";
import "@bfchain/core-typings";
import { keypairHelper } from "@bfchain/core-crypto-tweetnacl";
import { ed2curveHelper } from "@bfchain/core-crypto-ed2curve";

export const NodeJsCryptoHelper: BFChainCore.CryptoHelperInterface & {
  sha512(): BFChainUtil.Hash;
} = {
  sha256() {
    return crypto.createHash("sha256");
  },
  sha512() {
    return crypto.createHash("sha512");
  },
  md5() {
    return crypto.createHash("md5");
  },
  ripemd160() {
    return crypto.createHash("ripemd160");
  },
};
export const NodeJsKeypairHelper: BFChainCore.KeypairHelperInterface = keypairHelper;

export const Ed2curveHelper: BFChainCore.Ed2curveHelperInterface = ed2curveHelper;
