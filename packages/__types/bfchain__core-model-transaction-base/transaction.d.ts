import { Message } from "@bfchain/protobuf";
import { StringKeyMap } from "@bfchain/core-model-common";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
export declare class TemplateRemark extends Message {
    remark: {
        [key: string]: string;
    };
    private _remarkMap?;
    get remarkMap(): StringKeyMap<string>;
    toJSON(): {
        remark: {
            [key: string]: string;
        };
    };
    getBytes(): Uint8Array;
}
export declare class TransactionBaseStorageModel extends Message<TransactionBaseStorageModel> implements BFChainCore.TransactionStorageJSON, BFChainUtil.JSONAble<BFChainCore.TransactionStorageJSON> {
    static INC: number;
    key: string;
    value: string;
    toJSON(): {
        key: string;
        value: string;
    };
}
export declare class Transaction<AJ extends object = object> extends Message<Transaction<AJ>> implements BFChainCore.TransactionJSON<AJ> {
    static INC: number;
    ASSET_MODEL_TYPE: BFChainCore.AssetJSONToModelType<AJ>;
    ASSET_JSON_TYPE: AJ;
    asset: BFChainCore.AssetJSONToModelType<AJ>;
    version: number;
    type: string;
    senderId: string;
    senderPublicKeyBuffer: Uint8Array;
    get senderPublicKey(): string;
    set senderPublicKey(value: string);
    senderSecondPublicKeyBuffer?: Uint8Array;
    get senderSecondPublicKey(): string | undefined;
    set senderSecondPublicKey(value: string | undefined);
    recipientId?: string;
    rangeType: RANGE_TYPE;
    range: string[];
    fee: string;
    timestamp: number;
    dappid?: string;
    lns?: string;
    sourceIP?: string;
    fromMagic: string;
    toMagic: string;
    applyBlockHeight: number;
    numberOfEffectiveBlocks: number;
    nonce: number;
    signatureBuffer: Uint8Array;
    get signature(): string;
    set signature(value: string);
    storage?: TransactionBaseStorageModel;
    get storageKey(): string | undefined;
    get storageValue(): string | undefined;
    signSignatureBuffer?: Uint8Array;
    get signSignature(): string | undefined;
    set signSignature(value: string | undefined);
    remark: {
        [key: string]: string;
    };
    get remarkMap(): StringKeyMap<string>;
    getBytes(skipSignature?: boolean, skipSignSignature?: boolean): Uint8Array;
    toJSON(): BFChainCore.TransactionJSON<AJ>;
    static fromObject<M extends Message>(this: BFChainProtobuf.Constructor<M>, object: BFChainProtobuf.ObjectFromType<BFChainCore.TransactionJSON<BFChainCore.GetMessageAssetModel<M>>>): M;
}
