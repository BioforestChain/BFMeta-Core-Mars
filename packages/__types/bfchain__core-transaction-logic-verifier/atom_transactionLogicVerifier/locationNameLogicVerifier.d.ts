import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { LocationNameTransaction } from "@bfchain/core-model";
export declare class LocationNameLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: LocationNameTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
