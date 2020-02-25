import { Message } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { TransactionBaseStorageModel, TransactionInBlock, SomeTransactionModel } from "@bfchain/core-model-transaction";
import { NewTransactionRefuseReason, NewTransactionStatus } from "./constants";
export declare class TransactionQueryOptions extends Message<TransactionQueryOptions> implements BFChainCore.JSONToModelType<BFChainCore.TransactionQueryOptionsJSON> {
    static INC: number;
    type?: string;
    signatureBuffer?: Uint8Array;
    get signature(): string | undefined;
    set signature(value: string | undefined);
    senderId?: string;
    recipientId?: string;
    minHeight?: number;
    blockSignature?: string;
    maxHeight?: number;
    storage?: TransactionBaseStorageModel;
    trusteeId?: string;
    purchaseDAppid?: string;
    dappid?: string;
    lns?: string;
    offset: number;
    limit?: number;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<TransactionQueryOptions>): T;
    toJSON(): {
        type: string | undefined;
        signature: string | undefined;
        senderId: string | undefined;
        recipientId: string | undefined;
        minHeight: number | undefined;
        blockSignature: string | undefined;
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
export declare class TransactionSortOptions extends Message<TransactionSortOptions> implements BFChainCore.JSONToModelType<BFChainCore.TransactionSortOptionsJSON> {
    static INC: number;
    index?: -1 | 1;
    height?: -1 | 1;
    toJSON(): {
        index: 1 | -1 | undefined;
        height: 1 | -1 | undefined;
    };
}
export declare class QueryTransactionArgModel extends Message<QueryTransactionArgModel> implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionArgJSON> {
    query: TransactionQueryOptions;
    sort: TransactionSortOptions;
    toJSON(): {
        query: TransactionQueryOptions;
        sort: TransactionSortOptions;
    };
}
export declare class QueryTransactionReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionReturnJSON> {
    transactions: TransactionInBlock[];
    toJSON(): {
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
    } & BFChainCore.CommonResponseJSON;
}
export declare class NewTransactionArgModel extends SomeTransactionModel implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionArgJSON> {
    grabSecret?: string;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<NewTransactionArgModel>): T;
}
export declare class NewTransactionReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionReturnJSON> {
    newTrsStatus: NewTransactionStatus;
    minFee: string;
    refuseReason?: NewTransactionRefuseReason;
    toJSON(): BFChainCore.NewTransactionReturnJSON;
}
