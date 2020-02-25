import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { SignForAssetTransaction, AccountSignatureModel } from "@bfchain/core-model";
import { AccountBaseHelper } from "@bfchain/core-helper";
export declare class SignForAssetLogicVerifier extends TransactionLogicVerifier {
    accountBaseHelper: AccountBaseHelper;
    constructor(accountBaseHelper: AccountBaseHelper);
    verify(transaction: SignForAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isValidRecipientId(transaction: SignForAssetTransaction, trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>): void;
    isValidThirdPartySignatures(thirdPartySignatures: AccountSignatureModel[], accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
    isDependentTransactionMatch(transaction: SignForAssetTransaction, trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>): void;
    checkSecondaryTransaction(transaction: SignForAssetTransaction, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
}
