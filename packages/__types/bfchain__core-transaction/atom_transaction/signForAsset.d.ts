import { TransactionFactory } from "./_txbase";
import { SignForAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { TrustAssetTransactionFactory } from "./trustAsset";
export declare class SignForAssetTransactionFactory extends TransactionFactory<SignForAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private trustAssetTransactionFactory;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, trustAssetTransactionFactory: TrustAssetTransactionFactory);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, signForAssetAsset: BFChainCore.SignForAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, signForAssetAsset: BFChainCore.SignForAssetAssetJSON): SignForAssetTransaction;
    applyTransaction(transaction: SignForAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
