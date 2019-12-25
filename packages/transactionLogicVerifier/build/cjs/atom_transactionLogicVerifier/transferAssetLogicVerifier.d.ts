import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { TransferAssetTransaction } from "@bfchain/core-model";
export declare class TransferAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: TransferAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=transferAssetLogicVerifier.d.ts.map