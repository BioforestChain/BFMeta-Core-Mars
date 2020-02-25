import { TransactionFactory } from "./_txbase";
import { DestoryAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class DestoryAssetTransactionFactory extends TransactionFactory<DestoryAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, destoryAssetAsset: BFChainCore.DestoryAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, destoryAsset: BFChainCore.DestoryAssetAssetJSON): DestoryAssetTransaction;
    applyTransaction(transaction: DestoryAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
