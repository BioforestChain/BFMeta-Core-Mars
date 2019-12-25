import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeSpecialAssetTransaction } from "@bfchain/core-model";
export declare class BeExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: BeExchangeSpecialAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param toExchangeSpecialAssetJson
     */
    isValidRecipientId(transaction: BeExchangeSpecialAssetTransaction, toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>): void;
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param toExchangeSpecialAssetJson
     */
    isDependentTransactionMatch(transaction: BeExchangeSpecialAssetTransaction, toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>): void;
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param toExchangeSpecialAssetJson
     * @param currentBlockHeight
     */
    isValidToUnfrozenAsset(transaction: BeExchangeSpecialAssetTransaction, toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    checkSecondaryTransaction(transaction: BeExchangeSpecialAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
}
//# sourceMappingURL=beExchangeSpecialAssetLogicVerifier.d.ts.map