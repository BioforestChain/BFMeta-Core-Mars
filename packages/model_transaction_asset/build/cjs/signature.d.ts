import { Message } from "@bfchain/protobuf";
/**
 * signature 交易 asset 模型
 *
 */
export declare class SignatureModel extends Message<SignatureModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignatureJSON> {
    /**二次密码生成的公钥 */
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    toJSON(): {
        publicKey: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<SignatureModel>): T;
}
/**
 * signature 交易 asset 外层模型
 *
 */
export declare class SignatureAssetModel extends Message<SignatureAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignatureAssetJSON> {
    signature: SignatureModel;
    toJSON(): {
        signature: {
            publicKey: string;
        };
    };
}
//# sourceMappingURL=signature.d.ts.map