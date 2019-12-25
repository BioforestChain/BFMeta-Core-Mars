import { TransactionFactory } from "./_txbase";
import { TransferAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * transferAsset 交易工厂
 *
 */
export declare class TransferAssetTransactionFactory extends TransactionFactory<TransferAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 transferAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能和发起账户地址相等
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 transferAsset 信息
     * 需要携带合法的资产所属链名称
     * 需要携带合法的资产所属链的网络标识符
     * 需要携带合法的资产名称，并且不是链资产
     * 需要携带转出的资产数量，并且大于 0
     *
     * @param body
     * @param transferAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, transferAssetAsset: BFChainCore.TransferAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 transferAsset 交易
     *
     * @param body
     * @param transferAssetAsset
     */
    init(body: BFChainCore.TxBodyJSON, transferAssetAsset: BFChainCore.TransferAssetAssetJSON): TransferAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: TransferAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=transferAsset.d.ts.map