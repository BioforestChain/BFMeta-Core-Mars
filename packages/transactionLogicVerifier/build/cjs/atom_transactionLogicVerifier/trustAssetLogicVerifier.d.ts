import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { TrustAssetTransaction } from "@bfchain/core-model";
export declare class TrustAssetLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: TrustAssetTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 委托账户是否处于冻结状态
     *
     * @param trustees
     */
    isTrusteesFrozen(trustees: string[], accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=trustAssetLogicVerifier.d.ts.map