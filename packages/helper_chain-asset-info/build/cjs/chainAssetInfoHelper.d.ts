/**链资产类型 */
export declare class ChainAssetInfo implements BFChainCore.AssetInfoJSON {
    magic: string;
    assetType: string;
    constructor(magic: string, assetType: string);
}
export declare class ChainAssetInfoHelper {
    isChainAssetInfo(chainAssetInfo: BFChainCore.AssetInfoJSON): boolean;
    /**获取链资产类型 */
    getAssetInfo(magic: string, assetType: string): ChainAssetInfo;
}
//# sourceMappingURL=chainAssetInfoHelper.d.ts.map