import { Message } from "@bfchain/protobuf";
import { Transaction } from "@bfchain/core-model-transaction-base";
import { SomeTransactionModel } from "./someTransaction";
export declare enum TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE {
    SENDER = 0,
    /**
     * 现在`recipient`是一个数组，这里应该说是`1+`的正整数
     */
    RECIPIENT = 1
}
export declare class TransactionAssetChangeModel extends Message implements BFChainUtil.JSONAble<BFChainCore.TransactionAssetChangeJSON> {
    static INC: number;
    /**账户类型 */
    accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
    /**资产编号 */
    assetTypes: number;
    /**交易校验完成后账户持有的资产余额 */
    assetBalance: string;
    toJSON(): {
        accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
        assetTypes: number;
        assetBalance: string;
    };
    getBytes(): Uint8Array;
}
/**交易与其在区块中的下标 */
export declare class TransactionInBlock<T extends Transaction = Transaction> extends SomeTransactionModel<T> {
    /**交易在区块内的索引 */
    index: number;
    /**交易所属的区块高度 */
    height: number;
    /**交易验证完成后账户变动 */
    transactionAssetChanges: TransactionAssetChangeModel[];
    /**区块锻造者的签名 */
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
//# sourceMappingURL=transactionInBlock.d.ts.map