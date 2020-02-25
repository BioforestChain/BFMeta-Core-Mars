import { TransactionFactory } from "./_txbase";
import { DAppTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class DAppTransactionFactory extends TransactionFactory<DAppTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, dappAsset: BFChainCore.DAppAssetJSON, config?: ConfigHelper): void;
    verifyDAppAsset(dapp: BFChainCore.DAppJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, dappAsset: BFChainCore.DAppAssetJSON): DAppTransaction;
    applyTransaction(transaction: DAppTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
