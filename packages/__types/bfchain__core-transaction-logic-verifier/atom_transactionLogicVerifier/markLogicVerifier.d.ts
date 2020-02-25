import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { MarkTransaction } from "@bfchain/core-model";
export declare class MarkLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: MarkTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    isDAppidAlreadyExist(magic: string, dappid: string, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
