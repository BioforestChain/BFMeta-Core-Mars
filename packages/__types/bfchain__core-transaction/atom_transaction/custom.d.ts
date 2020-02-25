import { TransactionFactory } from "./_txbase";
import { CustomTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { CustomTransactionEvent } from "./custom.event";
export declare class CustomTransactionFactory extends TransactionFactory<CustomTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    customTransactionEvent: CustomTransactionEvent;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, customTransactionEvent: CustomTransactionEvent);
    customTransactionCenter?: BFChainCore.CustomTrCenterInterface;
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, customAsset: BFChainCore.CustomAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, customAsset: BFChainCore.CustomAssetJSON): CustomTransaction;
    applyTransaction(transaction: CustomTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter): any[] | Promise<any[]>;
}
