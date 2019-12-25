import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { UsernameTransaction } from "@bfchain/core-model";
export declare class UsernameLogicVerifier extends TransactionLogicVerifier {
    constructor();
    verify(transaction: UsernameTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
    /**
     * 委托账户是否处于冻结状态
     *
     * @param trustees
     */
    isAliasAlreadyExist(alias: string, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<void>;
}
//# sourceMappingURL=usernameLogicVerifier.d.ts.map