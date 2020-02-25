/// <reference types="node" />
declare namespace BFChainCore {
    type ToJSONReturnType<T extends BFChainUtil.JSONAble> = ReturnType<T["toJSON"]>;
    type JSONToModelType<J extends object = object> = J & BFChainUtil.JSONAble<J>;
    type AssetJSONToModelType<J extends object = object> = JSONToModelType<J>;
    type AssetInfoJSON = {
        magic: string;
        assetType: string;
    };
    interface KeypairHelperInterface {
        create(secretHash: Uint8Array): Keypair;
        detached_sign(hash: Uint8Array, secretKey: Uint8Array): Buffer;
        detached_verify(hash: Uint8Array, signatureBuffer: Uint8Array, publicKeyBuffer: Uint8Array): boolean;
        box(msg: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array, nonce?: Uint8Array): {
            nonce: Uint8Array;
            encryptedMessage: Uint8Array;
        };
        open(msg: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array, nonce: Uint8Array): Uint8Array | false;
    }
    type Keypair = {
        publicKey: Buffer;
        secretKey: Buffer;
    };
    interface Ed2curveHelperInterface {
        convertPublicKey(pk: Uint8Array): Uint8Array;
        convertSecretKey(sk: Uint8Array): Uint8Array;
    }
    interface CryptoHelperInterface {
        sha256(): BFChainUtil.Hash;
        md5(): BFChainUtil.Hash;
        ripemd160(): BFChainUtil.Hash;
    }
}
