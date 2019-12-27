import * as tweetnacl from "tweetnacl";
import * as ed2curve from "ed2curve";
import crypto from "crypto";
/**type LOWLEVEL */
const NACL_LOWLEVEL = (<any>tweetnacl)["lowlevel"] as {
  crypto_core_hsalsa20: number;
  crypto_stream_xor: number;
  crypto_stream: number;
  crypto_stream_salsa20_xor: number;
  crypto_stream_salsa20: number;
  crypto_onetimeauth: number;
  crypto_onetimeauth_verify: number;
  crypto_verify_16: number;
  crypto_verify_32: number;
  crypto_secretbox: number;
  crypto_secretbox_open: number;
  crypto_scalarmult: number;
  crypto_scalarmult_base: number;
  crypto_box_beforenm: number;
  crypto_box_afternm: number;
  crypto_box: number;
  crypto_box_open: number;
  crypto_box_keypair: number;
  crypto_hash: number;
  crypto_sign: number;
  crypto_sign_keypair: number;
  crypto_sign_open: number;

  crypto_secretbox_KEYBYTES: number;
  crypto_secretbox_NONCEBYTES: number;
  crypto_secretbox_ZEROBYTES: number;
  crypto_secretbox_BOXZEROBYTES: number;
  crypto_scalarmult_BYTES: number;
  crypto_scalarmult_SCALARBYTES: number;
  crypto_box_PUBLICKEYBYTES: number;
  crypto_box_SECRETKEYBYTES: number;
  crypto_box_BEFORENMBYTES: number;
  crypto_box_NONCEBYTES: number;
  crypto_box_ZEROBYTES: number;
  crypto_box_BOXZEROBYTES: number;
  crypto_sign_BYTES: number;
  crypto_sign_PUBLICKEYBYTES: number;
  crypto_sign_SECRETKEYBYTES: number;
  crypto_sign_SEEDBYTES: number;
  crypto_hash_BYTES: number;
};
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
    const keypair = tweetnacl.sign.keyPair.fromSeed(hash);
    return {
      secretKey: Buffer.from(keypair.secretKey),
      publicKey: Buffer.from(keypair.publicKey),
    };
  },
  detached_sign(hash: any, secretKey: any) {
    return Buffer.from(tweetnacl.sign.detached(hash, secretKey));
  },
  detached_verify(hash: any, signatureBuffer: any, publicKey: any) {
    return tweetnacl.sign.detached.verify(hash, signatureBuffer, publicKey);
  },
  box(
    msg: Uint8Array,
    publicKey: Uint8Array,
    secretKey: Uint8Array,
    nonce = new Uint8Array(tweetnacl.box.nonceLength),
  ) {
    const encryptedMessage = tweetnacl.box(msg, nonce, publicKey, secretKey);
    return { encryptedMessage, nonce };
  },
  open(msg: Uint8Array, nonce: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array) {
    return tweetnacl.box.open(
      msg.slice(NACL_LOWLEVEL.crypto_secretbox_BOXZEROBYTES),
      nonce,
      publicKey,
      secretKey,
    );
  },
};

export const Ed2curveHelper: BFChainCore.Ed2curveHelperInterface = {
  convertPublicKey(pk: Uint8Array): Uint8Array {
    const curveDecryptPK = ed2curve.convertPublicKey(pk);
    if (!curveDecryptPK) {
      throw new Error("DecryptPK convertPublicKey failed");
    }
    return curveDecryptPK;
  },
  convertSecretKey(sk: Uint8Array): Uint8Array {
    const curveEncryptSK = ed2curve.convertSecretKey(sk);
    if (!curveEncryptSK) {
      throw new Error("DecryptPK convertSecretKey failed");
    }
    return curveEncryptSK;
  },
};
