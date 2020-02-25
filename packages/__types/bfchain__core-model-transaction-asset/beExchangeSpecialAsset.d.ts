import { Message } from "@bfchain/protobuf";
import { ToExchangeSpecialAssetModel } from "./toExchangeSpecialAsset";
import { RANGE_TYPE } from "@bfchain/core-model-constants";
import { AccountSignatureModel } from "./accountSignature";
export declare class BeExchangeSpecialAssetModel extends Message<BeExchangeSpecialAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeSpecialAssetJSON> {
    static INC: number;
    transactionSignatureBuffer: Uint8Array;
    get transactionSignature(): string;
    set transactionSignature(value: string);
    ciphertextSignatureBuffer: Uint8Array;
    get ciphertextSignature(): AccountSignatureModel;
    set ciphertextSignature(signature: AccountSignatureModel);
    applyBlockHeight: number;
    numberOfEffectiveBlocks: number;
    transactionRangeType: RANGE_TYPE;
    transactionRange: string[];
    exchangeSpecialAsset: ToExchangeSpecialAssetModel;
    toJSON(): BFChainCore.BeExchangeSpecialAssetJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<BeExchangeSpecialAssetModel>): T;
}
export declare class BeExchangeSpecialAssetAssetModel extends Message<BeExchangeSpecialAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.BeExchangeSpecialAssetAssetJSON> {
    beExchangeSpecialAsset: BeExchangeSpecialAssetModel;
    toJSON(): {
        beExchangeSpecialAsset: BFChainCore.BeExchangeSpecialAssetJSON;
    };
}
