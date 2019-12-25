import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { SignatureTransaction } from "@bfchain/core-model";
export declare class SignatureLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: SignatureTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=signatureLogicVerifier.d.ts.map