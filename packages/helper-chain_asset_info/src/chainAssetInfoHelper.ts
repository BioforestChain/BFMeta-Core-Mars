import { Injectable } from "@bfchain/util";
/**链资产类型
 * @TODO rename to KeyAssetInfo
 */
export class ChainAssetInfo implements BFChainCore.AssetInfoJSON {
  constructor(public magic: string, public assetType: string) {}
}
/**链资产类型的缓存 */
const CHAIN_ASSET_INFO_CACHE = new Map<string, ChainAssetInfo>();
const IN_CACHE_WS = new WeakSet<ChainAssetInfo>();
@Injectable()
export class ChainAssetInfoHelper {
  isChainAssetInfo(chainAssetInfo: BFChainCore.AssetInfoJSON) {
    return IN_CACHE_WS.has(chainAssetInfo);
  }
  /**获取链资产类型 */
  getAssetInfo(magic: string, assetType: string) {
    const key = magic + ":" + assetType;
    let chainAssetInfo = CHAIN_ASSET_INFO_CACHE.get(key);
    if (!chainAssetInfo) {
      chainAssetInfo = new ChainAssetInfo(magic, assetType);
      Object.freeze(chainAssetInfo);
      CHAIN_ASSET_INFO_CACHE.set(key, chainAssetInfo);
      IN_CACHE_WS.add(chainAssetInfo);
    }
    return chainAssetInfo;
  }
}
