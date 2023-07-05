import { Injectable } from "@bfchain/util";

@Injectable()
export class MemoryCache {
  private __cacheMap = new Map<string, BFChainCore.Transaction>();

  getCache<T>(key: string) {
    return this.__cacheMap.get(key);
  }
  setCache(key: string, transaction: BFChainCore.Transaction) {
    this.__cacheMap.set(key, transaction);
  }
  clearCache() {
    this.__cacheMap.clear();
  }
}
