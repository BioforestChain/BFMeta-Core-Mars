import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
import { TransactionHelper } from "@bfchain/core-helper-transaction";
export declare class ImmigrateAssetLogicVerifier extends TransactionLogicVerifier {
    accountHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    constructor(accountHelper: AccountBaseHelper, transactionHelper: TransactionHelper);
    verify(transaction: ImmigrateAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=immigrateAssetLogicVerifier.d.ts.map