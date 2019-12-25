import { TransactionFactory } from "./_txbase";
import { MarkTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { DAppTransactionFactory } from "./dapp";
/**
 * mark 交易工厂
 *
 */
export declare class MarkTransactionFactory extends TransactionFactory<MarkTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    dappTransactionFactory: DAppTransactionFactory;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, dappTransactionFactory: DAppTransactionFactory);
    /**
     * 校验输入信息
     * 要验证 mark 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且是 数据存证 的拥有者地址
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "dappid" value 值必须是设定的值
     * asset 是完整的 mark 信息
     * 必须携带 dapp 的相关信息
     * 必须携带合法的数据所属账户地址，与接收账户地址一致
     * 必须携带存证内容：字符串，最大 1024
     * 必须携带存证类型：字符串 1-10
     *
     * @param body
     * @param markAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, markAsset: BFChainCore.MarkAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 mark 交易
     *
     * @param body
     * @param markAsset
     */
    init(body: BFChainCore.TxBodyJSON, markAsset: BFChainCore.MarkAssetJSON): MarkTransaction;
}
//# sourceMappingURL=mark.d.ts.map