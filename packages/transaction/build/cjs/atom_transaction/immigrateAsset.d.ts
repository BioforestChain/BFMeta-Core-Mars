import { TransactionFactory } from "./_txbase";
import { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper, ConfigHelperMap } from "@bfchain/core-helper";
import { EmigrateAssetTransactionFactory } from "./emigrateAsset";
/**
 * immigrateAsset 交易工厂
 *
 */
export declare class ImmigrateAssetTransactionFactory extends TransactionFactory<ImmigrateAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private emigrateAssetTransactionFactory;
    private configMap;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, emigrateAssetTransactionFactory: EmigrateAssetTransactionFactory, configMap: ConfigHelperMap);
    /**
     * 校验输入信息
     * 要验证 immigrateAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 必须是 emigrateAsset 的签名
     * 必须携带生成资产迁入交易的合法数据
     * 必须携带完整的可验证的 资产迁出 交易
     * 必须携带合法的可验证的本链创世受托人的签名和二次签名
     *
     * @param body
     * @param migrateAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, immigrateAssetAsset: BFChainCore.ImmigrateAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 immigrateAsset 交易
     *
     * @param body
     * @param immigrateAssetAsset
     */
    init(body: BFChainCore.TxBodyJSON, immigrateAssetAsset: BFChainCore.ImmigrateAssetAssetJSON): ImmigrateAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: ImmigrateAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=immigrateAsset.d.ts.map