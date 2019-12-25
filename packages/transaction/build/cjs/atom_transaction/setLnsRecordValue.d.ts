import { TransactionFactory } from "./_txbase";
import { SetLnsRecordValueTransaction, SetLnsRecordValueAssetModel } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * setLnsRecordValue 交易工厂
 *
 */
export declare class SetLnsRecordValueTransactionFactory extends TransactionFactory<SetLnsRecordValueTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 lnsRecordValue 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "name" value 欲设置解析值的链域名
     * asset 是完整的 lnsRecordValue 信息
     * 必须携带合法的欲设置解析值的链域名
     * 必须携带合法的欲设置解析值的链域名所属链的名称
     * 必须携带合法的欲设置解析值的链域名所属链的网络标识符
     * 必须携带合法且存在的解析类型
     * 必须携带合法的新的解析值
     *
     * @param body
     * @param setLnsRecordValueAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, lnsRecordValueAsset: SetLnsRecordValueAssetModel, config?: ConfigHelper): void;
    /**
     * 校验解析值是否合法
     *
     * @param record
     */
    checkLocationNameRecord(record: BFChainCore.LocationNameRecordJSON): void;
    /**
     * 初始化 setLnsRecordValue 交易
     *
     * @param body
     * @param setLnsRecordValueAsset
     */
    init(body: BFChainCore.TxBodyJSON, lnsRecordValueAsset: BFChainCore.SetLnsRecordValueAssetJSON): SetLnsRecordValueTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: SetLnsRecordValueTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=setLnsRecordValue.d.ts.map