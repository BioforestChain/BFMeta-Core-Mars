import { TransactionFactory } from "./_txbase";
import { GrabAssetTransaction } from "@bfchain/core-model";
import { AccountBaseHelper, TransactionHelper, BaseHelper, ConfigHelper, ChainAssetInfoHelper, AsymmetricHelper } from "@bfchain/core-helper";
import { GiftAssetTransactionFactory } from "./giftAsset";
export declare class GrabAssetTransactionFactory extends TransactionFactory<GrabAssetTransaction> {
    accountBaseHelper: AccountBaseHelper;
    transactionHelper: TransactionHelper;
    baseHelper: BaseHelper;
    configHelper: ConfigHelper;
    chainAssetInfoHelper: ChainAssetInfoHelper;
    private giftAssetTransactionFactory;
    private asymmetricHelper;
    private cryptoHelper;
    private Buffer;
    constructor(accountBaseHelper: AccountBaseHelper, transactionHelper: TransactionHelper, baseHelper: BaseHelper, configHelper: ConfigHelper, chainAssetInfoHelper: ChainAssetInfoHelper, giftAssetTransactionFactory: GiftAssetTransactionFactory, asymmetricHelper: AsymmetricHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, Buffer: BFChainUtil.BufferConstructor);
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, grabAssetAsset: BFChainCore.GrabAssetAssetJSON, config?: ConfigHelper): void;
    init(body: BFChainCore.TxBodyJSON, grabAsset: BFChainCore.GrabAssetAssetJSON): GrabAssetTransaction;
    applyTransaction(transaction: GrabAssetTransaction, eventEmitter: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
}
