import { Message } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { TransactionBaseStorageModel, TransactionInBlock, SomeTransactionModel } from "@bfchain/core-model-transaction";
import { NewTransactionRefuseReason, NewTransactionStatus } from "./constants";
/**
 * 查询交易的查询条件
 */
export declare class TransactionQueryOptions extends Message<TransactionQueryOptions> implements BFChainCore.JSONToModelType<BFChainCore.TransactionQueryOptionsJSON> {
    static INC: number;
    /**交易类型 */
    type?: string;
    /**交易唯一编号 */
    signatureBuffer?: Uint8Array;
    get signature(): string | undefined;
    set signature(value: string | undefined);
    /**交易发送者地址 */
    senderId?: string;
    /**交易接收者地址 */
    recipientId?: string;
    /**查询的区块的最小高度 */
    minHeight?: number;
    /**查询的区块的ID */
    blockId?: string;
    /**查询的区块的最大高度 */
    maxHeight?: number;
    /**自定义索引 */
    storage?: TransactionBaseStorageModel;
    /**交易见证者地址 */
    trusteeId?: string;
    /**购买的 dappid */
    purchaseDAppid?: string;
    /**交易来源的 dappid */
    dappid?: string;
    /**交易来源的 lns */
    lns?: string;
    /**查询结果分页：起始下标 */
    offset: number;
    /**查询结果分页：返回数量， */
    limit?: number;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<TransactionQueryOptions>): T;
    toJSON(): {
        type: string | undefined;
        signature: string | undefined;
        senderId: string | undefined;
        recipientId: string | undefined;
        minHeight: number | undefined;
        blockId: string | undefined;
        maxHeight: number | undefined;
        storage: TransactionBaseStorageModel | undefined;
        trusteeId: string | undefined;
        purchaseDAppid: string | undefined;
        dappid: string | undefined;
        lns: string | undefined;
        offset: number;
        limit: number | undefined;
    };
}
/**
 * 查询交易的排序条件
 */
export declare class TransactionSortOptions extends Message<TransactionSortOptions> implements BFChainCore.JSONToModelType<BFChainCore.TransactionSortOptionsJSON> {
    static INC: number;
    /**根据交易的下标索引排序 */
    index?: -1 | 1;
    /**根据区块高度排序 */
    height?: -1 | 1;
    toJSON(): {
        index: 1 | -1 | undefined;
        height: 1 | -1 | undefined;
    };
}
/**
 * 查询交易的传入参数
 */
export declare class QueryTransactionArgModel extends Message<QueryTransactionArgModel> implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionArgJSON> {
    /**查询参数 */
    query: TransactionQueryOptions;
    /**排序参数 */
    sort: TransactionSortOptions;
    toJSON(): {
        query: TransactionQueryOptions;
        sort: TransactionSortOptions;
    };
}
/**
 * 查询交易的返回值
 * 可能的错误：查询参数有误
 */
export declare class QueryTransactionReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionReturnJSON> {
    /**查询到的交易 */
    transactions: TransactionInBlock[];
    toJSON(): BFChainCore.CommonResponseJSON & {
        transactions: ({
            index: number;
            height: number;
            transactionAssetChanges: {
                accountType: import("@bfchain/core-model-transaction").TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
                assetTypes: number;
                assetBalance: string;
            }[];
            signature: string;
        } & {
            transaction: BFChainCore.TransactionJSON<object>;
        })[];
    };
}
/**
 * 广播交易的传入参数
 */
export declare class NewTransactionArgModel extends SomeTransactionModel implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionArgJSON> {
    /**红包的密码 */
    grabSecret?: string;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<NewTransactionArgModel>): T;
}
/**
 * 广播交易的返回值
 * 可能的错误：交易验证不通过，或者手续费不足，或者已经超出可处理的时间段
 */
export declare class NewTransactionReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionReturnJSON> {
    /**交易的接收状态 */
    newTrsStatus: NewTransactionStatus;
    /**最低手续费 */
    minFee: string;
    /**最低手续费 */
    refuseReason?: NewTransactionRefuseReason;
    toJSON(): BFChainCore.CommonResponseJSON & {
        newTrsStatus: NewTransactionStatus;
        minFee: string;
        refuseReason: NewTransactionRefuseReason | undefined;
    };
}
//# sourceMappingURL=transaction.chainChannel.model.d.ts.map