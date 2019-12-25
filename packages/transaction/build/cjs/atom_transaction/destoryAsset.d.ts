import { TransactionFactory } from "./_txbase";
import { DestoryAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * destoryAsset 交易工厂
 *
 */
export declare class DestoryAssetTransactionFactory extends TransactionFactory<DestoryAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 destoryAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 destoryAsset 信息
     * 需要携带合法的资产所属链名称,并且是本链
     * 需要携带合法的资产所属链的网络标识符,并且是本链
     * 需要携带合法的资产名称，并且不是链资产
     * 需要携带销毁的资产数量，并且大于 0
     *
     *
     * @param body
     * @param destoryAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, destoryAssetAsset: BFChainCore.DestoryAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 destoryAsset 交易
     *
     * @param body
     * @param destoryAsset
     */
    init(body: BFChainCore.TxBodyJSON, destoryAsset: BFChainCore.DestoryAssetAssetJSON): DestoryAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: DestoryAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=destoryAsset.d.ts.map