import { TransactionFactory } from "./_txbase";
import { SetLnsManagerTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class SetLnsManagerTransactionFactory extends TransactionFactory<SetLnsManagerTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, lnsManagerAsset: BFChainCore.SetLnsManagerAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, lnsManagerAsset: BFChainCore.SetLnsManagerAssetJSON): SetLnsManagerTransaction;
    applyTransaction(transaction: SetLnsManagerTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
