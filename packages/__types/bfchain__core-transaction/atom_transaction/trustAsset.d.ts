import { TransactionFactory } from "./_txbase";
import { TrustAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class TrustAssetTransactionFactory extends TransactionFactory<TrustAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, trustAssetAsset: BFChainCore.TrustAssetAssetJSON, config?: ConfigHelper): void;
    verifyTrustAsset(trustAsset: BFChainCore.TrustAssetJSON): void;
    init(body: BFChainCore.TxBodyJSON, trustAssetAsset: BFChainCore.TrustAssetAssetJSON): TrustAssetTransaction;
    applyTransaction(transaction: TrustAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
