import { TransactionFactory } from "./_txbase";
import { EmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * emigrateAsset 交易工厂
 *
 */
export declare class EmigrateAssetTransactionFactory extends TransactionFactory<EmigrateAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 emigrateAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带生成资产迁出交易的合法数据
     * 需要携带合法的资产所属链名称,并且是本链
     * 需要携带合法的资产所属链的网络标识符,并且是本链
     * 需要携带合法的资产名称，并且是链资产
     * 需要携带迁出的资产数量，并且大于 0
     * 必须携带合法的可验证的本链创世账户的签名和二次签名(创世账户的公钥+签名)
     *
     * @param body
     * @param emigrateAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, emigrateAssetAsset: BFChainCore.EmigrateAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 emigrateAsset 交易
     *
     * @param body
     * @param emigrateAssetAsset
     */
    init(body: BFChainCore.TxBodyJSON, emigrateAssetAsset: BFChainCore.EmigrateAssetAssetJSON): EmigrateAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: EmigrateAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=emigrateAsset.d.ts.map