import { Message } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";
/**
 * mark 交易 asset 模型
 *
 */
export declare class MarkModel extends Message<MarkModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.MarkJSON> {
    static INC: number;
    /**存证的拥有者地址 */
    markPossessor: string;
    /**存证数据 */
    content: string;
    /**数据操作类型 get/put/post... */
    action: string;
    /**存证所属的 dapp */
    dapp: DAppModel;
    toJSON(): {
        markPossessor: string;
        content: string;
        action: string;
        dapp: BFChainCore.DAppJSON;
    };
}
/**
 * mark 交易 asset 外层模型
 *
 */
export declare class MarkAssetModel extends Message<MarkAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.MarkAssetJSON> {
    mark: MarkModel;
    toJSON(): {
        mark: {
            markPossessor: string;
            content: string;
            action: string;
            dapp: BFChainCore.DAppJSON;
        };
    };
}
//# sourceMappingURL=mark.d.ts.map