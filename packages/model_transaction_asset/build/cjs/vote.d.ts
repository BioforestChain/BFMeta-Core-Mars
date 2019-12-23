import { Message } from "@bfchain/protobuf";
/**
 * vote 交易 asset 模型
 *
 */
export declare class VoteModel extends Message<VoteModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.VoteJSON> {
    /**欲转账的数字资产所属链名 */
    equity: string;
    toJSON(): {
        equity: string;
    };
}
/**
 * vote 交易 asset 外层模型
 *
 */
export declare class VoteAssetModel extends Message<VoteAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.VoteAssetJSON> {
    vote: VoteModel;
    toJSON(): {
        vote: {
            equity: string;
        };
    };
}
//# sourceMappingURL=vote.d.ts.map