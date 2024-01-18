import { Message, Field, Type, Long } from "@bfchain/protobuf";
import { Fraction, FractionBigIntModel } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { RoundDelegateModel } from "./roundDelegate";
import { BNID_TYPE } from "@bfchain/core-model-constants";

/**
 * ports 模型
 *
 */
@Type.d("PortsModel")
export class PortsModel
  extends Message<PortsModel>
  implements BFChainCore.JSONToModelType<BFChainCore.PortsJSON>
{
  /**默认端口号/区块链端口号 */
  @Field.d(1, "uint32")
  port!: number;
  toJSON() {
    return {
      port: this.port,
    };
  }
}

/**
 * GenesisBlock 区块 asset 模型
 *
 */
@Type.d("GenesisAssetModel")
export class GenesisAssetModel
  extends RoundDelegateModel<GenesisAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GenesisAssetJSON>
{
  /**链名 */
  @Field.d(GenesisAssetModel.INC++, "string")
  chainName!: string;
  /**链资产名 */
  @Field.d(GenesisAssetModel.INC++, "string")
  assetType!: string;
  /**网络标识符 */
  @Field.d(GenesisAssetModel.INC++, "string")
  magic!: string;
  /**区块链网络识别码 */
  @Field.d(GenesisAssetModel.INC++, "string")
  bnid!: BNID_TYPE;
  /**链的创世时间 */
  @Field.d(GenesisAssetModel.INC++, "uint64")
  beginEpochTimeLong!: Long;
  get beginEpochTime() {
    return this.beginEpochTimeLong.toNumber();
  }
  set beginEpochTime(v) {
    this.beginEpochTimeLong = Long.fromNumber(v, true);
  }
  /**创世位名 */
  @Field.d(GenesisAssetModel.INC++, "string")
  genesisLocationName!: string;
  /**创始账户初始余额 */
  @Field.d(GenesisAssetModel.INC++, "string")
  genesisAmount!: string;
  /**链主权益总量 */
  @Field.d(GenesisAssetModel.INC++, "string")
  maxSupply!: string;
  /**交易每个字节最小手续费 */
  @Field.d(GenesisAssetModel.INC++, Fraction)
  minTransactionFeePerByte!: Fraction;
  /**最大交易长度 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxTransactionSize!: number;
  /**每笔交易允许携带的最大 blob 长度 */
  @Field.d(GenesisAssetModel.INC++, "uint64", "required")
  maxTransactionBlobSizeLong!: Long;
  get maxTransactionBlobSize() {
    return this.maxTransactionBlobSizeLong.toNumber();
  }
  set maxTransactionBlobSize(v) {
    this.maxTransactionBlobSizeLong = Long.fromNumber(v, true);
  }
  /**最大区块长度，包含区块头和 asset */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxBlockSize!: number;
  /**每个区块允许携带的最大 blob 长度 */
  @Field.d(GenesisAssetModel.INC++, "uint64", "required")
  maxBlockBlobSizeLong!: Long;
  get maxBlockBlobSize() {
    return this.maxBlockBlobSizeLong.toNumber();
  }
  set maxBlockBlobSize(v) {
    this.maxBlockBlobSizeLong = Long.fromNumber(v, true);
  }
  /**区块最大 tps */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxTPSPerBlock!: number;
  /**区块不同数量大于某个值时同步前需要先共识的 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  consessusBeforeSyncBlockDiff!: number;
  /**资产赠送最大可获取次数 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxGrabTimesOfGiftAsset!: number;
  /**发行资产最小的持有本链资产数量 */
  @Field.d(GenesisAssetModel.INC++, "string")
  issueAssetMinChainAsset!: string;
  /**冻结的主权益数允许发行的最大权益数量 */
  @Field.d(GenesisAssetModel.INC++, FractionBigIntModel)
  maxMultipleOfAssetAndMainAsset!: FractionBigIntModel;
  /**发行非同质资产模板最小的持有本链资产数量 */
  @Field.d(GenesisAssetModel.INC++, "string", "required")
  issueEntityFactoryMinChainAsset!: string;
  /**冻结的主权益数允许发行的最大非同质权益数量 */
  @Field.d(GenesisAssetModel.INC++, FractionBigIntModel)
  maxMultipleOfEntityAndMainAsset!: FractionBigIntModel;
  /**注册链最小的持有本链资产数量 */
  @Field.d(GenesisAssetModel.INC++, "string")
  registerChainMinChainAsset!: string;
  /**交易的发起高度和确认高度最大的区块高度间隔 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxApplyAndConfirmedBlockHeightDiff!: number;
  /**每轮的区块数量 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  blockPerRound!: number;
  /**创世受托人数量 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  delegates!: number;
  /**是否允许受托人连续参与打块竞选 */
  @Field.d(GenesisAssetModel.INC++, "bool")
  whetherToAllowDelegateContinusElections!: boolean;
  /**区块时间间隔 */
  @Field.d(GenesisAssetModel.INC++, "uint32", "required")
  forgeInterval!: number;
  @Field.d(GenesisAssetModel.INC++, "string")
  /**区块基础奖励 */
  basicRewards!: string;
  /**端口号 */
  @Field.d(GenesisAssetModel.INC++, PortsModel, "required")
  ports!: PortsModel;
  /**块内资产变动账户生成的 hash */
  @Field.d(GenesisAssetModel.INC++, "bytes", "optional")
  assetChangeBuffer?: Uint8Array;
  get assetChangeHash() {
    if (this.assetChangeBuffer === undefined) {
      return undefined;
    }
    return getHexFromArrayBuffer(this.assetChangeBuffer);
  }
  set assetChangeHash(value: string | undefined) {
    this.assetChangeBuffer = parseHexToArrayBuffer(value);
  }

  toJSON(): BFChainCore.GenesisAssetJSON {
    const res: BFChainCore.GenesisAssetJSON = Object.assign(
      {
        chainName: this.chainName,
        assetType: this.assetType,
        magic: this.magic,
        bnid: this.bnid,
        beginEpochTime: this.beginEpochTime,
        genesisLocationName: this.genesisLocationName,
        genesisAmount: this.genesisAmount,
        maxSupply: this.maxSupply,
        minTransactionFeePerByte: this.minTransactionFeePerByte.toJSON(),
        maxTransactionSize: this.maxTransactionSize,
        maxTransactionBlobSize: this.maxTransactionBlobSize,
        maxBlockSize: this.maxBlockSize,
        maxBlockBlobSize: this.maxBlockBlobSize,
        maxTPSPerBlock: this.maxTPSPerBlock,
        consessusBeforeSyncBlockDiff: this.consessusBeforeSyncBlockDiff,
        maxGrabTimesOfGiftAsset: this.maxGrabTimesOfGiftAsset,
        issueAssetMinChainAsset: this.issueAssetMinChainAsset,
        maxMultipleOfAssetAndMainAsset: this.maxMultipleOfAssetAndMainAsset.toJSON(),
        issueEntityFactoryMinChainAsset: this.issueEntityFactoryMinChainAsset,
        maxMultipleOfEntityAndMainAsset: this.maxMultipleOfEntityAndMainAsset.toJSON(),
        registerChainMinChainAsset: this.registerChainMinChainAsset,
        maxApplyAndConfirmedBlockHeightDiff: this.maxApplyAndConfirmedBlockHeightDiff,
        blockPerRound: this.blockPerRound,
        delegates: this.delegates,
        whetherToAllowDelegateContinusElections: this.whetherToAllowDelegateContinusElections,
        forgeInterval: this.forgeInterval,
        basicRewards: this.basicRewards,
        ports: this.ports.toJSON(),
      },
      super.toJSON(),
    ) as any;
    this.assetChangeHash && (res.assetChangeHash = this.assetChangeHash);
    return res;
  }
  @cacheBytesGetter
  getBytes() {
    return this.$type.encode(this).finish();
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<GenesisAssetModel>,
  ) {
    const res = super.fromObject(object) as GenesisAssetModel;
    if (res !== object) {
      object.beginEpochTime !== undefined && (res.beginEpochTime = object.beginEpochTime);
      object.maxTransactionBlobSize !== undefined &&
        (res.maxTransactionBlobSize = object.maxTransactionBlobSize);
      object.maxBlockBlobSize !== undefined && (res.maxBlockBlobSize = object.maxBlockBlobSize);
      object.assetChangeHash !== undefined && (res.assetChangeHash = object.assetChangeHash);
    }
    return res as unknown as T;
  }
}

/**
 * GenesisBlock 区块 asset 外层模型
 */
@Type.d("GenesisBlockAssetModel")
export class GenesisBlockAssetModel
  extends Message<GenesisBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GenesisBlockAssetJSON>
{
  @Field.d(1, GenesisAssetModel)
  genesisAsset!: GenesisAssetModel;
  toJSON() {
    return {
      genesisAsset: this.genesisAsset.toJSON(),
    };
  }
}
