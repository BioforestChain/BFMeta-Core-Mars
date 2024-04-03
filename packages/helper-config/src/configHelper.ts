import { deepMix } from "@bfchain/util-deepmix";
import { Injectable } from "@bfchain/util-dep-inject";
import { FractionBigIntModel } from "@bfchain/core-model-common";
import { cacheGetter, cleanAllGetterCache } from "@bfchain/util-decorator";
import { MapEventEmitter as EventEmitter } from "@bfchain/util-event-map-emitter";
type GenesisBlock = import("@bfchain/core-model-block").GenesisBlock;

export enum NetType {
  TESTNET = 0,
  MAINNET = 1,
}

@Injectable("config")
export class ConfigHelper {
  private hookedGenesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>;
  constructor(
    public readonly genesisBlock:
      | GenesisBlock
      | BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>,
    public business: string,
  ) {
    this._hookBlockMap.set(genesisBlock.version, genesisBlock);
    this.hookedGenesisBlock = this.genesisBlock;
  }

  readonly events = new EventEmitter<{
    hookGenesisBlockApply: [BFChainCore.ConfigHelper];
  }>();

  private _hookBlockMap = new Map<
    number,
    BFChainCore.DeepPartial<BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>>
  >();
  private _applyHookGenesisBlock() {
    const vbList = [...this._hookBlockMap].sort((vb1, vb2) => vb1[0] - vb2[0]);
    this.hookedGenesisBlock = deepMix(
      this.genesisBlock,
      ...vbList.map((vb) => ({ ...vb[1], version: vb[0] })),
    );
    cleanAllGetterCache(this);
    //HookGenesisBlock更新生效，推送事件
    this.events.emit("hookGenesisBlockApply", this.toJSON());
  }
  setHookGenesisBlock(
    version: number,
    hookBlock: BFChainCore.DeepPartial<BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>>,
  ) {
    this._hookBlockMap.set(version, hookBlock);
    this._applyHookGenesisBlock();
  }
  getHookGenesisBlock(version: number) {
    return this._hookBlockMap.get(version);
  }
  rollBackHookGenesisBlock(version: number) {
    if (this._hookBlockMap.delete(version)) {
      this._applyHookGenesisBlock();
    }
  }

  /**获取区块版本号 */
  @cacheGetter
  get version() {
    return this.hookedGenesisBlock.version;
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
  get initials() {
    return this.bnid;
  }

  /**创世账户公钥 */
  @cacheGetter
  get genesisAccountPublicKey() {
    return this.hookedGenesisBlock.generatorPublicKey;
  }

  //#region 来自创世块的共识配置
  /**链名 */
  @cacheGetter
  get chainName() {
    return this.hookedGenesisBlock.asset.genesisAsset.chainName;
  }
  /**链主权益名 */
  @cacheGetter
  get assetType() {
    return this.hookedGenesisBlock.asset.genesisAsset.assetType;
  }
  /**链网络标识符 */
  @cacheGetter
  get magic() {
    return this.hookedGenesisBlock.asset.genesisAsset.magic;
  }
  /**链网络类型，只能是 'b' 或 'c'，b 为正式网络，c 为测试网络 */
  @cacheGetter
  get bnid() {
    return this.hookedGenesisBlock.asset.genesisAsset.bnid;
  }
  /**链创世时间 */
  @cacheGetter
  get beginEpochTime() {
    return this.hookedGenesisBlock.asset.genesisAsset.beginEpochTime;
  }
  /**链创世位名 */
  @cacheGetter
  get genesisLocationName() {
    return this.hookedGenesisBlock.asset.genesisAsset.genesisLocationName;
  }
  /**链创世账户初始持有的主权益量 */
  @cacheGetter
  get genesisAmount() {
    return this.hookedGenesisBlock.asset.genesisAsset.genesisAmount;
  }
  /**链主权益总量 */
  @cacheGetter
  get maxSupply() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxSupply;
  }
  /**链事件每字节需要支付的最小手续费 */
  @cacheGetter
  get minTransactionFeePerByte() {
    return this.hookedGenesisBlock.asset.genesisAsset.minTransactionFeePerByte;
  }
  /**链上事件体最大字节数 */
  @cacheGetter
  get maxTransactionSize() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxTransactionSize;
  }
  /**每笔交易允许携带的最大 blob 长度 */
  @cacheGetter
  get maxTransactionBlobSize() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxTransactionBlobSize;
  }
  /**链上区块体最大字节数 */
  @cacheGetter
  get maxBlockSize() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxBlockSize;
  }
  /**每个区块允许携带的最大 blob 长度 */
  @cacheGetter
  get maxBlockBlobSize() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxBlockBlobSize;
  }
  /**链上区块体最大处理的事件 tps */
  @cacheGetter
  get maxTPSPerBlock() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxTPSPerBlock;
  }
  /**删除分叉时至少需要落后的高度 */
  @cacheGetter
  get consessusBeforeSyncBlockDiff() {
    return this.hookedGenesisBlock.asset.genesisAsset.consessusBeforeSyncBlockDiff;
  }
  /**权益赠送事件最大可抢次数 */
  @cacheGetter
  get maxGrabTimesOfGiftAsset() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxGrabTimesOfGiftAsset;
  }
  /**发行权益的账户最小持有的链主权益数量 */
  @cacheGetter
  get issueAssetMinChainAsset() {
    // btgm 1000 个
    if (this.magic === "RRJJO") {
      return "100000000000";
    }
    return this.hookedGenesisBlock.asset.genesisAsset.issueAssetMinChainAsset;
  }
  /**冻结的主权益数允许发行的最大权益数量 */
  @cacheGetter
  get maxMultipleOfAssetAndMainAsset() {
    // btgm 100w倍
    if (this.magic === "RRJJO") {
      return {
        numerator: "1000000",
        denominator: "1",
      };
    }
    return this.hookedGenesisBlock.asset.genesisAsset.maxMultipleOfAssetAndMainAsset;
  }
  /**发行非同质资产模板的账户最小持有的主权益数量 */
  @cacheGetter
  get issueEntityFactoryMinChainAsset() {
    return this.hookedGenesisBlock.asset.genesisAsset.issueEntityFactoryMinChainAsset;
  }
  /**发行非同质资产模板的账户最小持有的主权益数量 */
  @cacheGetter
  get maxMultipleOfEntityAndMainAsset() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxMultipleOfEntityAndMainAsset;
  }
  /**注册创世块的账户最小持有的主权益数量 */
  @cacheGetter
  get registerChainMinChainAsset() {
    return this.hookedGenesisBlock.asset.genesisAsset.registerChainMinChainAsset;
  }
  /**最大的过期区块间隔数量 */
  @cacheGetter
  get maxApplyAndConfirmedBlockHeightDiff() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxApplyAndConfirmedBlockHeightDiff;
  }
  /**每轮的区块数量 */
  @cacheGetter
  get blockPerRound() {
    return this.hookedGenesisBlock.asset.genesisAsset.blockPerRound;
  }
  /**是否允许锻造者连续参与竞选 */
  @cacheGetter
  get whetherToAllowGeneratorContinusElections() {
    return this.hookedGenesisBlock.asset.genesisAsset.whetherToAllowGeneratorContinusElections;
  }
  /**区块间隔 */
  @cacheGetter
  get forgeInterval() {
    return this.hookedGenesisBlock.asset.genesisAsset.forgeInterval;
  }
  /**区块基础奖励 */
  @cacheGetter
  get basicRewards() {
    return this.hookedGenesisBlock.asset.genesisAsset.basicRewards;
  }
  /**区块链端口号，JSON 对象 */
  @cacheGetter
  get ports() {
    return this.hookedGenesisBlock.asset.genesisAsset.ports;
  }
  //#endregion

  //#region 一些特殊的字段，也是来自传世快，但理论上不应该允许改动的
  @cacheGetter
  get generatorPublicKey() {
    return this.hookedGenesisBlock.generatorPublicKey;
  }
  @cacheGetter
  get signature() {
    return this.hookedGenesisBlock.signature;
  }
  /**下一轮的打块账户列表 */
  @cacheGetter
  get nextRoundGenerators() {
    return this.hookedGenesisBlock.asset.genesisAsset.nextRoundGenerators;
  }

  /**blob 手续费的倍数比例，创世账户初始余额 / blobFeeMultipleRatio = 倍数 */
  get blobFeeMultipleRatio() {
    const ratio: BFChainCore.FractionJSON<bigint> = {
      numerator: BigInt(this.genesisAmount),
      denominator: BigInt(3145600000000000),
    };
    return ratio;
  }

  toJSON(): BFChainCore.ConfigHelper {
    return {
      version: this.version,
      miniUnit: this.miniUnit,
      chainName: this.chainName,
      assetType: this.assetType,
      magic: this.magic,
      bnid: this.bnid,
      beginEpochTime: this.beginEpochTime,
      genesisLocationName: this.genesisLocationName,
      genesisAmount: this.genesisAmount,
      maxSupply: this.maxSupply,
      minTransactionFeePerByte: this.minTransactionFeePerByte,
      maxTransactionSize: this.maxTransactionSize,
      maxTransactionBlobSize: this.maxTransactionBlobSize,
      maxBlockSize: this.maxBlockSize,
      maxBlockBlobSize: this.maxBlockBlobSize,
      maxTPSPerBlock: this.maxTPSPerBlock,
      consessusBeforeSyncBlockDiff: this.consessusBeforeSyncBlockDiff,
      maxGrabTimesOfGiftAsset: this.maxGrabTimesOfGiftAsset,
      issueAssetMinChainAsset: this.issueAssetMinChainAsset,
      maxMultipleOfAssetAndMainAsset: this.maxMultipleOfAssetAndMainAsset,
      issueEntityFactoryMinChainAsset: this.issueEntityFactoryMinChainAsset,
      maxMultipleOfEntityAndMainAsset: this.maxMultipleOfEntityAndMainAsset,
      registerChainMinChainAsset: this.registerChainMinChainAsset,
      maxApplyAndConfirmedBlockHeightDiff: this.maxApplyAndConfirmedBlockHeightDiff,
      blockPerRound: this.blockPerRound,
      whetherToAllowGeneratorContinusElections: this.whetherToAllowGeneratorContinusElections,
      forgeInterval: this.forgeInterval,
      basicRewards: this.basicRewards,
      ports: this.ports,
    };
  }
  //#endregion
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
