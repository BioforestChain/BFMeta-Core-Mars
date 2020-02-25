import { TransactionFactory } from "./_txbase";
import { ToExchangeSpecialAssetTransactionFactory } from "./toExchangeSpecialAsset";
import { BeExchangeSpecialAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper, JSBIHelper } from "@bfchain/core-helper";
export declare class BeExchangeSpecialAssetTransactionFactory extends TransactionFactory<BeExchangeSpecialAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    jsbiHelper: JSBIHelper;
    toExchangeSpecialAssetTransactionFactory: ToExchangeSpecialAssetTransactionFactory;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, jsbiHelper: JSBIHelper, toExchangeSpecialAssetTransactionFactory: ToExchangeSpecialAssetTransactionFactory);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, beExchangeSpecialAssetAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON): BeExchangeSpecialAssetTransaction;
    applyTransaction(transaction: BeExchangeSpecialAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
