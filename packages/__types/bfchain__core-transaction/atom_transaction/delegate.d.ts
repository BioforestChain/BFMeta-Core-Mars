import { TransactionFactory } from "./_txbase";
import { DelegateTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class DelegateTransactionFactory extends TransactionFactory<DelegateTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, delegateAsset: BFChainCore.DelegateAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, delegateAsset: BFChainCore.DelegateAssetJSON): DelegateTransaction;
    applyTransaction(transaction: DelegateTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
