import { TransactionFactory } from "./_txbase";
import { AcceptVoteTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class AcceptVoteTransactionFactory extends TransactionFactory<AcceptVoteTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, acceptVoteAsset: BFChainCore.AcceptVoteAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, acceptVoteAsset: BFChainCore.AcceptVoteAssetJSON): AcceptVoteTransaction;
    applyTransaction(transaction: AcceptVoteTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
