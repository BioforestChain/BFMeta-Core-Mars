import { TransactionFactory } from "./_txbase";
import { GrabAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper, AsymmetricHelper } from "@bfchain/core-helper";
import { GiftAssetTransactionFactory } from "./giftAsset";
/**
 * grabAsset 交易工厂
 *
 */
export declare class GrabAssetTransactionFactory extends TransactionFactory<GrabAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private giftAssetTransactionFactory;
    private asymmetricHelper;
    private cryptoHelper;
    private Buffer;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, giftAssetTransactionFactory: GiftAssetTransactionFactory, asymmetricHelper: AsymmetricHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, Buffer: BFChainUtil.BufferConstructor);
    /**
     * 校验输入信息
     * 要验证 grabAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址(是 giftAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 必须是 giftAsset 的签名
     * asset 是完整的 grabAsset 信息
     * 必须携带 发红包交易 被确认的区块签名
     * 必须携带 发红包交易 的签名
     * 必须携带 发红包交易 的 接收范围类型 rangeType
     * 必须携带 发红包交易 的 接收范围 range
     *  如果 range 长度大于 0
     *    rangeType === MULTI_ADDRESS 交易的发起账户地址必须在 range 中
     *    rangeType === MULTI_DAPPID 交易的 dappid 必须在 range 中
     *    rangeType === MULTI_LOCATION_NAME 交易的 lns 必须在 range 中
     * 必须携带 发红包交易 的发起交易高度
     * 如果 发红包交易 有指定开始交易高度间隔，则必须携带则个值
     * 如果 发红包交易 有指定交易的有效区块高度，则必须携带这个值
     * 如果是公钥模式，则密文必须存在，且密文签名合法
     * 根据 发红包交易 的模式，校验金额是否正确
     *
     * @param body
     * @param grabAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, grabAssetAsset: BFChainCore.GrabAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 grabAsset 交易
     *
     * @param body
     * @param grabAsset
     */
    init(body: BFChainCore.TxBodyJSON, grabAsset: BFChainCore.GrabAssetAssetJSON): GrabAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: GrabAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=grabAsset.d.ts.map