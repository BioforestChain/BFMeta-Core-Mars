import { Message } from "@bfchain/protobuf";
/**
 * Delegate 交易 asset 模型
 *
 */
export declare class DelegateModel extends Message<DelegateModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateJSON> {
    /**欲注册为受托人的账户的用户名 */
    username: string;
    /**欲注册为受托人的账户的公钥 */
    publicKeyBuffer: Uint8Array;
    get publicKey(): string;
    set publicKey(value: string);
    toJSON(): {
        username: string;
        publicKey: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<DelegateModel>): T;
}
/**
 * Delegate 交易 asset 外层模型
 */
export declare class DelegateAssetModel extends Message<DelegateAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.DelegateAssetJSON> {
    delegate: DelegateModel;
    toJSON(): {
        delegate: {
            username: string;
            publicKey: string;
        };
    };
}
//# sourceMappingURL=delegate.d.ts.map