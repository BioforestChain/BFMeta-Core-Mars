import { Message } from "@bfchain/protobuf";
export declare class UsernameModel extends Message<UsernameModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameJSON> {
    alias: string;
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    toJSON(): {
        alias: string;
        publicKey: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<UsernameModel>): T;
}
export declare class UsernameAssetModel extends Message<UsernameAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameAssetJSON> {
    username: UsernameModel;
    toJSON(): {
        username: {
            alias: string;
            publicKey: string;
        };
    };
}
