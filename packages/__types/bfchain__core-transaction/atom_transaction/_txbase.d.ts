import type { TransactionHelper, ChainAssetInfoHelper, AccountBaseHelper, BaseHelper, ConfigHelper } from "@bfchain/core-helper";
import { Transaction } from "@bfchain/core-model";
declare type FunctionExceptionDetail = {
    target: string;
    function: string;
};
export declare enum BNID_TYPE {
    TESTNET = "c",
    MAINNET = "b"
}
export declare abstract class TransactionFactory<T extends Transaction = Transaction> {
    abstract accountBaseHelper: AccountBaseHelper;
    abstract transactionHelper: TransactionHelper;
    abstract baseHelper: BaseHelper;
    abstract configHelper: ConfigHelper;
    abstract chainAssetInfoHelper: ChainAssetInfoHelper;
    abstract init(body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>): T;
    fromJSON(trs: BFChainCore.TransactionJSON<BFChainCore.GetTransactionAssetJSON<T>>, opts?: {
        verify?: boolean;
        config?: ConfigHelper;
    }): T;
    verifyKeypair(keypair: BFChainCore.Keypair): void;
    verifySecondKeypair(keypair: BFChainCore.Keypair): void;
    verifyTransactionBody(body: BFChainCore.TxBodyJSON, asset: BFChainCore.GetTransactionAssetJSON<T>, config?: ConfigHelper): void;
    verifyBaseInfo(transaction: T, config?: ConfigHelper): void;
    verifySignature(transaction: T): void;
    verifyRemarkSize(transaction: T): void;
    verify(transaction: T, config?: ConfigHelper): void;
    checkAssetAmount(amount: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    checkTrsBaseFee(fee: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    emptyRangeType(body: BFChainCore.TxBodyJSON, Function_Exception_Detail: FunctionExceptionDetail): void;
    checkChainName(chainName: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    checkChainMagic(chainMagic: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    checkAssetType(assetType: string, propName: string, Function_Exception_Detail: FunctionExceptionDetail): void;
    applyTransaction(trs: T, event: BFChainCore.ApplyTransactionEventEmitter, config?: ConfigHelper): any[] | Promise<any[]>;
    protected _beginDealTransaction(trs: T, event: BFChainCore.ApplyTransactionEventEmitter): void | Promise<void> | undefined;
    protected _applyTransactionEmitAsset(event: BFChainCore.ApplyTransactionEventEmitter, transaction: T, amount: string, detail: {
        senderId: string;
        senderPublicKeyBuffer: Uint8Array;
        recipientId?: string;
        recipientPublicKeyBuffer?: Uint8Array;
        assetInfo: BFChainCore.AssetInfoJSON;
    }): any[] | Promise<any[]>;
}
export {};
