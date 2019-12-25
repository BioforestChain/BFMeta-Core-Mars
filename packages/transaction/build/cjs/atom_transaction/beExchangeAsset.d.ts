import { TransactionFactory } from "./_txbase";
import { BeExchangeAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, JSBIHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { ToExchangeAssetTransactionFactory } from "./toExchangeAsset";
/**
 * beExchangeAsset 交易工厂
 *
 */
export declare class BeExchangeAssetTransactionFactory extends TransactionFactory<BeExchangeAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    jsbiHelper: JSBIHelper;
    toExchangeAssetTransactionFactory: ToExchangeAssetTransactionFactory;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, jsbiHelper: JSBIHelper, toExchangeAssetTransactionFactory: ToExchangeAssetTransactionFactory);
    /**
     * 校验输入信息
     * 要验证 beExchangeAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址(是 toExchangeAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 值必须是 to 交易的签名
     * asset 是完整的 beExchangeAsset 的交易
     * 必须携带 toExchangeAsset 的签名
     * 必须携带用于交换的资产数量和交换得到的资产数量
     * 必须携带 toExchangeAsset 的发起交易高度
     * 如果 toExchangeAsset 有指定开始交易高度间隔，则必须携带则个值
     * 如果 toExchangeAsset 有指定交易的有效区块高度，则必须携带这个值
     * 必须携带 申请资产交换交易 的 接收范围类型 rangeType
     * 必须携带 申请资产交换交易 的 接收范围 range
     *  如果 range 长度大于 0
     *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
     *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
     *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
     * 用于交换的资产数量必须等于被交换资产数量价格转换后得到的资产数量
     * 如果是公钥模式，则密文必须存在，且密文签名合法
     *
     * @param body
     * @param beExchangeAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, beExchangeAssetAsset: BFChainCore.BeExchangeAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 beExchangeAsset 交易
     *
     * @param body
     * @param beExchangeAsset
     */
    init(body: BFChainCore.TxBodyJSON, beExchangeAsset: BFChainCore.BeExchangeAssetAssetJSON): BeExchangeAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: BeExchangeAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=beExchangeAsset.d.ts.map