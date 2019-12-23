import { Message } from "@bfchain/protobuf";
import { SPECIAL_ASSET_TYPE, EXCHANGE_DIRECTION } from "@bfchain/core-model-constants";
/**
 * toExchangeSpecialAsset 交易 asset 模型
 *
 */
export declare class ToExchangeSpecialAssetModel extends Message<ToExchangeSpecialAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeSpecialAssetJSON> {
    static INC: number;
    /**密钥交换 */
    cipherPublicKeysBuffer: Uint8Array[];
    get cipherPublicKeys(): string[];
    set cipherPublicKeys(cipherTextList: string[]);
    /**用于交换的域名来源链的网络标识符 */
    toExchangeSource: string;
    /**被交换的资产来源链的网络标识符 */
    beExchangeSource: string;
    /**用于交换的域名来源链的链名 */
    toExchangeChainName: string;
    /**被交换的资产来源链的链名 */
    beExchangeChainName: string;
    /**用于交换的资产名 */
    toExchangeAsset: string;
    /**被交换的资产名 */
    beExchangeAsset: string;
    /**交换的资产数量 */
    exchangeNumber: string;
    exchangeAssetType: SPECIAL_ASSET_TYPE;
    /**交换方向 */
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
/**
 * toExchangeSpecialAsset 交易 asset 外层模型
 *
 */
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
//# sourceMappingURL=toExchangeSpecialAsset.d.ts.map