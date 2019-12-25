import { TransactionFactory } from "./_txbase";
import { SetLnsManagerTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * setLnsManager 交易工厂
 *
 */
export declare class SetLnsManagerTransactionFactory extends TransactionFactory<SetLnsManagerTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 lnsManager 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能和发起账户地址相等(是新的管理员账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     *  key 值必须是 "name" value 值必须是设定的值
     * asset 是完整的 lnsManager 信息
     * 必须携带合法的欲设置管理员的链域名
     * 必须携带合法的欲设置管理员的链域名所属链的名称
     * 必须携带合法的欲设置管理员的链域名所属链的网络标识符
     * 必须携带合法的新的管理员账户地址
     * 新的管理员账户地址和交易的接收者必须相等
     *
     * @param body
     * @param setLnsManagerAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, lnsManagerAsset: BFChainCore.SetLnsManagerAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 setLnsManager 交易
     *
     * @param body
     * @param setLnsManagerAsset
     */
    init(body: BFChainCore.TxBodyJSON, lnsManagerAsset: BFChainCore.SetLnsManagerAssetJSON): SetLnsManagerTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: SetLnsManagerTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=setLnsManager.d.ts.map