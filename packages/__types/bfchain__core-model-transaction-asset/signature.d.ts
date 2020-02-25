import { Message } from "@bfchain/protobuf";
export declare class SignatureModel extends Message<SignatureModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignatureJSON> {
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    toJSON(): {
        publicKey: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<SignatureModel>): T;
}
export declare class SignatureAssetModel extends Message<SignatureAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SignatureAssetJSON> {
    signature: SignatureModel;
    toJSON(): {
        signature: {
            publicKey: string;
        };
    };
}
