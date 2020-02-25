import { Message } from "@bfchain/protobuf";
import { SPECIAL_ASSET_TYPE, EXCHANGE_DIRECTION } from "@bfchain/core-model-constants";
export declare class ToExchangeSpecialAssetModel extends Message<ToExchangeSpecialAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeSpecialAssetJSON> {
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
    exchangeNumber: string;
    exchangeAssetType: SPECIAL_ASSET_TYPE;
    exchangeDirection: EXCHANGE_DIRECTION;
    get to(): {
        magic: string;
        chainName: string;
        toExchangeAsset: string;
        amount: string | undefined;
    };
    get be(): {
        magic: string;
        chainName: string;
        assetType: string;
        amount: string | undefined;
    };
    toJSON(): {
        cipherPublicKeys: string[];
        toExchangeSource: string;
        beExchangeSource: string;
        toExchangeChainName: string;
        beExchangeChainName: string;
        toExchangeAsset: string;
        beExchangeAsset: string;
        exchangeNumber: string;
        exchangeAssetType: SPECIAL_ASSET_TYPE;
        exchangeDirection: EXCHANGE_DIRECTION;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<ToExchangeSpecialAssetModel>): T;
}
export declare class ToExchangeSpecialAssetAssetModel extends Message<ToExchangeSpecialAssetAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeSpecialAssetAssetJSON> {
    toExchangeSpecialAsset: ToExchangeSpecialAssetModel;
    toJSON(): {
        toExchangeSpecialAsset: {
            cipherPublicKeys: string[];
            toExchangeSource: string;
            beExchangeSource: string;
            toExchangeChainName: string;
            beExchangeChainName: string;
            toExchangeAsset: string;
            beExchangeAsset: string;
            exchangeNumber: string;
            exchangeAssetType: SPECIAL_ASSET_TYPE;
            exchangeDirection: EXCHANGE_DIRECTION;
        };
    };
}
