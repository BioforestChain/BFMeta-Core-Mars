import { TransactionFactory } from "./_txbase";
import { UsernameTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class UsernameTransactionFactory extends TransactionFactory<UsernameTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, usernameAsset: BFChainCore.UsernameAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, usernameAsset: BFChainCore.UsernameAssetJSON): UsernameTransaction;
    applyTransaction(transaction: UsernameTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
