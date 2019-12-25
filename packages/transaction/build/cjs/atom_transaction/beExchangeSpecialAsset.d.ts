import { TransactionFactory } from "./_txbase";
import { ToExchangeSpecialAssetTransactionFactory } from "./toExchangeSpecialAsset";
import { BeExchangeSpecialAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper, JSBIHelper } from "@bfchain/core-helper";
/**
 * beExchangeSpecialAsset 交易工厂
 *
 */
export declare class BeExchangeSpecialAssetTransactionFactory extends TransactionFactory<BeExchangeSpecialAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    jsbiHelper: JSBIHelper;
    toExchangeSpecialAssetTransactionFactory: ToExchangeSpecialAssetTransactionFactory;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, jsbiHelper: JSBIHelper, toExchangeSpecialAssetTransactionFactory: ToExchangeSpecialAssetTransactionFactory);
    /**
     * 校验输入信息
     * 要验证 beExchangeSpecialAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 toExchangeSpecialAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用索引存储
     * key 值必须是 "transactionSignature"，value 必须是 申请特殊资产交换交易 的签名
     * 必须携带生成接收特殊资产交换交易的合法数据
     * 必须携带 申请特殊资产交换交易 的签名
     * 必须携带 申请特殊资产交换交易 的发起交易高度
     * 如果 申请特殊资产交换交易 有指定开始交易高度间隔，则必须携带则个值
     * 如果 申请特殊资产交换交易 有指定交易的有效区块高度，则必须携带这个值
     * 必须携带 申请特殊资产交换交易 的 接收范围类型 rangeType
     * 必须携带 申请特殊资产交换交易 的 接收范围 range
     *  如果 range 长度大于 0
     *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
     *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
     *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
     * 如果是公钥模式，则密文必须存在，且密文签名合法
     *
     * @param body
     * @param beExchangeSpecialAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, beExchangeSpecialAssetAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 beExchangeSpecialAsset 交易
     *
     * @param body
     * @param beExchangeSpecialAsset
     */
    init(body: BFChainCore.TxBodyJSON, beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetAssetJSON): BeExchangeSpecialAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: BeExchangeSpecialAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=beExchangeSpecialAsset.d.ts.map