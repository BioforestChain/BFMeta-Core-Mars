import { Message } from "@bfchain/protobuf";
/**
 * setLnsManager 交易 asset 模型
 *
 */
export declare class SetLnsManagerModel extends Message<SetLnsManagerModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsManagerJSON> {
    /**欲设置管理员的链域名 */
    name: string;
    /**欲设置管理员的链域名所属的链名称 */
    sourceChainName: string;
    /**欲设置管理员的链域名所属的链网络标识符 */
    sourceChainMagic: string;
    /**新的链域名管理者地址 */
    manager: string;
    toJSON(): {
        name: string;
        sourceChainName: string;
        sourceChainMagic: string;
        manager: string;
    };
}
/**
 * setLnsManager 交易 asset 外层模型
 *
 */
export declare class SetLnsManagerAssetModel extends Message<SetLnsManagerAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.SetLnsManagerAssetJSON> {
    lnsManager: SetLnsManagerModel;
    toJSON(): {
        lnsManager: {
            name: string;
            sourceChainName: string;
            sourceChainMagic: string;
            manager: string;
        };
    };
}
//# sourceMappingURL=setLnsManager.d.ts.map