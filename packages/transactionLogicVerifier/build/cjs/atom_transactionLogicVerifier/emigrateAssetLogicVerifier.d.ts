import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { EmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper } from "@bfchain/core-helper-account";
export declare class EmigrateAssetLogicVerifier extends TransactionLogicVerifier {
    protected accountHelper: AccountBaseHelper;
    constructor(accountHelper: AccountBaseHelper);
    verify(transaction: EmigrateAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=emigrateAssetLogicVerifier.d.ts.map