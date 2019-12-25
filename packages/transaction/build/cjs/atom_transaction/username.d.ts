import { TransactionFactory } from "./_txbase";
import { UsernameTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * username 交易工厂
 *
 */
export declare class UsernameTransactionFactory extends TransactionFactory<UsernameTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 username 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "alias" value 值必须是设定的值
     * asset 是完整的 username 信息
     * 用户名必须是 1-20 位 大小写字母、数字、下划线 1-20 组成的字符串
     * 用户名不能包含 ifmchain/bfchain
     * 必须携带设置用户名账户的公钥并且与发起账户公钥一致
     *
     * @param body
     * @param usernameAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, usernameAsset: BFChainCore.UsernameAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 username 交易
     *
     * @param body
     * @param usernameAsset
     */
    init(body: BFChainCore.TxBodyJSON, usernameAsset: BFChainCore.UsernameAssetJSON): UsernameTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: UsernameTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=username.d.ts.map