import { Message } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { SomeBlockModel } from "@bfchain/core-model-block";
/**
 * 查询区块的查询条件
 */
export declare class BlockQueryOptionsModel extends Message<BlockQueryOptionsModel> implements BFChainCore.JSONToModelType<BFChainCore.BlockQueryOptionsJSON> {
    id?: string;
    height?: number;
    toJSON(): object & {
        id: string | undefined;
        height: number | undefined;
    };
}
/**
 * 查询区块的传入参数
 */
export declare class QueryBlockArgModel extends Message<QueryBlockArgModel> implements BFChainCore.JSONToModelType<BFChainCore.QueryBlockArgJSON> {
    /**查询参数 */
    query: BlockQueryOptionsModel;
    toJSON(): {
        query: object & {
            id: string | undefined;
            height: number | undefined;
        };
    };
}
/**
 * 查询区块的返回结果
 */
export declare class QueryBlockReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.QueryBlockReturnJSON> {
    someBlock?: SomeBlockModel<any>;
    toJSON(): BFChainCore.QueryBlockReturnJSON;
}
/**
 * 广播区块的传入参数
 */
export declare class NewBlockArgModel extends Message<NewBlockArgModel> implements BFChainCore.JSONToModelType<BFChainCore.NewBlockArgJSON> {
    static INC: number;
    height: number;
    blockId: string;
    previousBlockId: string;
    timestamp: number;
    totalFee: string;
    numberOfTransactions: number;
    generatorPublicKeyBuffer: Uint8Array;
    get generatorPublicKey(): string;
    set generatorPublicKey(value: string);
    blockParticipation: string;
    toJSON(): {
        height: number;
        blockId: string;
        previousBlockId: string;
        timestamp: number;
        totalFee: string;
        numberOfTransactions: number;
        generatorPublicKey: string;
        blockParticipation: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<NewBlockArgModel>): T;
}
/**
 * 广播区块的返回结果
 */
export declare class NewBlockReturn extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.NewBlockReturnJSON> {
}
//# sourceMappingURL=block.chainChannel.model.d.ts.map