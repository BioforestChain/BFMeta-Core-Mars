import { TransactionFactory } from "./_txbase";
import { TrustAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * trustAsset 交易工厂
 *
 */
export declare class TrustAssetTransactionFactory extends TransactionFactory<TrustAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 trustAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 trust amount 的接收人)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 trustAsset 信息
     * 必须携带委托账户：合法的账户地址组成的数组，长度大于 0，不能包含发起账户
     * 必须携带签收交易需要的委托人签名数量 n，n 不能大于最大签名数量(max = 发起账户 + 接收账户 + 委托账户)，最小为 1
     * 如果携带开始抢的区块间隔，这个间隔必须是正整数
     * 必须携带合法的委托的数字资产所属链名
     * 必须携带合法的委托的数字资产所属链网络标识符
     * 必须携带合法的委托的数字资产名
     * 必须携带合法的委托的数字资产数量，并且大于 0
     * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
     *
     * @param body
     * @param trustAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, trustAssetAsset: BFChainCore.TrustAssetAssetJSON, config?: ConfigHelper): void;
    verifyTrustAsset(trustAsset: BFChainCore.TrustAssetJSON): void;
    /**
     * 初始化 trustAsset 交易
     *
     * @param body
     * @param trustAssetAsset
     */
    init(body: BFChainCore.TxBodyJSON, trustAssetAsset: BFChainCore.TrustAssetAssetJSON): TrustAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: TrustAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=trustAsset.d.ts.map