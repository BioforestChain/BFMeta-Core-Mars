import { TransactionFactory } from "./_txbase";
import { IssueAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * issueAsset 交易工厂
 *
 */
export declare class IssueAssetTransactionFactory extends TransactionFactory<IssueAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 issueAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能是交易的发起账户地址，并且是数字资产的创世账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 issueAsset 信息
     * 需要携带合法的资产所属链名称,并且是本链
     * 需要携带合法的资产所属链的网络标识符,并且是本链
     * 需要携带合法的资产缩写：3-5 位 大小写字母组成的字符串
     * 需要携带合法的预计发行资产信息
     * 需要携带合法的资产创世账户地址
     * 资产的创世账户地址不能是交易的发起账户
     * 资产的创世账户地址必须和交易的接收账户地址一致
     *
     * @param body
     * @param issueAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, issueAssetAsset: BFChainCore.IssueAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 issueAsset 交易
     *
     * @param body
     * @param issueAsset
     */
    init(body: BFChainCore.TxBodyJSON, issueAsset: BFChainCore.IssueAssetAssetJSON): IssueAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: IssueAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=issueAsset.d.ts.map