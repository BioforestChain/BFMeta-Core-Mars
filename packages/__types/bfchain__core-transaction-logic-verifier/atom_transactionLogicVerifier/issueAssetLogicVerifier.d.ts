import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { IssueAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
export declare class IssueAssetLogicVerifier extends TransactionLogicVerifier {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper);
    verify(transaction: IssueAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
