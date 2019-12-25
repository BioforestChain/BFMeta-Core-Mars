import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { SignForAssetTransaction, AccountSignatureModel } from "@bfchain/core-model";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
export declare class SignForAssetLogicVerifier extends TransactionLogicVerifier {
    accountHelper: AccountBaseHelper;
    constructor(accountHelper: AccountBaseHelper);
    verify(transaction: SignForAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 接收账户是否合法
     *
     * @param transaction
     * @param trustAssetJson
     */
    isValidRecipientId(transaction: SignForAssetTransaction, trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>): void;
    /**
     * 第三方签名是否合法
     *
     * @param thirdPartySignatures
     */
    isValidThirdPartySignatures(thirdPartySignatures: AccountSignatureModel[], accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 依赖的交易是否匹配
     *
     * @param transaction
     * @param trustAssetJson
     */
    isDependentTransactionMatch(transaction: SignForAssetTransaction, trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>): void;
    /**
     * 能否正常解冻资产
     *
     * @param transaction
     * @param trustAssetJson
     * @param currentBlockHeight
     */
    isValidToUnfrozenAsset(transaction: SignForAssetTransaction, trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    /**
     * 不能二次操作同一笔交易(红包/资产交换/委托资产)
     *
     * @param tr
     */
    checkSecondaryTransaction(transaction: SignForAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined): Promise<void>;
}
//# sourceMappingURL=signForAssetLogicVerifier.d.ts.map