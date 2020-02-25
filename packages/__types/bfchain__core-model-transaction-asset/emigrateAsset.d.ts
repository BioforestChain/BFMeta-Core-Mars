import { Message } from "@bfchain/protobuf";
import { AccountSignatureModel } from "./accountSignature";
export declare class EmigrateAssetModel extends Message<EmigrateAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.EmigrateAssetJSON> {
    static INC: number;
    genesisDelegateSignatureBuffer: Uint8Array;
    get genesisDelegateSignature(): AccountSignatureModel;
    set genesisDelegateSignature(signature: AccountSignatureModel);
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
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
