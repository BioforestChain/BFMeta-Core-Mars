import { Message } from "@bfchain/protobuf";
import { GiftAssetModel } from "./giftAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
/**
 * grabAsset 交易 asset 模型
 *
 */
export declare class GrabAssetModel extends Message<GrabAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetJSON> {
    static INC: number;
    /**赠送交易所在的区块签名 */
    blockSignatureBuffer: Uint8Array;
    get blockSignature(): string;
    set blockSignature(value: string);
    /**要抢的红包交易的签名 */
    giftTransactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    /**抢到的资产数量 */
    amount: string;
    /**用于校验身份的密文签名，如果需要的话 */
    ciphertextSignatureBuffer: Uint8Array;
    get ciphertextSignature(): AccountSignatureModel;
    set ciphertextSignature(signature: AccountSignatureModel);
    /**要抢红包交易的接收者列表 */
    transactionRangeType: RANGE_TYPE;
    transactionRange: string[];
    applyBlockHeight: number;
    numberOfBeginUnfrozenBlocks?: number;
    numberOfEffectiveBlocks?: number;
    /**红包的配置信息 */
    giftAsset: GiftAssetModel;
    toJSON(): BFChainCore.GrabAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<GrabAssetModel>): T;
}
/**
 * grabAsset 交易 asset 外层模型
 *
 */
export declare class GrabAssetAssetModel extends Message<GrabAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.GrabAssetAssetJSON> {
    grabAsset: GrabAssetModel;
    toJSON(): {
        grabAsset: BFChainCore.GrabAssetJSON;
    };
}
//# sourceMappingURL=grabAsset.d.ts.map