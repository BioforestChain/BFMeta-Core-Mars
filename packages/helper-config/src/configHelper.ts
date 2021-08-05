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
  constructor(
    public readonly genesisBlock:
      | GenesisBlock
      | BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>,
    public business: string,
  ) {
    this._hookBlockMap.set(genesisBlock.version, genesisBlock);
  }

  readonly events = new EventEmitter<{
    hookGenesisBlockApply: [BFChainCore.ConfigHelper];
  }>();

  private hookedGenesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON> =
    this.genesisBlock; //deepMix(this.genesisBlock,get)
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
  get milestones() {
    return this.rewardPerBlock;
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
  /**链上区块体最大字节数 */
  @cacheGetter
  get maxBlockSize() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxBlockSize;
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
  /**每轮能处理的注册受托人数量 */
  @cacheGetter
  get maxDelegateTxsPerRound() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxDelegateTxsPerRound;
  }
  /**权益赠送事件最大可抢次数 */
  @cacheGetter
  get maxGrabTimesOfGiftAsset() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxGrabTimesOfGiftAsset;
  }
  /**发行权益的账户最小持有的链主权益数量 */
  @cacheGetter
  get issueAssetMinChainAsset() {
    return this.hookedGenesisBlock.asset.genesisAsset.issueAssetMinChainAsset;
  }
  /**冻结的主权益数允许发行的最大权益数量 */
  @cacheGetter
  get maxMultipleOfAssetAndMainAsset() {
    const maxMultipleOfAssetAndMainAsset =
      this.hookedGenesisBlock.asset.genesisAsset.maxMultipleOfAssetAndMainAsset;

    return maxMultipleOfAssetAndMainAsset &&
      maxMultipleOfAssetAndMainAsset.numerator &&
      maxMultipleOfAssetAndMainAsset.denominator
      ? maxMultipleOfAssetAndMainAsset
      : // FIXME: 暂时使用外网最大倍数
        FractionBigIntModel.fromObject({
          numerator: "19999600008175832963412690",
          denominator: "1",
        });
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
  /**创世受托人数量 */
  @cacheGetter
  get delegates() {
    return this.hookedGenesisBlock.asset.genesisAsset.delegates;
  }
  /**是否允许受托人连续参与竞选 */
  @cacheGetter
  get whetherToAllowDelegateContinusElections() {
    return this.hookedGenesisBlock.asset.genesisAsset.whetherToAllowDelegateContinusElections;
  }
  /**区块间隔 */
  @cacheGetter
  get forgeInterval() {
    return this.hookedGenesisBlock.asset.genesisAsset.forgeInterval;
  }
  /**奖励分配比例，JSON 对象 */
  @cacheGetter
  get rewardPercent() {
    return this.hookedGenesisBlock.asset.genesisAsset.rewardPercent;
  }
  /**区块链端口号，JSON 对象 */
  @cacheGetter
  get ports() {
    return this.hookedGenesisBlock.asset.genesisAsset.ports;
  }
  /**区块奖励，JSON 对象 */
  @cacheGetter
  get rewardPerBlock() {
    return this.hookedGenesisBlock.asset.genesisAsset.rewardPerBlock;
  }
  /**账户参与度权重比，JSON 对象 */
  @cacheGetter
  get accountParticipationWeightRatio() {
    return this.hookedGenesisBlock.asset.genesisAsset.accountParticipationWeightRatio;
  }
  /**区块参与度权重比，JSON 对象 */
  @cacheGetter
  get blockParticipationWeightRatio() {
    return this.hookedGenesisBlock.asset.genesisAsset.blockParticipationWeightRatio;
  }
  /**构建tpow的难度系数 */
  @cacheGetter
  get averageComputingPower() {
    return this.hookedGenesisBlock.asset.genesisAsset.averageComputingPower;
  }
  /**tpow豁免的区块高度 */
  @cacheGetter
  get tpowOfWorkExemptionBlocks() {
    return this.hookedGenesisBlock.asset.genesisAsset.tpowOfWorkExemptionBlocks;
  }
  /**tpow配置，JSON对象 */
  @cacheGetter
  get transactionPowOfWorkConfig() {
    return this.hookedGenesisBlock.asset.genesisAsset.transactionPowOfWorkConfig;
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
  get nextRoundDelegates() {
    return this.hookedGenesisBlock.asset.genesisAsset.nextRoundDelegates;
  }
  /**新注册的受托人 */
  @cacheGetter
  get newDelegates() {
    return this.hookedGenesisBlock.asset.genesisAsset.newDelegates;
  }
  /**上一轮投票账户中的最大轮末主权益量 */
  @cacheGetter
  get maxBeginBalance() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxBeginBalance;
  }
  /**上一轮投票账户中最大的事件量 */
  @cacheGetter
  get maxTxCount() {
    return this.hookedGenesisBlock.asset.genesisAsset.maxTxCount;
  }
  /**上一轮投票账户的最大轮末主权益量和上一轮投票账户的最大事件的比 */
  @cacheGetter
  get rate() {
    return this.hookedGenesisBlock.asset.genesisAsset.rate;
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
      minTransactionFeePerByte: this.minTransactionFeePerByte,
      maxTransactionSize: this.maxTransactionSize,
      maxBlockSize: this.maxBlockSize,
      maxTPSPerBlock: this.maxTPSPerBlock,
      consessusBeforeSyncBlockDiff: this.consessusBeforeSyncBlockDiff,
      maxDelegateTxsPerRound: this.maxDelegateTxsPerRound,
      maxGrabTimesOfGiftAsset: this.maxGrabTimesOfGiftAsset,
      issueAssetMinChainAsset: this.issueAssetMinChainAsset,
      registerChainMinChainAsset: this.registerChainMinChainAsset,
      maxApplyAndConfirmedBlockHeightDiff: this.maxApplyAndConfirmedBlockHeightDiff,
      blockPerRound: this.blockPerRound,
      delegates: this.delegates,
      whetherToAllowDelegateContinusElections: this.whetherToAllowDelegateContinusElections,
      forgeInterval: this.forgeInterval,
      rewardPercent: this.rewardPercent,
      ports: this.ports,
      rewardPerBlock: this.rewardPerBlock,
      accountParticipationWeightRatio: this.accountParticipationWeightRatio,
      blockParticipationWeightRatio: this.blockParticipationWeightRatio,
      averageComputingPower: this.averageComputingPower,
      tpowOfWorkExemptionBlocks: this.tpowOfWorkExemptionBlocks,
      transactionPowOfWorkConfig: this.transactionPowOfWorkConfig,
      maxMultipleOfAssetAndMainAsset: this.maxMultipleOfAssetAndMainAsset,
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
