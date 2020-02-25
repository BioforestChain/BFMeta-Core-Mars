import { TransactionFactory } from "./_txbase";
import { RejectVoteTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class RejectVoteTransactionFactory extends TransactionFactory<RejectVoteTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, rejectVoteAsset: BFChainCore.RejectVoteAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, rejectVoteAsset: BFChainCore.RejectVoteAssetJSON): RejectVoteTransaction;
    applyTransaction(transaction: RejectVoteTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
