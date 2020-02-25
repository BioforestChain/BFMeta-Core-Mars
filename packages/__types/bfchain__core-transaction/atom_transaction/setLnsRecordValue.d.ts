import { TransactionFactory } from "./_txbase";
import { SetLnsRecordValueTransaction, SetLnsRecordValueAssetModel } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class SetLnsRecordValueTransactionFactory extends TransactionFactory<SetLnsRecordValueTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, lnsRecordValueAsset: SetLnsRecordValueAssetModel, config?: ConfigHelper): void;
    checkLocationNameRecord(record: BFChainCore.LocationNameRecordJSON): void;
    init(body: BFChainCore.TxBodyJSON, lnsRecordValueAsset: BFChainCore.SetLnsRecordValueAssetJSON): SetLnsRecordValueTransaction;
    applyTransaction(transaction: SetLnsRecordValueTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
