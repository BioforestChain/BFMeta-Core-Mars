import { Message, Field, Type, Long } from "@bfchain/protobuf";
import { Fraction, FractionBigIntModel } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import { RoundDelegateRemarkModel } from "./roundDelegateRemark";
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
 * GenesisBlockRemark 模型
 *
 */
@Type.d("GenesisBlockRemarkModel")
export class GenesisBlockRemarkModel extends RoundDelegateRemarkModel<GenesisBlockRemarkModel>
  implements BFChainCore.RemarkJSONToModelType<BFChainCore.GenesisBlockRemarkJSON> {
  /**链资产名 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  assetType!: string;
  /**链名 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  chainName!: string;
  /**网络标识符 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  magic!: string;
  /**区块链网络识别码 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  bnid!: BNID_TYPE;
  /**链的创世时间 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint64")
  beginEpochTimeLong!: Long;
  get beginEpochTime() {
    return this.beginEpochTimeLong.toNumber();
  }
  set beginEpochTime(v) {
    this.beginEpochTimeLong = Long.fromNumber(v);
  }
  /**创世节点地址 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  genesisNodeAddress!: string;
  /**创始账户初始余额 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  generateTotalAmount!: string;
  /**交易每个字节最小手续费 */
  @Field.d(GenesisBlockRemarkModel.INC++, Fraction)
  minTransactionFeePerByte!: Fraction;
  /**区块最大长度 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxPayloadLength!: number;
  /**区块最大 tps */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxTPSPerBlock!: number;
  /**最大交易长度 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxTransactionSize!: number;
  /**最大区块 remark 长度 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxBlockRemarkSize!: number;
  /**区块不同数量大于某个值时同步前需要先共识的 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  consessusBeforeSyncBlockDiff!: number;
  /**每轮可处理的受托人交易数量 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxDelegateTxsPerRound!: number;
  /**资产赠送最大可获取次数 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxGrabTimesOfGiftAsset!: number;
  /**发行资产最小的持有本链资产数量 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  issueAssetMinChainAsset!: string;
  /**注册链最小的持有本链资产数量 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  registerChainMinChainAsset!: string;
  /**链资产和数字资产的兑换比例 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  chainAssetAndDigitalAssetExchangeRate!: number;
  /**链资产的奖励权重 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  chainAssetRewardWeight!: number;
  /**交易量的奖励权重 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  numberOfTransactionRewardWeight!: number;
  /**交易的发起高度和确认高度最大的区块高度间隔 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  maxApplyAndConfirmedBlockHeightDiff!: number;
  /**每轮的区块数量 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  blockPerRound!: number;
  /**创世受托人数量 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  delegates!: number;
  /**是否允许受托人连续参与打块竞选 */
  @Field.d(GenesisBlockRemarkModel.INC++, "bool")
  whetherToAllowDelegateContinusElections!: boolean;
  /**区块时间间隔 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32", "required")
  forgeInterval!: number;
  /**奖励比例 */
  @Field.d(GenesisBlockRemarkModel.INC++, RewardPercentModel, "required")
  rewardPercent!: RewardPercentModel;
  /**端口号 */
  @Field.d(GenesisBlockRemarkModel.INC++, PortsModel, "required")
  ports!: PortsModel;
  /**奖励里程 */
  @Field.d(GenesisBlockRemarkModel.INC++, RewardPerBlock, "required")
  rewardPerBlock!: RewardPerBlock;
  /**区块处理信息 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  debug!: string;
  /**备注信息 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  info!: string;
  /**区块参与度 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  blockParticipation!: string;
  /**打块账户权益 */
  @Field.d(GenesisBlockRemarkModel.INC++, "string")
  generatorEquity!: string;
  /**参与度 流通的链资产总量 的 计算比重 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  participationTotalChainAsset!: number;
  /**参与度 总交易量 的 计算比重 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  participationNumberOfTransaction!: number;
  /**参与度 参与的账户总数 的 计算比重 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  participationNumberOfAccount!: number;
  /**参与度 总手续费 的 计算比重 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  participationTotalFee!: number;
  @Field.d(GenesisBlockRemarkModel.INC++, TransactionPowOfWorkConfigModel)
  transactionPowOfWorkConfig!: TransactionPowOfWorkConfigModel;
  /**前 n 个块 交易的 pow豁免 */
  @Field.d(GenesisBlockRemarkModel.INC++, "uint32")
  powOfWorkExemptionBlocks!: number;
  toJSON(): BFChainCore.GenesisBlockRemarkJSON {
    const res: BFChainCore.GenesisBlockRemarkJSON = Object.assign(
      {
        assetType: this.assetType,
        chainName: this.chainName,
        magic: this.magic,
        bnid: this.bnid,
        beginEpochTime: this.beginEpochTime,
        genesisNodeAddress: this.genesisNodeAddress,
        generateTotalAmount: this.generateTotalAmount,
        minTransactionFeePerByte: this.minTransactionFeePerByte,
        maxPayloadLength: this.maxPayloadLength,
        maxTPSPerBlock: this.maxTPSPerBlock,
        maxTransactionSize: this.maxTransactionSize,
        maxBlockRemarkSize: this.maxBlockRemarkSize,
        consessusBeforeSyncBlockDiff: this.consessusBeforeSyncBlockDiff,
        maxDelegateTxsPerRound: this.maxDelegateTxsPerRound,
        maxGrabTimesOfGiftAsset: this.maxGrabTimesOfGiftAsset,
        issueAssetMinChainAsset: this.issueAssetMinChainAsset,
        registerChainMinChainAsset: this.registerChainMinChainAsset,
        chainAssetAndDigitalAssetExchangeRate: this.chainAssetAndDigitalAssetExchangeRate,
        chainAssetRewardWeight: this.chainAssetRewardWeight,
        numberOfTransactionRewardWeight: this.numberOfTransactionRewardWeight,
        maxApplyAndConfirmedBlockHeightDiff: this.maxApplyAndConfirmedBlockHeightDiff,
        blockPerRound: this.blockPerRound,
        delegates: this.delegates,
        whetherToAllowDelegateContinusElections: this.whetherToAllowDelegateContinusElections,
        forgeInterval: this.forgeInterval,
        rewardPercent: this.rewardPercent.toJSON(),
        ports: this.ports.toJSON(),
        rewardPerBlock: this.rewardPerBlock.toJSON(),
        debug: this.debug,
        info: this.info,
        blockParticipation: this.blockParticipation,
        generatorEquity: this.generatorEquity,
        participationTotalChainAsset: this.participationTotalChainAsset,
        participationNumberOfTransaction: this.participationNumberOfTransaction,
        participationNumberOfAccount: this.participationNumberOfAccount,
        participationTotalFee: this.participationTotalFee,
        transactionPowOfWorkConfig: this.transactionPowOfWorkConfig.toJSON(),
        powOfWorkExemptionBlocks: this.powOfWorkExemptionBlocks,
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
    object: BFChainProtobuf.ObjectFromType<GenesisBlockRemarkModel>,
  ) {
    const res = super.fromObject(object) as GenesisBlockRemarkModel;
    if (res !== object) {
      object.beginEpochTime && (res.beginEpochTime = object.beginEpochTime);
    }
    return (res as unknown) as T;
  }
}
