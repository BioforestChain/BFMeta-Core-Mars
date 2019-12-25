import { TransactionFactory } from "./_txbase";
import { GiftAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
/**
 * giftAsset 交易工厂
 *
 */
export declare class GiftAssetTransactionFactory extends TransactionFactory<GiftAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    /**
     * 校验输入信息
     * 要验证 giftAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 不能携带交易的接收账户
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "assetType" value 值必须是设定的值
     * asset 是完整的 giftAsset 信息
     * 必须携带合法的密文公钥组，必须是一个数组，可为空，每一项都必须是公钥
     * 需要携带合法的资产所属链名称
     * 需要携带合法的资产所属链的网络标识符
     * 需要携带合法的资产名称
     * 需要携带用于赠送的资产数量，并且大于 0
     * 必须指定可抢的次数，并且是一个正整数
     * 如果携带开始抢的区块间隔，这个间隔必须是正整数
     * 必须携带抢红包规则：average/random/recipient_random
     * 如果交易指定了过期区块间隔 n 和开始解冻区块间隔 m，则 m 必须小于 n
     *
     * @param body
     * @param giftAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, giftAssetAsset: BFChainCore.GiftAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 校验`GiftAsset`内容
     * @param giftAsset
     */
    verifyGiftAsset(giftAsset: BFChainCore.GiftAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 giftAsset 交易
     *
     * @param body
     * @param giftAsset
     */
    init(body: BFChainCore.TxBodyJSON, giftAsset: BFChainCore.GiftAssetAssetJSON): GiftAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: GiftAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=giftAsset.d.ts.map