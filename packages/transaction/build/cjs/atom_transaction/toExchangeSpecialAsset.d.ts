import { TransactionFactory } from "./_txbase";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { ToExchangeSpecialAssetTransaction } from "@bfchain/core-model";
/**
 * toExchangeSpecialAsset 交易工厂
 *
 */
export declare class ToExchangeSpecialAssetTransactionFactory extends TransactionFactory<ToExchangeSpecialAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 beExchangeSpecialAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 不能携带交易的接收账户地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 交易体的 range 不能包含交易的发起账户地址
     * asset 是完整的 toExchangeSpecialAsset 信息
     * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
     * 必须携带用于交换的资产所属链的网络标识符
     * 必须携带用于交换的资产所属链名
     * 必须携带被交换的资产所属链的网络标识符
     * 必须携带被交换的资产所属链名
     * 必须携带合法的交换的资产类型
     * 必须携带合法的交换的方向
     * 如果是购买特殊资产：如果是购买 dappid，必须携带合法的 dappid；如果是购买 lns，必须携带合法的 lns
     * 如果是出售特殊资产：如果是出售 dappid，必须携带合法的 dappid；如果是出售 lns，必须携带合法的 lns
     * 必须携带合法的 出售得到/用于购买的 资产数量
     * 如果 发起特殊资产交换交易指定开始交换的区块高度间隔，则必须携带这个值
     * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
     *
     * @param body
     * @param toExchangeSpecialAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON, config?: ConfigHelper): void;
    verifyExchangeSpecialAsset(toExchangeSpecialAsset: BFChainCore.ToExchangeSpecialAssetJSON): void;
    /**
     * 初始化 toExchangeSpecialAsset 交易
     *
     * @param body
     * @param toExchangeSpecialAssetAsset
     */
    init(body: BFChainCore.TxBodyJSON, toExchangeSpecialAssetAsset: BFChainCore.ToExchangeSpecialAssetAssetJSON): ToExchangeSpecialAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: ToExchangeSpecialAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=toExchangeSpecialAsset.d.ts.map