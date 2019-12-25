import { TransactionFactory } from "./_txbase";
import { DAppTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * dapp 交易工厂
 *
 */
export declare class DAppTransactionFactory extends TransactionFactory<DAppTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 dapp 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "dappid" value 值必须是设定的值
     * dappid 必须存在，长度为 6 的字符串，只能是大写字母或数字
     * asset 是完整的 dapp 信息
     * 需要携带合法的 dappid
     * 需要携带合法的 dapp 所属链的名称,并且是本链
     * 需要携带合法的 dapp 所属链的网络标识符,并且是本链
     * 需要携带合法且存在的 dapp 类型
     * 如果是付费应用，如果没有携带指定合法的购买资产，则报错
     * 如果是免费应用，如果携带购买资产，则报错
     *
     * @param body
     * @param dappAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, dappAsset: BFChainCore.DAppAssetJSON, config?: ConfigHelper): void;
    verifyDAppAsset(dapp: BFChainCore.DAppJSON, config?: ConfigHelper): void;
    /**
     * 初始化 dapp 交易
     *
     * @param body
     * @param dappAsset
     */
    init(body: BFChainCore.TxBodyJSON, dappAsset: BFChainCore.DAppAssetJSON): DAppTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: DAppTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=dapp.d.ts.map