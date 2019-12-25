import { TransactionFactory } from "./_txbase";
import { SignForAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { TrustAssetTransactionFactory } from "./trustAsset";
/**
 * sigForAsset 交易工厂
 *
 */
export declare class SignForAssetTransactionFactory extends TransactionFactory<SignForAssetTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private trustAssetTransactionFactory;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, trustAssetTransactionFactory: TrustAssetTransactionFactory);
    /**
     * 校验输入信息
     * 要验证 signForAsset 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收账户地址，并且不能是交易的发起账户(是 signForAsset 交易的发起账户地址)
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "transactionSignature" value 必须是 trustAsset 的签名
     * asset 是完整的 signForAsset 信息
     * 必须携带 trustAsset 交易的签名
     * 必须携带 trustAsset 的发起交易高度
     * 如果 trustAsset 有指定开始交易高度间隔，则必须携带则个值
     * 如果 trustAsset 有指定交易的有效区块高度，则必须携带这个值
     * 必须携带 trustAsset 交易的发起账户地址
     * 必须携带 trustAsset 交易的接收账户地址
     * 必须携带委托方签名，签名合法，且签名人是 trustAsset 的发起人/接收人/指定的委托账户
     * 委托方签名数量必须大于等于 trustAsset 指定的有效的委托方签名数量
     * 委托方的签名和二次签名必须合法
     *
     * @param body
     * @param signForAssetAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, signForAssetAsset: BFChainCore.SignForAssetAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 signForAsset 交易
     *
     * @param body
     * @param signForAssetAsset
     */
    init(body: BFChainCore.TxBodyJSON, signForAssetAsset: BFChainCore.SignForAssetAssetJSON): SignForAssetTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: SignForAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=signForAsset.d.ts.map