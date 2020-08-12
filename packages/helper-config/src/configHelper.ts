import { Injectable, cacheGetter } from "@bfchain/util";
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
      | BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>,
    public business?: string,
  ) {}
  /**获取交易最大有效期 */
  get maxApplyAndConfirmedBlockHeightDiff() {
    return this.genesisBlock.remark.maxApplyAndConfirmedBlockHeightDiff;
  }
  /**获取区块版本号 */
  @cacheGetter
  get version() {
    return this.genesisBlock.version;
  }
  /**获取最大的 remark 长度 */
  @cacheGetter
  get maxBlockRemarkSize() {
    return this.genesisBlock.remark.maxBlockRemarkSize;
  }
  /**每轮锻造的区块数量 */
  @cacheGetter
  get blockPerRound() {
    return this.genesisBlock.remark.blockPerRound;
  }
  /**链资产名 */
  @cacheGetter
  get assetType() {
    return this.genesisBlock.remark.assetType;
  }
  /**链名 */
  @cacheGetter
  get chainName() {
    return this.genesisBlock.remark.chainName;
  }
  /**链网络标识符 */
  @cacheGetter
  get magic() {
    return this.genesisBlock.remark.magic;
  }
  /**链奖励里程 */
  @cacheGetter
  get milestones() {
    return this.genesisBlock.remark.rewardPerBlock;
  }
  /**链创世账户初始账户余额 */
  @cacheGetter
  get generateTotalAmount() {
    return this.genesisBlock.remark.generateTotalAmount;
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
    return this.genesisBlock.remark.bnid;
  }
  /**打块的时间间隔 */
  @cacheGetter
  get forgeInterval() {
    return this.genesisBlock.remark.forgeInterval;
  }
  /**区块参与度计算权重 */
  @cacheGetter
  get blockParticipationWeight() {
    const {
      participationTotalChainAsset,
      participationNumberOfTransaction,
      participationNumberOfAccount,
      participationTotalFee,
    } = this.genesisBlock.remark;
    return {
      participationTotalChainAsset,
      participationNumberOfTransaction,
      participationNumberOfAccount,
      participationTotalFee,
    };
  }
  /**创世时间 */
  @cacheGetter
  get beginEpochTime() {
    return this.genesisBlock.remark.beginEpochTime;
  }
  /**最大区块大小 */
  @cacheGetter
  get maxPayloadLength() {
    return this.genesisBlock.remark.maxPayloadLength;
  }
  @cacheGetter
  get powOfWorkExemptionBlocks() {
    return this.genesisBlock.remark.powOfWorkExemptionBlocks;
  }
  /**创世账户公钥 */
  @cacheGetter
  get genesisAccountPublicKey() {
    return this.genesisBlock.generatorPublicKey;
  }
  /**获取交易的最大字节数 */
  @cacheGetter
  get maxTransactionSize() {
    return this.genesisBlock.remark.maxTransactionSize;
  }
  /**资产赠送最大可获取次数 */
  @cacheGetter
  get maxGrabTimesOfGiftAsset() {
    return this.genesisBlock.remark.maxGrabTimesOfGiftAsset;
  }
  /**发行数字资产最小持有的链资产数量 */
  @cacheGetter
  get issueAssetMinChainAsset() {
    return this.genesisBlock.remark.issueAssetMinChainAsset;
  }
  /**注册链最小持有的链资产数量 */
  @cacheGetter
  get registerChainMinChainAsset() {
    return this.genesisBlock.remark.registerChainMinChainAsset;
  }
  /**链资产和数字资产的兑换比例 */
  @cacheGetter
  get chainAssetAndDigitalAssetExchangeRate() {
    return this.genesisBlock.remark.chainAssetAndDigitalAssetExchangeRate;
  }
  /**交易每个字节最小手续费 */
  @cacheGetter
  get minTransactionFeePerByte() {
    return this.genesisBlock.remark.minTransactionFeePerByte;
  }
  /**每个区块可处理的最大交易数量 */
  @cacheGetter
  get maxTPSPerBlock() {
    return this.genesisBlock.remark.maxTPSPerBlock;
  }
  /**每轮可处理的受托人交易数量 */
  @cacheGetter
  get maxDelegateTxsPerRound() {
    return this.genesisBlock.remark.maxDelegateTxsPerRound;
  }
  /**创世受托人数量 */
  @cacheGetter
  get delegates() {
    return this.genesisBlock.remark.delegates;
  }
  /**获取奖励分配比例 */
  @cacheGetter
  get rewardPercent() {
    return this.genesisBlock.remark.rewardPercent;
  }
  /**全网平均算力 */
  get averageComputingPower() {
    return this.genesisBlock.remark.transactionPowOfWorkConfig.averageComputingPower;
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
