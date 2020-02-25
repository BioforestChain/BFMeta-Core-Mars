import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { TrustAssetTransaction } from "@bfchain/core-model";
export declare class TrustAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: TrustAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isTrusteesFrozen(trustees: string[], accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
