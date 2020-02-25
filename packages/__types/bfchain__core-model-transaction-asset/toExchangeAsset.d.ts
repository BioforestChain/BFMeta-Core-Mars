import { Message } from "@bfchain/protobuf";
import { RateModel } from "@bfchain/core-model-common";
export declare class ToExchangeAssetModel extends Message<ToExchangeAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAssetJSON> {
    static INC: number;
    cipherPublicKeysBuffer: Uint8Array[];
    get cipherPublicKeys(): string[];
    set cipherPublicKeys(cipherTextList: string[]);
    toExchangeSource: string;
    beExchangeSource: string;
    toExchangeChainName: string;
    beExchangeChainName: string;
    toExchangeAsset: string;
    beExchangeAsset: string;
    toExchangeNumber: string;
    exchangeRate: RateModel;
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
    };
    toJSON(): {
        cipherPublicKeys: string[];
        toExchangeSource: string;
        beExchangeSource: string;
        toExchangeChainName: string;
        beExchangeChainName: string;
        toExchangeAsset: string;
        beExchangeAsset: string;
        toExchangeNumber: string;
        exchangeRate: {
            prevWeight: string;
            nextWeight: string;
        };
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<ToExchangeAssetModel>): T;
}
export declare class ToExchangeAssetAssetModel extends Message<ToExchangeAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAssetAssetJSON> {
    toExchangeAsset: ToExchangeAssetModel;
    toJSON(): {
        toExchangeAsset: {
            cipherPublicKeys: string[];
            toExchangeSource: string;
            beExchangeSource: string;
            toExchangeChainName: string;
            beExchangeChainName: string;
            toExchangeAsset: string;
            beExchangeAsset: string;
            toExchangeNumber: string;
            exchangeRate: {
                prevWeight: string;
                nextWeight: string;
            };
        };
    };
}
