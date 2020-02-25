import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
export declare class ImmigrateAssetLogicVerifier extends TransactionLogicVerifier {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper);
    verify(transaction: ImmigrateAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
