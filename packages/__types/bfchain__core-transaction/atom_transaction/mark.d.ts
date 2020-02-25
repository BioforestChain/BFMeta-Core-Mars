import { TransactionFactory } from "./_txbase";
import { MarkTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper } from "@bfchain/core-helper";
import { DAppTransactionFactory } from "./dapp";
export declare class MarkTransactionFactory extends TransactionFactory<MarkTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    dappTransactionFactory: DAppTransactionFactory;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, dappTransactionFactory: DAppTransactionFactory);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, markAsset: BFChainCore.MarkAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, markAsset: BFChainCore.MarkAssetJSON): MarkTransaction;
}
