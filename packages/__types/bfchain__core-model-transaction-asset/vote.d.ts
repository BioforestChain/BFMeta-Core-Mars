import { Message } from "@bfchain/protobuf";
export declare class VoteModel extends Message<VoteModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.VoteJSON> {
    equity: string;
    toJSON(): {
        equity: string;
    };
}
export declare class VoteAssetModel extends Message<VoteAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.VoteAssetJSON> {
    vote: VoteModel;
    toJSON(): {
        vote: {
            equity: string;
        };
    };
}
