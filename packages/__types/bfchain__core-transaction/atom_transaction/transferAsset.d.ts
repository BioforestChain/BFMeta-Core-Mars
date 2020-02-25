import { TransactionFactory } from "./_txbase";
import { TransferAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class TransferAssetTransactionFactory extends TransactionFactory<TransferAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, transferAssetAsset: BFChainCore.TransferAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, transferAssetAsset: BFChainCore.TransferAssetAssetJSON): TransferAssetTransaction;
    applyTransaction(transaction: TransferAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
