import { TransactionFactory } from "./_txbase";
import { GiftAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class GiftAssetTransactionFactory extends TransactionFactory<GiftAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, giftAssetAsset: BFChainCore.GiftAssetAssetJSON, config?: ConfigHelper): void;
    verifyGiftAsset(giftAsset: BFChainCore.GiftAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, giftAsset: BFChainCore.GiftAssetAssetJSON): GiftAssetTransaction;
    applyTransaction(transaction: GiftAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
