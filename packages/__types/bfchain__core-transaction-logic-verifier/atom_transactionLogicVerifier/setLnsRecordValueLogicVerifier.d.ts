import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { SetLnsRecordValueTransaction } from "@bfchain/core-model";
export declare class SetLnsRecordValueLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: SetLnsRecordValueTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
