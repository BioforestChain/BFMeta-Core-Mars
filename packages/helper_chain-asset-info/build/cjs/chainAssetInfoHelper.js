"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@bfchain/util");
/**链资产类型 */
class ChainAssetInfo {
    constructor(magic, assetType) {
        this.magic = magic;
        this.assetType = assetType;
    }
}
exports.ChainAssetInfo = ChainAssetInfo;
/**链资产类型的缓存 */
const CHAIN_ASSET_INFO_CACHE = new Map();
const IN_CACHE_WS = new WeakSet();
let ChainAssetInfoHelper = class ChainAssetInfoHelper {
    isChainAssetInfo(chainAssetInfo) {
        return IN_CACHE_WS.has(chainAssetInfo);
    }
    /**获取链资产类型 */
    getAssetInfo(magic, assetType) {
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
};
ChainAssetInfoHelper = __decorate([
    util_1.Injectable()
], ChainAssetInfoHelper);
exports.ChainAssetInfoHelper = ChainAssetInfoHelper;
//# sourceMappingURL=chainAssetInfoHelper.js.map