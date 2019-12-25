import { TransactionFactory } from "./_txbase";
import { RejectVoteTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * rejectVote 交易工厂
 *
 */
export declare class RejectVoteTransactionFactory extends TransactionFactory<RejectVoteTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 rejectVote 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     *
     * @param body
     * @param rejectVoteAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, rejectVoteAsset: BFChainCore.RejectVoteAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 rejectVote 交易
     *
     * @param body
     * @param rejectVoteAsset
     */
    init(body: BFChainCore.TxBodyJSON, rejectVoteAsset: BFChainCore.RejectVoteAssetJSON): RejectVoteTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: RejectVoteTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=rejectVote.d.ts.map