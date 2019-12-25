import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { CustomTransaction } from "@bfchain/core-model";
export declare class CustomLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: CustomTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=customLogicVerifier.d.ts.map