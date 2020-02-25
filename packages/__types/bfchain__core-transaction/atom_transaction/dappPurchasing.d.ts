import { TransactionFactory } from "./_txbase";
import { DAppPurchasingTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { DAppTransactionFactory } from "./dapp";
export declare class DAppPurchasingTransactionFactory extends TransactionFactory<DAppPurchasingTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private dappTransactionFactory;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, dappTransactionFactory: DAppTransactionFactory);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, dappPurchasingAsset: BFChainCore.DAppPurchasingAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, dappPurchasingAsset: BFChainCore.DAppPurchasingAssetJSON): DAppPurchasingTransaction;
    applyTransaction(transaction: DAppPurchasingTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
