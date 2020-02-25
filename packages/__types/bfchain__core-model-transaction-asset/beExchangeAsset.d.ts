import { Message } from "@bfchain/protobuf";
import { ToExchangeAssetModel } from "./toExchangeAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
export declare class BeExchangeAssetModel extends Message<BeExchangeAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAssetJSON> {
    static INC: number;
    transactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    ciphertextSignatureBuffer: Uint8Array;
    get ciphertextSignature(): AccountSignatureModel;
    set ciphertextSignature(signature: AccountSignatureModel);
    toExchangeNumber: string;
    beExchangeNumber: string;
    applyBlockHeight: number;
    numberOfEffectiveBlocks: number;
    transactionRangeType: RANGE_TYPE;
    transactionRange: string[];
    exchangeAsset: ToExchangeAssetModel;
    get to(): {
        magic: string;
        chainName: string;
        assetType: string;
        amount: string;
    };
    get be(): {
        magic: string;
        chainName: string;
        assetType: string;
        amount: string;
    };
    get exchangeRate(): import("@bfchain/core-model-common").RateModel;
    get toInfo(): {
        applyBlockHeight: number;
        numberOfEffectiveBlocks: number;
    };
    toJSON(): BFChainCore.BeExchangeAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<BeExchangeAssetModel>): T;
}
export declare class BeExchangeAssetAssetModel extends Message<BeExchangeAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeAssetAssetJSON> {
    beExchangeAsset: BeExchangeAssetModel;
    toJSON(): {
        beExchangeAsset: BFChainCore.BeExchangeAssetJSON;
    };
}
