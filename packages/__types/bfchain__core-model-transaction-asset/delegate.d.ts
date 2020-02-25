import { Message } from "@bfchain/protobuf";
export declare class DelegateModel extends Message<DelegateModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateJSON> {
    username: string;
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    toJSON(): {
        username: string;
        publicKey: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<DelegateModel>): T;
}
export declare class DelegateAssetModel extends Message<DelegateAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateAssetJSON> {
    delegate: DelegateModel;
    toJSON(): {
        delegate: {
            username: string;
            publicKey: string;
        };
    };
}
