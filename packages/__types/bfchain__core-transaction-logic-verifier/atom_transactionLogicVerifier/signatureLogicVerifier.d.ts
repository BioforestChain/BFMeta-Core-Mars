import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { SignatureTransaction } from "@bfchain/core-model";
export declare class SignatureLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: SignatureTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
