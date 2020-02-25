import { Message } from "@bfchain/protobuf";
import { GiftAssetModel } from "./giftAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
export declare class GrabAssetModel extends Message<GrabAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetJSON> {
    static INC: number;
    blockSignatureBuffer: Uint8Array;
    get blockSignature(): string;
    set blockSignature(value: string);
    giftTransactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    amount: string;
    ciphertextSignatureBuffer: Uint8Array;
    get ciphertextSignature(): AccountSignatureModel;
    set ciphertextSignature(signature: AccountSignatureModel);
    transactionRangeType: RANGE_TYPE;
    transactionRange: string[];
    applyBlockHeight: number;
    numberOfBeginUnfrozenBlocks?: number;
    numberOfEffectiveBlocks: number;
    giftAsset: GiftAssetModel;
    toJSON(): BFChainCore.GrabAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<GrabAssetModel>): T;
}
export declare class GrabAssetAssetModel extends Message<GrabAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetAssetJSON> {
    grabAsset: GrabAssetModel;
    toJSON(): {
        grabAsset: BFChainCore.GrabAssetJSON;
    };
}
