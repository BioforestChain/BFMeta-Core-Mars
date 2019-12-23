import { Message } from "@bfchain/protobuf";
import { GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model-constants";
/**
 * giftAsset 交易 asset 模型
 *
 */
export declare class GiftAssetModel extends Message<GiftAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAssetJSON> {
    static INC: number;
    /**密钥交换 */
    cipherPublicKeysBuffer: Uint8Array[];
    get cipherPublicKeys(): string[];
    set cipherPublicKeys(cipherPublicKeyList: string[]);
    /**用于赠送的资产来源链的网络标识符 */
    sourceChainMagic: string;
    /**用于赠送的资产来源链的链名 */
    sourceChainName: string;
    /**用于赠送的资产 */
    assetType: string;
    /**用于赠送的资产数量 */
    amount: string;
    /**接受赠送的次数 */
    totalGrabableTimes: number;
    /**为每一笔红包预留的手续费数量
     * 这里将冻结`totalGrabableTimes * unitReserveFee`的手续费
     */
    /**可以开始进行交易的区块高度 */
    numberOfBeginUnfrozenBlocks?: number;
    /**资产的分配规则 */
    giftDistributionRule: GIFT_DISTRIBUTION_RULE;
    toJSON(): BFChainCore.GiftAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<GiftAssetModel>): T;
}
/**
 * giftAsset 交易 asset 外层模型
 *
 */
export declare class GiftAssetAssetModel extends Message<GiftAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAssetAssetJSON> {
    giftAsset: GiftAssetModel;
    toJSON(): {
        giftAsset: BFChainCore.GiftAssetJSON;
    };
}
//# sourceMappingURL=giftAsset.d.ts.map