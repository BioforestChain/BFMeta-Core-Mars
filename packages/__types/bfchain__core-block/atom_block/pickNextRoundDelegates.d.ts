import { BlockHelper, ConfigHelper, AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
export declare class PickNextRoundDelegates<T extends BFChainCore.ForSortAccountInfo> {
    private config;
    private blockHelper;
    private accountBaseHelper;
    private transactionHelper;
    constructor(config: ConfigHelper, blockHelper: BlockHelper, accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper);
    private accountGetterHelper?;
    getNextRoundDelegates(currentHeight: number, accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface<T>, "getNextRoundDelegates" | "getAccounts"> | undefined): Promise<T[]>;
    calcForgingDelegates(round: number, accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface<T>, "getNextRoundDelegates" | "getAccounts"> | undefined): Promise<T[]>;
    private __getAlternateDelegates;
    getGenesisDelegates(results: T[], pickAddressArr: string[], accountGetterHelper?: Pick<BFChainCore.AccountGetterHelperInterface<T>, "getAccounts"> | undefined): Promise<{
        results: T[];
        pickAddressArr: string[];
    }>;
    private __sortByProductivity;
}
