import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { EmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper } from "@bfchain/core-helper";
export declare class EmigrateAssetLogicVerifier extends TransactionLogicVerifier {
    protected accountBaseHelper: AccountBaseHelper;
    constructor(accountBaseHelper: AccountBaseHelper);
    verify(transaction: EmigrateAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
