import { Message } from "@bfchain/protobuf";
import { DAppModel } from "./dapp";
export declare class MarkModel extends Message<MarkModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.MarkJSON> {
    static INC: number;
    markPossessor: string;
    content: string;
    action: string;
    dapp: DAppModel;
    toJSON(): {
        markPossessor: string;
        content: string;
        action: string;
        dapp: BFChainCore.DAppJSON;
    };
}
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
