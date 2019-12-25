import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { SetLnsManagerTransaction } from "@bfchain/core-model";
export declare class SetLnsManagerLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: SetLnsManagerTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=setLnsManagerLogicVerifier.d.ts.map