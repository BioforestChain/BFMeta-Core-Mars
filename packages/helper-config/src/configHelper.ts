import { Injectable } from "@bfchain/util-dep-inject";
import { cacheGetter } from "@bfchain/util-decorator";
type GenesisBlock = import("@bfchain/core-model-block").GenesisBlock;

export enum NetType {
  TESTNET = 0,
  MAINNET = 1,
}

@Injectable("config")
export class ConfigHelper {
  constructor(
    public readonly genesisBlock:
      | GenesisBlock
      | BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>,
    public business: string,
  ) {}
  /**获取交易最大有效期 */
  get maxApplyAndConfirmedBlockHeightDiff() {
    return this.genesisBlock.asset.genesisAsset.maxApplyAndConfirmedBlockHeightDiff;
  }
  /**获取区块版本号 */
  @cacheGetter
  get version() {
    return this.genesisBlock.version;
  }
  /**每轮锻造的区块数量 */
  @cacheGetter
  get blockPerRound() {
    return this.genesisBlock.asset.genesisAsset.blockPerRound;
  }
  /**链资产名 */
  @cacheGetter
  get assetType() {
    return this.genesisBlock.asset.genesisAsset.assetType;
  }
  /**链名 */
  @cacheGetter
  get chainName() {
    return this.genesisBlock.asset.genesisAsset.chainName;
  }
  /**链网络标识符 */
  @cacheGetter
  get magic() {
    return this.genesisBlock.asset.genesisAsset.magic;
  }
  /**链奖励里程 */
  @cacheGetter
  get milestones() {
    return this.genesisBlock.asset.genesisAsset.rewardPerBlock;
  }
  /**链创世账户初始账户余额 */
  @cacheGetter
  get generateTotalAmount() {
    return this.genesisBlock.asset.genesisAsset.generateTotalAmount;
  }
  /**链创世链域名 */
  @cacheGetter
  get genesisLocationName() {
    return this.genesisBlock.asset.genesisAsset.genesisLocationName;
  }
  /**获取资产的最小单位 */
  @cacheGetter
  get miniUnit() {
    return "1";
  }
  /**网络类型 */
  @cacheGetter
  get netType() {
    return this.initials === "b" ? NetType.MAINNET : NetType.TESTNET;
  }
  /**地址前缀 */
  @cacheGetter
  get initials() {
    return this.genesisBlock.asset.genesisAsset.bnid;
  }
  /**打块的时间间隔 */
  @cacheGetter
  get forgeInterval() {
    return this.genesisBlock.asset.genesisAsset.forgeInterval;
  }
  /**账户参与度权重比 */
  @cacheGetter
  get accountParticipationWeightRatio() {
    return this.genesisBlock.asset.genesisAsset.accountParticipationWeightRatio;
  }
  /**区块参与度权重比 */
  @cacheGetter
  get blockParticipationWeightRatio() {
    return this.genesisBlock.asset.genesisAsset.blockParticipationWeightRatio;
  }
  /**交易 pow 参数*/
  // get tpowDiffFormula() {
  //   return this.genesisBlock.asset.genesisAsset.tpowDiffFormula;
  // }
  /**创世时间 */
  @cacheGetter
  get beginEpochTime() {
    return this.genesisBlock.asset.genesisAsset.beginEpochTime;
  }
  /**获取交易的最大字节数 */
  @cacheGetter
  get maxTransactionSize() {
    return this.genesisBlock.asset.genesisAsset.maxTransactionSize;
  }
  /**最大区块大小 */
  @cacheGetter
  get maxBlockSize() {
    return this.genesisBlock.asset.genesisAsset.maxBlockSize;
  }
  /**tpow 豁免高度 */
  @cacheGetter
  get tpowOfWorkExemptionBlocks() {
    return this.genesisBlock.asset.genesisAsset.tpowOfWorkExemptionBlocks;
  }
  /**创世账户公钥 */
  @cacheGetter
  get genesisAccountPublicKey() {
    return this.genesisBlock.generatorPublicKey;
  }

  /**资产赠送最大可获取次数 */
  @cacheGetter
  get maxGrabTimesOfGiftAsset() {
    return this.genesisBlock.asset.genesisAsset.maxGrabTimesOfGiftAsset;
  }
  /**发行数字资产最小持有的链资产数量 */
  @cacheGetter
  get issueAssetMinChainAsset() {
    return this.genesisBlock.asset.genesisAsset.issueAssetMinChainAsset;
  }
  /**注册链最小持有的链资产数量 */
  @cacheGetter
  get registerChainMinChainAsset() {
    return this.genesisBlock.asset.genesisAsset.registerChainMinChainAsset;
  }
  /**交易每个字节最小手续费 */
  @cacheGetter
  get minTransactionFeePerByte() {
    return this.genesisBlock.asset.genesisAsset.minTransactionFeePerByte;
  }
  /**每个区块可处理的最大交易数量 */
  @cacheGetter
  get maxTPSPerBlock() {
    return this.genesisBlock.asset.genesisAsset.maxTPSPerBlock;
  }
  /**每轮可处理的受托人交易数量 */
  @cacheGetter
  get maxDelegateTxsPerRound() {
    return this.genesisBlock.asset.genesisAsset.maxDelegateTxsPerRound;
  }
  /**创世受托人数量 */
  @cacheGetter
  get delegates() {
    return this.genesisBlock.asset.genesisAsset.delegates;
  }
  /**获取奖励分配比例 */
  @cacheGetter
  get rewardPercent() {
    return this.genesisBlock.asset.genesisAsset.rewardPercent;
  }
  /**全网平均算力 */
  get averageComputingPower() {
    return this.genesisBlock.asset.genesisAsset.averageComputingPower;
  }
  get transactionPowOfWorkConfig() {
    return this.genesisBlock.asset.genesisAsset.transactionPowOfWorkConfig;
  }
}
@Injectable("configMap")
export class ConfigHelperMap {
  private _map = new Map<string, ConfigHelper>();

  get clear() {
    return this._map.clear.bind(this._map);
  }
  @cacheGetter
  get delete() {
    return this._map.delete.bind(this._map);
  }
  @cacheGetter
  get forEach() {
    return this._map.forEach.bind(this._map);
  }
  @cacheGetter
  get get() {
    return this._map.get.bind(this._map);
  }
  @cacheGetter
  get has() {
    return this._map.has.bind(this._map);
  }
  @cacheGetter
  get set() {
    return this._map.set.bind(this._map);
  }
  get size() {
    return this._map.size;
  }
  /** Returns an iterable of entries in the map. */
  @cacheGetter
  get [Symbol.iterator]() {
    return this._map[Symbol.iterator].bind(this._map);
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  @cacheGetter
  get entries() {
    return this._map.entries.bind(this._map);
  }

  /**
   * Returns an iterable of keys in the map
   */
  @cacheGetter
  get keys() {
    return this._map.keys.bind(this._map);
  }

  /**
   * Returns an iterable of values in the map
   */
  @cacheGetter
  get values() {
    return this._map.values.bind(this._map);
  }
  get [Symbol.toStringTag]() {
    return "EasyMap";
  }
}
