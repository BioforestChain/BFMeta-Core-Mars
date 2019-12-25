import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { GiftAssetTransaction } from "@bfchain/core-model";
export declare class GiftAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: GiftAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=giftAssetLogicVerifier.d.ts.map