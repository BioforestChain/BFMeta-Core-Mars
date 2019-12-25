import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeAssetTransaction } from "@bfchain/core-model";
export declare class BeExchangeAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: BeExchangeAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param toExchangeAssetJson
     */
    isValidRecipientId(transaction: BeExchangeAssetTransaction, toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>): void;
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param toExchangeAssetJson
     */
    isDependentTransactionMatch(transaction: BeExchangeAssetTransaction, toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>): void;
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param toExchangeAssetJson
     * @param currentBlockHeight
     */
    isValidToUnfrozenAsset(transaction: BeExchangeAssetTransaction, toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    checkSecondaryTransaction(transaction: BeExchangeAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
}
//# sourceMappingURL=beExchangeAssetLogicVerifier.d.ts.map