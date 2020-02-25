import { Message } from "@bfchain/protobuf";
import { GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model-constants";
export declare class GiftAssetModel extends Message<GiftAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAssetJSON> {
    static INC: number;
    cipherPublicKeysBuffer: Uint8Array[];
    get cipherPublicKeys(): string[];
    set cipherPublicKeys(cipherPublicKeyList: string[]);
    sourceChainMagic: string;
    sourceChainName: string;
    assetType: string;
    amount: string;
    totalGrabableTimes: number;
    numberOfBeginUnfrozenBlocks?: number;
    giftDistributionRule: GIFT_DISTRIBUTION_RULE;
    toJSON(): BFChainCore.GiftAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<GiftAssetModel>): T;
}
export declare class GiftAssetAssetModel extends Message<GiftAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAssetAssetJSON> {
    giftAsset: GiftAssetModel;
    toJSON(): {
        giftAsset: BFChainCore.GiftAssetJSON;
    };
}
