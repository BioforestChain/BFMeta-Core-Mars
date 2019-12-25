import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { DestoryAssetTransaction } from "@bfchain/core-model";
export declare class DestoryAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: DestoryAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=destoryAssetLogicVerifier.d.ts.map