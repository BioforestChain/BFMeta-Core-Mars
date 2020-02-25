import { TransactionFactory } from "@bfchain/core-transaction";
import { IssueSubchainTransaction } from "@bfchain/core-model";
import { TransactionHelper, AccountBaseHelper, BaseHelper, ConfigHelper, ConfigHelperMap, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
export declare class IssueSubchainTransactionFactory extends TransactionFactory<IssueSubchainTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private configMap;
    private moduleMap;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, configMap: ConfigHelperMap, moduleMap: ModuleStroge);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, issueSubchainAsset: BFChainCore.IssueSubchainAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, issueSubchain: BFChainCore.IssueSubchainAssetJSON): IssueSubchainTransaction;
    applyTransaction(transaction: IssueSubchainTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
