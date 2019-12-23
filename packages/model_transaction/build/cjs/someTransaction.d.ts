import { Transaction } from "@bfchain/core-model-transaction-base";
import { Message } from "@bfchain/protobuf";
export declare enum TRANSACTION_TYPES_BASE {
    SIGNATURE = "BSE-01",
    DELEGATE = "BSE-02",
    VOTE = "BSE-03",
    USERNAME = "BSE-04",
    ACCEPT_VOTE = "BSE-05",
    REJECT_VOTE = "BSE-06",
    DAPP = "WOD-00",
    DAPP_PURCHASING = "WOD-01",
    ISSUE_SUBCHAIN = "WOD-02",
    MARK = "EXT-00",
    ISSUE_ASSET = "AST-00",
    TRANSFER_ASSET = "AST-01",
    DESTORY_ASSET = "AST-02",
    GIFT_ASSET = "AST-03",
    GRAB_ASSET = "AST-04",
    TRUST_ASSET = "AST-05",
    SIGN_FOR_ASSET = "AST-06",
    EMIGRATE_ASSET = "AST-07",
    IMMIGRATE_ASSET = "AST-08",
    TO_EXCHANGE_ASSET = "AST-09",
    BE_EXCHANGE_ASSET = "AST-10",
    TO_EXCHANGE_SPECIAL_ASSET = "AST-11",
    BE_EXCHANGE_SPECIAL_ASSET = "AST-12",
    LOCATION_NAME = "LNS-00",
    SET_LNS_RECORD_VALUE = "LNS-01",
    SET_LNS_MANAGER = "LNS-02",
    CUSTOM = "CUS-00"
}
/**
 * K : TRANSACTION_TYPES_BASE KEY
 * V : TRANSACTION_TYPES_BASE VALUE
 * M : TransactionModelConstructror
 * F : TransactionFactoryConstructror
 */
export declare const TRANSACTION_TYPES_MAP: {
    VK: Map<TRANSACTION_TYPES_BASE, string>;
    KV: Map<string, TRANSACTION_TYPES_BASE>;
    VM: Map<TRANSACTION_TYPES_BASE, typeof Transaction>;
    MV: Map<typeof Transaction, TRANSACTION_TYPES_BASE>;
    trsTypeToV(type: string): TRANSACTION_TYPES_BASE;
};
export declare class SomeTransactionModel<T extends BFChainCore.Transaction = BFChainCore.Transaction> extends Message<SomeTransactionModel<T>> implements BFChainCore.SomeTransactionJSON<T> {
    static INC: number;
    protected _trs_base_type: TRANSACTION_TYPES_BASE;
    protected _trs_bytes: Uint8Array;
    get transaction(): T;
    set transaction(trs: T);
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<SomeTransactionModel>): T;
    toJSON(): {
        transaction: BFChainUtil.ToJSONType<T>;
    };
}
//# sourceMappingURL=someTransaction.d.ts.map