import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { SetLnsRecordValueTransaction } from "@bfchain/core-model";
export declare class SetLnsRecordValueLogicVerifier extends TransactionLogicVerifier {
    constructor();
    addRecord(locationName: string, addRecord: BFChainCore.LocationNameRecordJSON, records: BFChainCore.LocationNameRecordInfo): void;
    deleteRecord(locationName: string, deleteRecord: BFChainCore.LocationNameRecordJSON, records: BFChainCore.LocationNameRecordInfo): void;
    verify(transaction: SetLnsRecordValueTransaction, currentBlockHeight: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface<import("@bfchain/core-channel").ChainChannel> | undefined, customTransactionCenter?: BFChainCore.CustomTrCenterInterface | undefined): Promise<boolean>;
}
//# sourceMappingURL=setLnsRecordValueLogicVerifier.d.ts.map