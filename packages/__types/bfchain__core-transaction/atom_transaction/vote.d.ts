import { TransactionFactory } from "./_txbase";
import { VoteTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class VoteTransactionFactory extends TransactionFactory<VoteTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, voteAsset: BFChainCore.VoteAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, voteAsset: BFChainCore.VoteAssetJSON): VoteTransaction;
    applyTransaction(transaction: VoteTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
