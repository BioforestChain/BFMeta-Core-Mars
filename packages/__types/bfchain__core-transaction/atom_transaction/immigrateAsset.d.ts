import { TransactionFactory } from "./_txbase";
import { ImmigrateAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper, ConfigHelperMap } from "@bfchain/core-helper";
import { EmigrateAssetTransactionFactory } from "./emigrateAsset";
export declare class ImmigrateAssetTransactionFactory extends TransactionFactory<ImmigrateAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private emigrateAssetTransactionFactory;
    private configMap;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, emigrateAssetTransactionFactory: EmigrateAssetTransactionFactory, configMap: ConfigHelperMap);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, immigrateAssetAsset: BFChainCore.ImmigrateAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, immigrateAssetAsset: BFChainCore.ImmigrateAssetAssetJSON): ImmigrateAssetTransaction;
    applyTransaction(transaction: ImmigrateAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
