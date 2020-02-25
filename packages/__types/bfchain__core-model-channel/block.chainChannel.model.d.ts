import { Message } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { SomeBlockModel } from "@bfchain/core-model-block";
export declare class BlockQueryOptionsModel extends Message<BlockQueryOptionsModel> implements BFChainCore.JSONToModelType<BFChainCore.BlockQueryOptionsJSON> {
    signature?: string;
    height?: number;
    toJSON(): BFChainCore.BlockQueryOptionsJSON;
}
export declare class QueryBlockArgModel extends Message<QueryBlockArgModel> implements BFChainCore.JSONToModelType<BFChainCore.QueryBlockArgJSON> {
    query: BlockQueryOptionsModel;
    toJSON(): {
        query: BFChainCore.BlockQueryOptionsJSON;
    };
}
export declare class QueryBlockReturnModel<B extends BFChainCore.Block = BFChainCore.Block> extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.QueryBlockReturnJSON> {
    someBlock?: SomeBlockModel<B>;
    toJSON(): BFChainCore.QueryBlockReturnJSON<B>;
}
export declare class NewBlockArgModel extends Message<NewBlockArgModel> implements BFChainCore.JSONToModelType<BFChainCore.NewBlockArgJSON> {
    static INC: number;
    height: number;
    signature: string;
    previousBlockSignature: string;
    timestamp: number;
    totalFee: string;
    numberOfTransactions: number;
    generatorPublicKeyBuffer: Uint8Array;
    get generatorPublicKey(): string;
    set generatorPublicKey(value: string);
    blockParticipation: string;
    toJSON(): {
        height: number;
        signature: string;
        previousBlockSignature: string;
        timestamp: number;
        totalFee: string;
        numberOfTransactions: number;
        generatorPublicKey: string;
        blockParticipation: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<NewBlockArgModel>): T;
}
export declare class NewBlockReturn extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.NewBlockReturnJSON> {
}
