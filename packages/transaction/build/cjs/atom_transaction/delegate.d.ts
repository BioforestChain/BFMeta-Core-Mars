import { TransactionFactory } from "./_txbase";
import { DelegateTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * delegate 交易工厂
 *
 */
export declare class DelegateTransactionFactory extends TransactionFactory<DelegateTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 delegate 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "username" value 值必须是设定的值
     * asset 是完整的 delegate 信息
     * 需要携带合法的账户名
     * 需要携带合法的账户公钥，且与发起账户公钥相等
     *
     * @param body
     * @param delegateAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, delegateAsset: BFChainCore.DelegateAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 delegate 交易
     *
     * @param body
     * @param delegateAsset
     */
    init(body: BFChainCore.TxBodyJSON, delegateAsset: BFChainCore.DelegateAssetJSON): DelegateTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: DelegateTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=delegate.d.ts.map