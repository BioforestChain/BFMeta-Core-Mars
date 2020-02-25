import { TransactionFactory } from "./_txbase";
import { ToExchangeAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class ToExchangeAssetTransactionFactory extends TransactionFactory<ToExchangeAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, toExchangeAssetAsset: BFChainCore.ToExchangeAssetAssetJSON, config?: ConfigHelper): void;
    verifyToExchangeAsset(toExchangeAsset: BFChainCore.ToExchangeAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, toExchangeAsset: BFChainCore.ToExchangeAssetAssetJSON): ToExchangeAssetTransaction;
    applyTransaction(transaction: ToExchangeAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
