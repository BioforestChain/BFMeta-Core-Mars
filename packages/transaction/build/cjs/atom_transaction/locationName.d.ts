import { TransactionFactory } from "./_txbase";
import { LocationNameTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * locationName 交易工厂
 *
 */
export declare class LocationNameTransactionFactory extends TransactionFactory<LocationNameTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 locationName 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "name" value 值必须是设定的值
     * asset 是完整的 locationName
     * 必须携带合法的链域名：是一个字符串；长度要大于 2，最大不超过 1024；不能以 . 开头或结尾；一级域名只能是小写字母组成；
     * 多级域名首字母只能是大小写字母，其他部分可以是数字；每级域名的长度最大为 128，根域名只能是本链链名
     * 必须携带合法的所属链名,并且是本链
     * 必须携带合法的所属链网络标识符,并且是本链
     * 必须携带合法的链域名操作类型
     *
     * @param body
     * @param locationName
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, locationNameAsset: BFChainCore.LocationNameAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 locationName 交易
     *
     * @param body
     * @param locationName
     */
    init(body: BFChainCore.TxBodyJSON, locationName: BFChainCore.LocationNameAssetJSON): LocationNameTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: LocationNameTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=locationName.d.ts.map