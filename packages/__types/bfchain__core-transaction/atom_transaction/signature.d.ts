import { TransactionFactory } from "./_txbase";
import { SignatureTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
export declare class SignatureTransactionFactory extends TransactionFactory<SignatureTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, signatureAsset: BFChainCore.SignatureAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, signatureAsset: BFChainCore.SignatureAssetJSON): SignatureTransaction;
    applyTransaction(transaction: SignatureTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
