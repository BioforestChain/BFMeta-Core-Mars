export declare class ChainAssetInfo implements BFChainCore.AssetInfoJSON {
    magic: string;
    assetType: string;
    constructor(magic: string, assetType: string);
}
export declare class ChainAssetInfoHelper {
    isChainAssetInfo(chainAssetInfo: BFChainCore.AssetInfoJSON): boolean;
    getAssetInfo(magic: string, assetType: string): ChainAssetInfo;
}
