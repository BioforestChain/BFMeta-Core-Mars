import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GrabAssetTransaction } from "@bfchain/core-model";
export declare class GrabAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: GrabAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param giftAssetJson
     */
    isValidRecipientId(transaction: GrabAssetTransaction, giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>): void;
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param giftAssetJson
     */
    isDependentTransactionMatch(transaction: GrabAssetTransaction, giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>): void;
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param giftAssetJson
     * @param currentBlockHeight
     */
    isValidToUnfrozenAsset(transaction: GrabAssetTransaction, giftAssetJson: BFChainCore.TransactionJSON<BFChainCore.GiftAssetAssetJSON>, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    checkSecondaryTransaction(transaction: GrabAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
}
//# sourceMappingURL=grabAssetLogicVerifier.d.ts.map