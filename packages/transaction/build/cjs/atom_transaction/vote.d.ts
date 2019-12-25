import { TransactionFactory } from "./_txbase";
import { VoteTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * vote 交易工厂
 *
 */
export declare class VoteTransactionFactory extends TransactionFactory<VoteTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 vote 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带生成投票的合法数据
     * asset 是完整的 vote 信息
     * 必须携带合法的投出权益数量
     *
     * @param body
     * @param voteAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, voteAsset: BFChainCore.VoteAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 vote 交易
     *
     * @param body
     * @param voteAsset
     */
    init(body: BFChainCore.TxBodyJSON, voteAsset: BFChainCore.VoteAssetJSON): VoteTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: VoteTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=vote.d.ts.map