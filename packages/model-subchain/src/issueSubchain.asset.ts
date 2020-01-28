import { Message, Field, Type, Long } from "@bfchain/protobuf";
import {
  RewardPercentModel,
  PortsModel,
  RewardPerBlock,
  TransactionPowOfWorkConfigModel,
} from "@bfchain/core-model-block-remark";
import { GenesisBlock } from "@bfchain/core-model-block";
import { Fraction } from "@bfchain/core-model-common";

let subchain_field_index_acc = 1;
/**
 * issueSubchain 交易 asset 模型
 *
 */
@Type.d("IssueSubchainModel")
export class IssueSubchainModel extends Message<IssueSubchainModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueSubchainJSON> {
  /**子链名称 */
  @Field.d(subchain_field_index_acc++, "string")
  chainName!: string;
  /**子链名称缩写 */
  @Field.d(subchain_field_index_acc++, "string")
  assetType!: string;
  /**子链网络标识符 */
  @Field.d(subchain_field_index_acc++, "string")
  magic!: string;
  /**区块链网络识别码 */
  @Field.d(subchain_field_index_acc++, "string")
  bnid!: string;
  /**子链的创世时间 */
  @Field.d(subchain_field_index_acc++, "uint64")
  beginEpochTimeLong!: Long;
  get beginEpochTime() {
    return this.beginEpochTimeLong.toNumber();
  }
  set beginEpochTime(v) {
    this.beginEpochTimeLong = Long.fromNumber(v);
  }
  /**创世节点地址 */
  @Field.d(subchain_field_index_acc++, "string")
  genesisNodeAddress!: string;
  /**创世账户初始余额 */
  @Field.d(subchain_field_index_acc++, "string")
  generateTotalAmount!: string;
  /**交易每个字节最小的手续费 */
  @Field.d(subchain_field_index_acc++, Fraction)
  minTransactionFeePerByte!: Fraction;
  /**区块最大长度 */
  @Field.d(subchain_field_index_acc++, "uint32")
  maxPayloadLength!: number;
  /**区块最大 tps */
  @Field.d(subchain_field_index_acc++, "uint32")
  maxTPSPerBlock!: number;
  /**最大交易长度 */
  @Field.d(subchain_field_index_acc++, "uint32")
  maxTransactionSize!: number;
  /**最大区块 remark 长度 */
  @Field.d(subchain_field_index_acc++, "uint32")
  maxBlockRemarkSize!: number;
  /**区块不同数量大于某个值时同步前需要先共识的 */
  @Field.d(subchain_field_index_acc++, "uint32")
  consessusBeforeSyncBlockDiff!: number;
  /**每轮可处理的受托人交易数量 */
  @Field.d(subchain_field_index_acc++, "uint32")
  maxDelegateTxsPerRound!: number;
  /**发行资产最小的持有本链资产数量 */
  @Field.d(subchain_field_index_acc++, "string")
  issueAssetMinChainAsset!: string;
  /**发行子链最小的持有本链资产数量 */
  @Field.d(subchain_field_index_acc++, "string")
  issueSubchainMinChainAsset!: string;
  /**链资产和数字资产的兑换比例 */
  @Field.d(subchain_field_index_acc++, "uint32")
  chainAssetAndDigitalAssetExchangeRate!: number;
  /**链资产和子链资产的兑换比例 */
  @Field.d(subchain_field_index_acc++, "uint32")
  chainAssetAndSubchainAssetExchangeRate!: number;
  /**链资产的奖励权重 */
  @Field.d(subchain_field_index_acc++, "uint32")
  chainAssetRewardWeight!: number;
  /**交易量的奖励权重 */
  @Field.d(subchain_field_index_acc++, "uint32")
  numberOfTransactionRewardWeight!: number;
  /**交易的发起高度和确认高度最大的区块高度间隔 */
  @Field.d(subchain_field_index_acc++, "uint32")
  maxApplyAndConfirmedBlockHeightDiff!: number;
  /**前 n 个块 交易 pow 豁免 */
  @Field.d(subchain_field_index_acc++, "uint32")
  powOfWorkExemptionBlocks!: number;
  /**每轮的区块数量 */
  @Field.d(subchain_field_index_acc++, "uint32")
  blockPerRound!: number;
  /**创世受托人数量 */
  @Field.d(subchain_field_index_acc++, "uint32")
  delegates!: number;
  /**区块时间间隔 */
  @Field.d(subchain_field_index_acc++, "uint32")
  forgeInterval!: number;
  /**奖励比例 */
  @Field.d(subchain_field_index_acc++, RewardPercentModel)
  rewardPercent!: RewardPercentModel;
  /**端口号 */
  @Field.d(subchain_field_index_acc++, PortsModel)
  ports!: PortsModel;
  /**奖励里程 */
  @Field.d(subchain_field_index_acc++, RewardPerBlock)
  rewardPerBlock!: RewardPerBlock;
  /**参与度 流通的链资产总量 的 计算比重 */
  @Field.d(subchain_field_index_acc++, "uint32")
  participationTotalChainAsset!: number;
  /**参与度 总交易量 的 计算比重 */
  @Field.d(subchain_field_index_acc++, "uint32")
  participationNumberOfTransaction!: number;
  /**参与度 参与的账户总数 的 计算比重 */
  @Field.d(subchain_field_index_acc++, "uint32")
  participationNumberOfAccount!: number;
  /**参与度 总手续费 的 计算比重 */
  @Field.d(subchain_field_index_acc++, "uint32")
  participationTotalFee!: number;
  @Field.d(subchain_field_index_acc++, TransactionPowOfWorkConfigModel)
  transactionPowOfWorkConfig!: TransactionPowOfWorkConfigModel;
  /**创世块 */
  @Field.d(subchain_field_index_acc++, GenesisBlock)
  genesisBlock!: GenesisBlock;
  toJSON() {
    return {
      chainName: this.chainName,
      assetType: this.assetType,
      magic: this.magic,
      bnid: this.bnid,
      beginEpochTime: this.beginEpochTime,
      genesisNodeAddress: this.genesisNodeAddress,
      generateTotalAmount: this.generateTotalAmount,
      minTransactionFeePerByte: this.minTransactionFeePerByte.toJSON(),
      maxPayloadLength: this.maxPayloadLength,
      maxTPSPerBlock: this.maxTPSPerBlock,
      maxTransactionSize: this.maxTransactionSize,
      maxBlockRemarkSize: this.maxBlockRemarkSize,
      consessusBeforeSyncBlockDiff: this.consessusBeforeSyncBlockDiff,
      maxDelegateTxsPerRound: this.maxDelegateTxsPerRound,
      issueAssetMinChainAsset: this.issueAssetMinChainAsset,
      issueSubchainMinChainAsset: this.issueSubchainMinChainAsset,
      chainAssetAndDigitalAssetExchangeRate: this.chainAssetAndDigitalAssetExchangeRate,
      chainAssetAndSubchainAssetExchangeRate: this.chainAssetAndSubchainAssetExchangeRate,
      chainAssetRewardWeight: this.chainAssetRewardWeight,
      numberOfTransactionRewardWeight: this.numberOfTransactionRewardWeight,
      maxApplyAndConfirmedBlockHeightDiff: this.maxApplyAndConfirmedBlockHeightDiff,
      powOfWorkExemptionBlocks: this.powOfWorkExemptionBlocks,
      blockPerRound: this.blockPerRound,
      delegates: this.delegates,
      forgeInterval: this.forgeInterval,
      rewardPercent: this.rewardPercent.toJSON(),
      ports: this.ports.toJSON(),
      rewardPerBlock: this.rewardPerBlock.toJSON(),
      participationTotalChainAsset: this.participationTotalChainAsset,
      participationNumberOfTransaction: this.participationNumberOfTransaction,
      participationNumberOfAccount: this.participationNumberOfAccount,
      participationTotalFee: this.participationTotalFee,
      transactionPowOfWorkConfig: this.transactionPowOfWorkConfig.toJSON(),
      genesisBlock: this.genesisBlock.toJSON(),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<IssueSubchainModel>,
  ) {
    const res = super.fromObject(object) as IssueSubchainModel;
    if (res !== object) {
      object.beginEpochTime && (res.beginEpochTime = object.beginEpochTime);
    }
    return (res as unknown) as T;
  }
}

/**
 * issueSubchain 交易 asset 外层模型
 *
 */
@Type.d("IssueSubchainAssetModel")
export class IssueSubchainAssetModel extends Message<IssueSubchainAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.IssueSubchainAssetJSON> {
  @Field.d(1, IssueSubchainModel)
  issueSubchain!: IssueSubchainModel;
  toJSON() {
    return {
      issueSubchain: this.issueSubchain.toJSON(),
    };
  }
}
