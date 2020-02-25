import { TransactionFactory } from "./_txbase";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { ToExchangeSpecialAssetTransaction } from "@bfchain/core-model";
export declare class ToExchangeSpecialAssetTransactionFactory extends TransactionFactory<ToExchangeSpecialAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON, config?: ConfigHelper): void;
    verifyExchangeSpecialAsset(toExchangeSpecialAsset: BFChainCore.ToExchangeSpecialAssetJSON): void;
    init(body: BFChainCore.TxBodyJSON, toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON): ToExchangeSpecialAssetTransaction;
    applyTransaction(transaction: ToExchangeSpecialAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
