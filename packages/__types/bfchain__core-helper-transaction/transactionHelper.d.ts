/// <reference types="node" />
import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { TRANSACTION_TYPES_BASE, GiftAssetTransaction, GrabAssetModel } from "@bfchain/core-model-transaction";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { AsymmetricHelper } from "@bfchain/core-helper-asymmetric";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
declare type Transaction = import("@bfchain/core-model-transaction").Transaction;
export declare class TransactionHelper {
    config: ConfigHelper;
    baseHelper: BaseHelper;
    jsbiHelper: JSBIHelper;
    cryptoHelper: BFChainCore.CryptoHelperInterface;
    keypairHelper: BFChainCore.KeypairHelperInterface;
    Buffer: BFChainUtil.BufferConstructor;
    private asymmetricHelper;
    private accountBaseHelper;
    constructor(config: ConfigHelper, baseHelper: BaseHelper, jsbiHelper: JSBIHelper, cryptoHelper: BFChainCore.CryptoHelperInterface, keypairHelper: BFChainCore.KeypairHelperInterface, Buffer: BFChainUtil.BufferConstructor, asymmetricHelper: AsymmetricHelper, accountBaseHelper: AccountBaseHelper);
    get _ASSETTYPE(): string;
    get _CHAIN_NAME(): string;
    parseType(type: string): {
        assetType: string;
        chainName: string;
        baseType: TRANSACTION_TYPES_BASE;
    };
    resolveType(arg: ReturnType<TransactionHelper["parseType"]>): string;
    getTypeName(type: string): string | undefined;
    getTypeNameByBaseType(baseType: TRANSACTION_TYPES_BASE): string | undefined;
    getTransactionType(base_type: TRANSACTION_TYPES_BASE): string;
    isValidType(type: string): boolean;
    generateSignature(trs: Transaction): string;
    isValidTransactionSignature(signature: string): boolean;
    get SIGNATURE(): string;
    get DELEGATE(): string;
    get VOTE(): string;
    get USERNAME(): string;
    get ACCEPT_VOTE(): string;
    get REJECT_VOTE(): string;
    get CUSTOM(): string;
    get DAPP(): string;
    get DAPP_PURCHASING(): string;
    get ISSUE_SUBCHAIN(): string;
    get MARK(): string;
    get ISSUE_ASSET(): string;
    get DESTORY_ASSET(): string;
    get TRANSFER_ASSET(): string;
    get TO_EXCHANGE_ASSET(): string;
    get BE_EXCHANGE_ASSET(): string;
    get GIFT_ASSET(): string;
    get GRAB_ASSET(): string;
    get TRUST_ASSET(): string;
    get SIGN_FOR_ASSET(): string;
    get EMIGRATE_ASSET(): string;
    get IMMIGRATE_ASSET(): string;
    get TO_EXCHANGE_SPECIAL_ASSET(): string;
    get BE_EXCHANGE_SPECIAL_ASSET(): string;
    get LOCATION_NAME(): string;
    get SET_LNS_RECORD_VALUE(): string;
    get SET_LNS_MANAGER(): string;
    ALL_TRANSACTION_TYPES: string[];
    genesisDelegates(config?: ConfigHelper): string[];
    verifyTransactionSignature<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS, opts?: {
        taskLabel?: string;
    }): void;
    verifyTransactionRemarkSize<SOME_TRS extends BFChainCore.Transaction>(transaction: SOME_TRS): void;
    calcTransactionFee(trs: Transaction, minTransactionFeePerByte?: BFChainCore.FractionJSON<number> | import("@bfchain/core-model-common").Fraction): string;
    private _cache_of_diff_numerator_BI;
    private _cache_of_diff_BI;
    calcDiffOfTransactionProfOfWork(num: number, participation: string): bigint;
    checkTransactionProfOfWork(signatureBuffer: Uint8Array, num: number, participation: string, diff_BI?: bigint): boolean;
    nonceWriter<T extends Transaction>(trs: T): Generator<{
        uint8array: Uint8Array;
        nonce: number;
    }, void, unknown>;
    hashCode(str: string): number;
    calcGrabRandomGiftAssetNumber(grabId: string, blockSignatureBuffer: Uint8Array, giftTransactionSignatureBuffer: Uint8Array, gifterId: string, totalGiftAssetNumber: string, totalGrabableTimes: number): bigint;
    calcGrabRecipientRandomGiftAssetNumber(grabId: string, blockSignatureBuffer: Uint8Array, giftTransactionSignatureBuffer: Uint8Array, gifterId: string, giftTransactionRecipient: string[], totalGiftAssetNumber: string): bigint;
    calcGrabAverageGiftAssetNumber(totalGiftAssetNumber: string, totalGrabableTimes: number): bigint;
    calcGrabGiftAssetNumber(grabId: string, giftTransactionInBlock: BFChainCore.TransactionInBlock<GiftAssetTransaction>): bigint;
    generateGrabAsset(giftTransactionInBlock: BFChainCore.TransactionInBlock<GiftAssetTransaction>, opts: BFChainCore.TransactionHelper.GenerateGrabAssetOptions): GrabAssetModel;
    getCiphertextSignature(args: {
        secret: string;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
    }): Buffer;
    verifyCiphertextSignature(args: {
        secretPublicKey: Uint8Array;
        ciphertextSignatureBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
    }): boolean;
    getEmigrateAssetGenesisSignature(args: {
        secret: string;
        chainName: string;
        magic: string;
        assetType: string;
        senderId: string;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    emigrateAssetGenesisSignature(args: {
        secretKeyBuffer: Uint8Array;
        chainName: string;
        magic: string;
        assetType: string;
        senderId: string;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    verifyEmigrateAssetGenesisSignature(args: {
        secretPublicKey: Uint8Array;
        signatureBuffer: Uint8Array;
        chainName: string;
        magic: string;
        assetType: string;
        senderId: string;
        genesisSignatureBuffer?: Uint8Array;
    }): boolean;
    getImmigrateAssetGenesisSignature(args: {
        secret: string;
        transactionSignatureBuffer: Uint8Array;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    immigrateAssetGenesisSignature(args: {
        secretKeyBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        genesisSignatureBuffer?: Uint8Array;
    }): Buffer;
    verifyImmigrateAssetGenesisSignature(args: {
        secretPublicKey: Uint8Array;
        signatureBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        genesisSignatureBuffer?: Uint8Array;
    }): boolean;
    getThirdPartySignature(args: {
        secret: string;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
        recipientId: string;
        thirdPartySignatureBuffer?: Uint8Array;
    }): Buffer;
    thirdPartySignature(args: {
        secretKeyBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
        recipientId: string;
        thirdPartySignatureBuffer?: Uint8Array;
    }): Buffer;
    verifyThirdPartySignature(args: {
        secretPublicKey: Uint8Array;
        signatureBuffer: Uint8Array;
        transactionSignatureBuffer: Uint8Array;
        senderId: string;
        recipientId: string;
        thirdPartySignatureBuffer?: Uint8Array;
    }): boolean;
    getTransactionMaxEffectiveHeight(transaction: Transaction): number;
    getTransactionMinEffectiveHeight(transaction: Transaction): number;
}
export {};
