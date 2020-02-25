import { TransactionFactory } from "./_txbase";
import { BeExchangeAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, JSBIHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { ToExchangeAssetTransactionFactory } from "./toExchangeAsset";
export declare class BeExchangeAssetTransactionFactory extends TransactionFactory<BeExchangeAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    jsbiHelper: JSBIHelper;
    toExchangeAssetTransactionFactory: ToExchangeAssetTransactionFactory;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, jsbiHelper: JSBIHelper, toExchangeAssetTransactionFactory: ToExchangeAssetTransactionFactory);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, beExchangeAssetAsset: BFChainCore.BeExchangeAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, beExchangeAsset: BFChainCore.BeExchangeAssetAssetJSON): BeExchangeAssetTransaction;
    applyTransaction(transaction: BeExchangeAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
