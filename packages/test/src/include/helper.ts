import crypto from "crypto";
import {
  sign_keyPair_fromSeed,
  sign_detached,
  sign_detached_verify,
  box,
  box_open,
  BoxLength,
} from "@bfchain/core-crypto-tweetnacl";
import { convertPublicKey, convertSecretKey } from "@bfchain/core-crypto-ed2curve";

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
export const NodeJsKeypairHelper: BFChainCore.KeypairHelperInterface = {
  create(secret: any) {
    const hash = NodeJsCryptoHelper.sha256()
      .update(secret, "utf8")
      .digest();
    const keypair = sign_keyPair_fromSeed(hash);
    return {
      secretKey: Buffer.from(keypair.secretKey),
      publicKey: Buffer.from(keypair.publicKey),
    };
  },
  detached_sign(hash: any, secretKey: any) {
    return Buffer.from(sign_detached(hash, secretKey));
  },
  detached_verify(hash: any, signatureBuffer: any, publicKey: any) {
    return sign_detached_verify(hash, signatureBuffer, publicKey);
  },
  box(
    msg: Uint8Array,
    publicKey: Uint8Array,
    secretKey: Uint8Array,
    nonce = new Uint8Array(BoxLength.Nonce),
  ) {
    const encryptedMessage = box(msg, nonce, publicKey, secretKey);
    return { encryptedMessage, nonce };
  },
  open(msg: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array) {
    return box_open(msg, nonce, publicKey, secretKey) || false;
  },
};

export const Ed2curveHelper: BFChainCore.Ed2curveHelperInterface = {
  convertPublicKey,
  convertSecretKey,
};
