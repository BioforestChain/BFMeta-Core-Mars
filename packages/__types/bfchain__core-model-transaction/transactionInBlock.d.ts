import { Message } from "@bfchain/protobuf";
import type { Transaction } from "@bfchain/core-model-transaction-base";
import { SomeTransactionModel } from "./someTransaction";
export declare enum TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE {
    SENDER = 0,
    RECIPIENT = 1
}
export declare class TransactionAssetChangeModel extends Message implements BFChainUtil.JSONAble<BFChainCore.TransactionAssetChangeJSON> {
    static INC: number;
    accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
    assetTypes: number;
    assetBalance: string;
    toJSON(): {
        accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
        assetTypes: number;
        assetBalance: string;
    };
    getBytes(): Uint8Array;
}
export declare class TransactionInBlock<T extends Transaction = Transaction> extends SomeTransactionModel<T> {
    index: number;
    height: number;
    transactionAssetChanges: TransactionAssetChangeModel[];
    signatureBuffer: Uint8Array;
    get signature(): string;
    set signature(value: string);
    getBytes(skipSignature?: boolean): Uint8Array;
    toJSON(): {
        index: number;
        height: number;
        transactionAssetChanges: {
            accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
            assetTypes: number;
            assetBalance: string;
        }[];
        signature: string;
    } & {
        transaction: BFChainUtil.ToJSONType<T>;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<TransactionInBlock>): T;
}
