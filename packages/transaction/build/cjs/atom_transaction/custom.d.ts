import { TransactionFactory } from "./_txbase";
import { CustomTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { CustomTransactionEvent } from "./custom.event";
/**
 *  交易工厂
 *
 */
export declare class CustomTransactionFactory extends TransactionFactory<CustomTransaction> {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    customTransactionEvent: CustomTransactionEvent;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, customTransactionEvent: CustomTransactionEvent);
    customTransactionCenter?: BFChainCore.CustomTrCenterInterface;
    /**
     * 校验输入信息
     * 要验证 custom 交易的基础信息是否合法和 asset 信息是否存在
     * @param body
     * @param customAsset
     */
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, customAsset: BFChainCore.CustomAssetJSON, config?: ConfigHelper): void;
    /**
     * 初始化 custom 交易
     *
     * @param body
     * @param customAsset
     */
    init(body: BFChainCore.TxBodyJSON, customAsset: BFChainCore.CustomAssetJSON): CustomTransaction;
    /**
     * 交易生效，对账务产生影响
     *
     * @param transaction
     * @param eventEmitter
     */
    applyTransaction(transaction: CustomTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter): any[] | Promise<any[]>;
}
//# sourceMappingURL=custom.d.ts.map