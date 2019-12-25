import { TransactionFactory } from "./_txbase";
import { ToExchangeAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * toExchangeAsset 交易工厂
 *
 */
export declare class ToExchangeAssetTransactionFactory extends TransactionFactory<ToExchangeAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 toExchangeAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 不能携带交易的接收者账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 交易体的 range 不能包含交易的发起账户地址
     * asset 是完整的 toExchangeAsset 信息
     * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
     * 必须要携带合法的用于交换的资产的来源链网络标识符
     * 必须要携带合法的被交换的资产的来源链网络标识符
     * 必须要携带合法的用于交换的资产的来源链名
     * 必须要携带合法的被交换的资产的来源链名
     * 必须要携带合法的用于交换的资产名
     * 必须要携带合法的被交换的资产名
     * 必须要携带合法的用于交换的资产数量
     * 必须携带交换比例
     * 如果携带了开始交换高度间隔，这个高度间隔必须是自然数
     * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
     *
     * @param body
     * @param toExchangeAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, toExchangeAssetAsset: BFChainCore.ToExchangeAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 校验 toExchangeAsset 内容
     *
     * @param toExchangeAsset
     */
    verifyToExchangeAsset(toExchangeAsset: BFChainCore.ToExchangeAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 toExchangeAsset 交易
     *
     * @param body
     * @param toExchangeAsset
     */
    init(body: BFChainCore.TxBodyJSON, toExchangeAsset: BFChainCore.ToExchangeAssetAssetJSON): ToExchangeAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: ToExchangeAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=toExchangeAsset.d.ts.map