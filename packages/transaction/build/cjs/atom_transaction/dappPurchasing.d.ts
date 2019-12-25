import { TransactionFactory } from "./_txbase";
import { DAppPurchasingTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { DAppTransactionFactory } from "./dapp";
/**
 * dappPurchasing 交易工厂
 *
 */
export declare class DAppPurchasingTransactionFactory extends TransactionFactory<DAppPurchasingTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private dappTransactionFactory;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, dappTransactionFactory: DAppTransactionFactory);
    /**
     * 校验输入信息
     * 要验证 dappPurchasing 交易的基础信息是否合法和 asset 信息是否存在
     * 交易的手续费必须大于 0
     * 交易的 rangeType 必须是 empty
     * 必须携带交易的接收者账户，并且不能和发起账户地址相等
     * 交易的来源链和去往链的网络标识符必须是本链的网络标识符
     * 必须携带查询用的索引存储
     * key 值必须是 "dappid" value 值必须是设定的值
     * asset 是完整的 dappPurchasing 信息
     * 必须携带需要购买的 dapp 的相关信息
     * 如果购买的 dapp 拥有者账户不等于接收者账户则报错
     * 如果购买的 dapp 拥有者账户等于交易的发起账户则报错
     * 如果购买的 dapp 类型不是付费类型，则报错
     *
     * @param body
     * @param dappPurchasingAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, dappPurchasingAsset: BFChainCore.DAppPurchasingAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 dappPurchasing 交易
     *
     * @param body
     * @param dappPurchasingAsset
     */
    init(body: BFChainCore.TxBodyJSON, dappPurchasingAsset: BFChainCore.DAppPurchasingAssetJSON): DAppPurchasingTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: DAppPurchasingTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
//# sourceMappingURL=dappPurchasing.d.ts.map