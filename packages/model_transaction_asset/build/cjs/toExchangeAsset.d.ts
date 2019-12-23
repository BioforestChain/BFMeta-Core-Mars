import { Message } from "@bfchain/protobuf";
import { RateModel } from "@bfchain/core-model-common";
/**
 * exchangeAsset 交易 asset 模型
 *
 */
export declare class ToExchangeAssetModel extends Message<ToExchangeAssetModel> implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAssetJSON> {
    static INC: number;
    /**密钥交换 */
    cipherPublicKeysBuffer: Uint8Array[];
    get cipherPublicKeys(): string[];
    set cipherPublicKeys(cipherTextList: string[]);
    /**用于交换的资产来源链的网络标识符 */
    toExchangeSource: string;
    /**被交换的资产来源链的网络标识符 */
    beExchangeSource: string;
    /**用于交换的资产来源链的链名 */
    toExchangeChainName: string;
    /**被交换的资产来源链的链名 */
    beExchangeChainName: string;
    /**用于交换的资产名 */
    toExchangeAsset: string;
    /**被交换的资产名 */
    beExchangeAsset: string;
    /**用于交换的资产数量 */
    toExchangeNumber: string;
    /**交换的资产比例 */
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
/**
 * exchangeAsset 交易 asset 外层模型
 *
 */
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
//# sourceMappingURL=toExchangeAsset.d.ts.map