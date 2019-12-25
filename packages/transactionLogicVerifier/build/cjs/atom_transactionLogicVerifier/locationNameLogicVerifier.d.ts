import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { LocationNameTransaction } from "@bfchain/core-model";
export declare class LocationNameLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: LocationNameTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=locationNameLogicVerifier.d.ts.map