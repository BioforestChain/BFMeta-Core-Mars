import { Message } from "@bfchain/protobuf";
/**
 * username 交易 asset 模型
 *
 */
export declare class UsernameModel extends Message<UsernameModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameJSON> {
    /**新的用户名 */
    alias: string;
    /**欲设置用户名的账户公钥 */
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    toJSON(): {
        alias: string;
        publicKey: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<UsernameModel>): T;
}
/**
 * username 交易 asset 外层模型
 *
 */
export declare class UsernameAssetModel extends Message<UsernameAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.UsernameAssetJSON> {
    username: UsernameModel;
    toJSON(): {
        username: {
            alias: string;
            publicKey: string;
        };
    };
}
//# sourceMappingURL=username.d.ts.map