import { Message } from "@bfchain/protobuf";
import { AccountSignatureModel } from "./accountSignature";
/**
 * emigrateAsset 交易 asset 模型
 *
 */
export declare class EmigrateAssetModel extends Message<EmigrateAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetJSON> {
    static INC: number;
    genesisDelegateSignatureBuffer: Uint8Array;
    get genesisDelegateSignature(): AccountSignatureModel;
    set genesisDelegateSignature(signature: AccountSignatureModel);
    /**欲销毁的数字资产来源链名 */
    sourceChainName: string;
    /**欲销毁的数字资产来源链网络标识符 */
    sourceChainMagic: string;
    /**欲销毁的数字资产名 */
    assetType: string;
    /**欲销毁的数字资产数量 */
    amount: string;
    getBytes(): Uint8Array;
    toJSON(): {
        genesisDelegateSignature: BFChainCore.AccountSignatureJSON;
        sourceChainName: string;
        sourceChainMagic: string;
        assetType: string;
        amount: string;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<EmigrateAssetModel>): T;
}
/**
 * emigrateAsset 交易 asset 外层模型
 *
 */
export declare class EmigrateAssetAssetModel extends Message<EmigrateAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetAssetJSON> {
    emigrateAsset: EmigrateAssetModel;
    toJSON(): {
        emigrateAsset: {
            genesisDelegateSignature: BFChainCore.AccountSignatureJSON;
            sourceChainName: string;
            sourceChainMagic: string;
            assetType: string;
            amount: string;
        };
    };
}
//# sourceMappingURL=emigrateAsset.d.ts.map