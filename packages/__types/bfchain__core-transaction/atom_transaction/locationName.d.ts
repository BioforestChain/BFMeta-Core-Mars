import { TransactionFactory } from "./_txbase";
import { LocationNameTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class LocationNameTransactionFactory extends TransactionFactory<LocationNameTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, locationNameAsset: BFChainCore.LocationNameAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, locationName: BFChainCore.LocationNameAssetJSON): LocationNameTransaction;
    applyTransaction(transaction: LocationNameTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
