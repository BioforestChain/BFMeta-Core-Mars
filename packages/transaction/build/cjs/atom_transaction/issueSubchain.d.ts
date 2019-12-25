import { TransactionFactory } from "./_txbase";
import { IssueSubchainTransaction } from "@bfchain/core-model";
import { TransactionHelper, AccountBaseHelper, BaseHelper, ConfigHelper, ConfigHelperMap, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { ModuleStroge } from "@bfchain/util";
/**
 * issueSubchain 交易工厂
 *
 */
export declare class IssueSubchainTransactionFactory extends TransactionFactory<IssueSubchainTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private configMap;
    private moduleMap;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, configMap: ConfigHelperMap, moduleMap: ModuleStroge);
    /**
     * 校验输入信息
     * 要验证 issueSubchain 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且是 dapp 的拥有者地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     *  key 值必须是 "magic" value 值必须是设定的值
     * asset 是完整的 issueSubchain 信息
     * 需要携带子链名称：3-20 位 大小写字母或数字组成的字符串
     * 需要携带子链名称缩写：3-5 位 大写字母组成的字符串
     * 需要携带子链的网络标识符：1-16 位 大写字母或数字组成的字符串
     * 需要携带已知的子链的网络识别码 b/c
     * 需要携带子链的创世时间：自然数
     * 需要携带子链的父链的创世节点地址：字符串
     * 需要携带子链的创世节点地址：字符串
     * 需要携带子链的创世账户初始余额：数字组成的字符串
     * 需要携带子链的每字节手续费：浮点数
     * 需要携带子链的每个区块最大交易量：正整数
     * 需要携带子链的每个账户每个区块最大交易量：正整数
     * 需要携带子链的最大区块长度：正整数
     * 需要携带子链的每个区块最大的 tps：正整数
     * 需要携带子链的最大的交易字节数：正整数
     * 需要携带子链的最大区块 remark 字节数：正整数
     * 需要携带子链的区块不同数量大于某个值时同步前需要先共识的：正整数
     * 需要携带子链的每轮可处理的受托人交易数量：正整数
     * 需要携带子链的发行资产最小的持有本链资产数量：数字组成的字符串
     * 需要携带子链的发行子链最小的持有本链资产数量：数字组成的字符串
     * 需要携带子链的链资产和数字资产的兑换比例：正整数
     * 需要携带子链的链资产和子链资产的兑换比例：正整数
     * 需要携带子链的链资产的奖励权重：正整数
     * 需要携带子链的交易量的奖励权重：正整数
     * 需要携带子链的交易的发起高度和确认高度最大的区块高度间隔：正整数
     * 需要携带子链的每轮的区块数量：正整数
     * 需要携带子链的创世受托人数量：正整数
     * 需要携带子链的区块时间间隔：正整数
     * 需要携带子链的奖励比例：包含打块奖励占比和投票奖励占比，总和为 1
     * 需要携带子链的端口号：包含 默认端口号和节点扫描端口号 1-65535
     * 需要携带子链的奖励里程：包含区块高度数组和奖励数组，奖励数组比高度数组的长度大 1，区块数组中下一个值必须比上一个值大
     * 需要携带子链的父链信息：包含父链的网络标识符、父链的链域名、父链的资产名、父链的链域名
     * 需要携带子链的创世块：子链生成的创世块
     * 验证创世块信息是否合法
     *
     * @param body
     * @param issueSubchainAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, issueSubchainAsset: BFChainCore.IssueSubchainAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 issueSubchain 交易
     *
     * @param body
     * @param issueSubchain
     */
    init(body: BFChainCore.TxBodyJSON, issueSubchain: BFChainCore.IssueSubchainAssetJSON): IssueSubchainTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: IssueSubchainTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=issueSubchain.d.ts.map