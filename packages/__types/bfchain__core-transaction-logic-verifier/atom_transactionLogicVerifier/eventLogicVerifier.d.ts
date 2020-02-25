import { ConfigHelper, BlockHelper, TransactionHelper } from "@bfchain/core-helper";
export declare class EventLogicVerifier {
    protected configHelper: ConfigHelper;
    protected blockHelper: BlockHelper;
    protected transactionHelper: TransactionHelper;
    protected transactionCore: import("@bfchain/core-transaction").TransactionCore;
    private deepClone;
    private isPossessAssetExceptForChainAsset;
    private addRecord;
    private deleteRecord;
    eventLogicVerifier(transaction: BFChainCore.Transaction, sender: BFChainCore.AccountInfoAndAssets, recipient: BFChainCore.AccountInfoAndAssets | undefined, currentBlockHeight: number, accountGetterHelper: BFChainCore.AccountGetterHelperInterface<any>, transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface): Promise<bigint>;
}
