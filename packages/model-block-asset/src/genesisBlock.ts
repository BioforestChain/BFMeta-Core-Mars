import { Message, Field, Type, Long } from "@bfchain/protobuf";
import { Fraction, FractionBigIntModel, RateModel } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { RoundDelegateModel } from "./roundDelegate";
import { BNID_TYPE } from "@bfchain/core-model-block-base";

/**
 * RewardPercent 模型
 *
 */
@Type.d("RewardPercentModel")
export class RewardPercentModel extends Message<RewardPercentModel>
  implements BFChainCore.JSONToModelType<BFChainCore.RewardPercentJSON> {
  /**分配给投票账户的奖励占区块总奖励的比例 */
  @Field.d(1, Fraction)
  votePercent!: Fraction;
  /**分配给打块账户的奖励占区块总奖励的比例 */
  @Field.d(2, Fraction)
  forgePercent!: Fraction;
  toJSON() {
    return {
      votePercent: this.votePercent.toJSON(),
      forgePercent: this.forgePercent.toJSON(),
    };
  }
}

/**
 * Rewards 模型
 *
 */
@Type.d("RewardPerBlock")
export class RewardPerBlock extends Message<RewardPerBlock>
  implements BFChainCore.JSONToModelType<BFChainCore.RewardPerBlockJSON> {
  /**奖励变更区块高度 */
  @Field.d(1, "uint32", "repeated")
  heights!: number[];
  /**每阶段奖励资产数量 */
  @Field.d(2, "string", "repeated")
  rewards!: string[];
  toJSON() {
    return {
      heights: this.heights.slice(),
      rewards: this.rewards.slice(),
    };
  }
}

/**
 * ports 模型
 *
 */
@Type.d("PortsModel")
export class PortsModel extends Message<PortsModel>
  implements BFChainCore.JSONToModelType<BFChainCore.PortsJSON> {
  /**默认端口号/区块链端口号 */
  @Field.d(1, "uint32")
  port!: number;
  /**节点扫描端口 */
  @Field.d(2, "uint32")
  scan_peer_port!: number;
  toJSON() {
    return {
      port: this.port,
      scan_peer_port: this.scan_peer_port,
    };
  }
}

@Type.d("TransactionPowOfWorkConfigModel")
export class TransactionPowOfWorkConfigModel extends Message<TransactionPowOfWorkConfigModel>
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionPowOfWorkConfigJSON> {
  @Field.d(1, FractionBigIntModel)
  growthFactor!: FractionBigIntModel;
  @Field.d(2, Fraction)
  participationRatio!: Fraction;
  toJSON() {
    return {
      growthFactor: this.growthFactor.toJSON(),
      participationRatio: this.participationRatio.toJSON(),
    };
  }
}

/**
 * 比例模型
 */
@Type.d("AccountParticipationWeightRatioModel")
export class AccountParticipationWeightRatioModel
  extends Message<AccountParticipationWeightRatioModel>
  implements BFChainUtil.JSONAble<BFChainCore.AccountParticipationWeightRatioJSON> {
  /**账户持有权益量权重 */
  @Field.d(1, "uint32")
  balanceWeight!: number;
  /**账户事件量权重 */
  @Field.d(2, "uint32")
  numberOfTransactionsWeight!: number;
  toJSON() {
    return {
      balanceWeight: this.balanceWeight,
      numberOfTransactionsWeight: this.numberOfTransactionsWeight,
    };
  }
}

/**
 * 比例模型
 */
@Type.d("BlockParticipationWeightRatioModel")
export class BlockParticipationWeightRatioModel extends Message<BlockParticipationWeightRatioModel>
  implements BFChainUtil.JSONAble<BFChainCore.BlockParticipationWeightRatioJSON> {
  /**块内涉及的权益总量权重 */
  @Field.d(1, "uint32")
  balanceWeight!: number;
  /**块内事件量权重 */
  @Field.d(2, "uint32")
  numberOfTransactionsWeight!: number;
  toJSON() {
    return {
      balanceWeight: this.balanceWeight,
      numberOfTransactionsWeight: this.numberOfTransactionsWeight,
    };
  }
}

/**
 * GenesisBlock 区块 asset 模型
 *
 */
@Type.d("GenesisAssetModel")
export class GenesisAssetModel extends RoundDelegateModel<GenesisAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GenesisAssetJSON> {
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
    this.beginEpochTimeLong = Long.fromNumber(v);
  }
  /**创世链域名 */
  @Field.d(GenesisAssetModel.INC++, "string")
  genesisLocationName!: string;
  /**创始账户初始余额 */
  @Field.d(GenesisAssetModel.INC++, "string")
  generateTotalAmount!: string;
  /**交易每个字节最小手续费 */
  @Field.d(GenesisAssetModel.INC++, Fraction)
  minTransactionFeePerByte!: Fraction;
  /**最大交易长度 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxTransactionSize!: number;
  /**最大区块长度，包含区块头和 asset */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxBlockSize!: number;
  /**区块最大 tps */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxTPSPerBlock!: number;
  /**区块不同数量大于某个值时同步前需要先共识的 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  consessusBeforeSyncBlockDiff!: number;
  /**每轮可处理的受托人交易数量 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxDelegateTxsPerRound!: number;
  /**资产赠送最大可获取次数 */
  @Field.d(GenesisAssetModel.INC++, "uint32")
  maxGrabTimesOfGiftAsset!: number;
  /**发行资产最小的持有本链资产数量 */
  @Field.d(GenesisAssetModel.INC++, "string")
  issueAssetMinChainAsset!: string;
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
  /**奖励比例 */
  @Field.d(GenesisAssetModel.INC++, RewardPercentModel, "required")
  rewardPercent!: RewardPercentModel;
  /**端口号 */
  @Field.d(GenesisAssetModel.INC++, PortsModel, "required")
  ports!: PortsModel;
  /**奖励里程 */
  @Field.d(GenesisAssetModel.INC++, RewardPerBlock, "required")
  rewardPerBlock!: RewardPerBlock;
  /**账户参与度权重比 */
  @Field.d(GenesisAssetModel.INC++, AccountParticipationWeightRatioModel, "required")
  accountParticipationWeightRatio!: AccountParticipationWeightRatioModel;
  /**区块参与度权重比 */
  @Field.d(GenesisAssetModel.INC++, BlockParticipationWeightRatioModel, "required")
  blockParticipationWeightRatio!: BlockParticipationWeightRatioModel;
  // /**tpow 计算公式 */
  // @Field.d(GenesisAssetModel.INC++, "string", "required")
  // tpowDiffFormula!: string;
  /**全网平均算了 */
  @Field.d(GenesisAssetModel.INC++, "uint32", "required")
  averageComputingPower!: number;
  /**前 n 个块 交易的 pow豁免 */
  @Field.d(GenesisAssetModel.INC++, "uint32", "required")
  tpowOfWorkExemptionBlocks!: number;
  @Field.d(GenesisAssetModel.INC++, TransactionPowOfWorkConfigModel)
  transactionPowOfWorkConfig!: TransactionPowOfWorkConfigModel;
  toJSON(): BFChainCore.GenesisAssetJSON {
    const res: BFChainCore.GenesisAssetJSON = Object.assign(
      {
        chainName: this.chainName,
        assetType: this.assetType,
        magic: this.magic,
        bnid: this.bnid,
        beginEpochTime: this.beginEpochTime,
        genesisLocationName: this.genesisLocationName,
        generateTotalAmount: this.generateTotalAmount,
        minTransactionFeePerByte: this.minTransactionFeePerByte.toJSON(),
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
        rewardPercent: this.rewardPercent.toJSON(),
        ports: this.ports.toJSON(),
        rewardPerBlock: this.rewardPerBlock.toJSON(),
        accountParticipationWeightRatio: this.accountParticipationWeightRatio.toJSON(),
        blockParticipationWeightRatio: this.blockParticipationWeightRatio.toJSON(),
        // tpowDiffFormula: this.tpowDiffFormula,
        averageComputingPower: this.averageComputingPower,
        tpowOfWorkExemptionBlocks: this.tpowOfWorkExemptionBlocks,
        transactionPowOfWorkConfig: this.transactionPowOfWorkConfig.toJSON(),
      },
      super.toJSON(),
    );
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
      object.beginEpochTime && (res.beginEpochTime = object.beginEpochTime);
    }
    return (res as unknown) as T;
  }
}

/**
 * GenesisBlock 区块 asset 外层模型
 */
@Type.d("GenesisBlockAssetModel")
export class GenesisBlockAssetModel extends Message<GenesisBlockAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GenesisBlockAssetJSON> {
  @Field.d(1, GenesisAssetModel)
  genesisAsset!: GenesisAssetModel;
  toJSON() {
    return {
      genesisAsset: this.genesisAsset.toJSON(),
    };
  }
}
