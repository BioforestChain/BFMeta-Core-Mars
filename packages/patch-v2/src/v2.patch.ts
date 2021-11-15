import { V2_GenesisBlockFactory } from "./atom-patch";
import { PatchBase } from "@bfchain/core-patch-base";
import { Writer, Reader, util } from "@bfchain/protobuf";
import { Injectable, Inject, deepMix } from "@bfchain/util";
import { EventLogicVerifier } from "@bfchain/core-transaction-logic-verifier";
import { BLOCK_FACTORY_TYPES_MAP, GenesisBlockFactory } from "@bfchain/core-block";
import { BLOCK_TYPES_BASE, GenesisAssetModel, FractionBigIntModel } from "@bfchain/core-model";

const GenesisAssetModelSetup = GenesisAssetModel.$type.setup();
GenesisAssetModel.encode = GenesisAssetModelSetup.encode = function GenesisAssetModel$encode(
  m: any,
  w: Writer,
) {
  if (!w) w = Writer.create();
  if (m.newDelegates != null && m.newDelegates.length) {
    for (var i = 0; i < m.newDelegates.length; ++i) w.uint32(10).string(m.newDelegates[i]);
  }
  if (m.maxBeginBalance != null && m.maxBeginBalance !== "") w.uint32(18).string(m.maxBeginBalance);
  if (m.maxTxCount != null && m.maxTxCount !== 0) w.uint32(24).uint32(m.maxTxCount);
  if (m.nextRoundDelegates != null && m.nextRoundDelegates.length) {
    for (var i = 0; i < m.nextRoundDelegates.length; ++i)
      m.nextRoundDelegates[i] &&
        m.$type._types[34].encode(m.nextRoundDelegates[i], w.uint32(34).fork()).ldelim();
  }
  if (m.chainName != null && m.chainName !== "") w.uint32(42).string(m.chainName);
  if (m.assetType != null && m.assetType !== "") w.uint32(50).string(m.assetType);
  if (m.magic != null && m.magic !== "") w.uint32(58).string(m.magic);
  if (m.bnid != null && m.bnid !== "") w.uint32(66).string(m.bnid);
  if (
    m.beginEpochTimeLong != null &&
    m.beginEpochTimeLong !== { __isLong__: true, low: 0, high: 0, unsigned: true }
  )
    w.uint32(72).uint64(m.beginEpochTimeLong);
  if (m.genesisLocationName != null && m.genesisLocationName !== "")
    w.uint32(82).string(m.genesisLocationName);
  if (m.genesisAmount != null && m.genesisAmount !== "") w.uint32(90).string(m.genesisAmount);
  if (m.minTransactionFeePerByte != null)
    m.minTransactionFeePerByte &&
      m.$type._types[7].encode(m.minTransactionFeePerByte, w.uint32(98).fork()).ldelim();
  if (m.maxTransactionSize != null && m.maxTransactionSize !== 0)
    w.uint32(104).uint32(m.maxTransactionSize);
  if (m.maxBlockSize != null && m.maxBlockSize !== 0) w.uint32(112).uint32(m.maxBlockSize);
  if (m.maxTPSPerBlock != null && m.maxTPSPerBlock !== 0) w.uint32(120).uint32(m.maxTPSPerBlock);
  if (m.consessusBeforeSyncBlockDiff != null && m.consessusBeforeSyncBlockDiff !== 0)
    w.uint32(128).uint32(m.consessusBeforeSyncBlockDiff);
  if (m.maxDelegateTxsPerRound != null && m.maxDelegateTxsPerRound !== 0)
    w.uint32(136).uint32(m.maxDelegateTxsPerRound);
  if (m.maxGrabTimesOfGiftAsset != null && m.maxGrabTimesOfGiftAsset !== 0)
    w.uint32(144).uint32(m.maxGrabTimesOfGiftAsset);
  if (m.issueAssetMinChainAsset != null && m.issueAssetMinChainAsset !== "")
    w.uint32(154).string(m.issueAssetMinChainAsset);
  if (m.registerChainMinChainAsset != null && m.registerChainMinChainAsset !== "")
    w.uint32(162).string(m.registerChainMinChainAsset);
  if (m.maxApplyAndConfirmedBlockHeightDiff != null && m.maxApplyAndConfirmedBlockHeightDiff !== 0)
    w.uint32(168).uint32(m.maxApplyAndConfirmedBlockHeightDiff);
  if (m.blockPerRound != null && m.blockPerRound !== 0) w.uint32(176).uint32(m.blockPerRound);
  if (m.delegates != null && m.delegates !== 0) w.uint32(184).uint32(m.delegates);
  if (
    m.whetherToAllowDelegateContinusElections != null &&
    m.whetherToAllowDelegateContinusElections !== false
  )
    w.uint32(192).bool(m.whetherToAllowDelegateContinusElections);
  if (m.forgeInterval != null && m.forgeInterval !== 0) w.uint32(200).uint32(m.forgeInterval);
  if (m.rewardPercent != null)
    m.rewardPercent && m.$type._types[21].encode(m.rewardPercent, w.uint32(210).fork()).ldelim();
  if (m.ports != null) m.ports && m.$type._types[22].encode(m.ports, w.uint32(218).fork()).ldelim();
  if (m.rewardPerBlock != null)
    m.rewardPerBlock && m.$type._types[23].encode(m.rewardPerBlock, w.uint32(226).fork()).ldelim();
  if (m.accountParticipationWeightRatio != null)
    m.accountParticipationWeightRatio &&
      m.$type._types[24].encode(m.accountParticipationWeightRatio, w.uint32(234).fork()).ldelim();
  if (m.blockParticipationWeightRatio != null)
    m.blockParticipationWeightRatio &&
      m.$type._types[25].encode(m.blockParticipationWeightRatio, w.uint32(242).fork()).ldelim();
  if (m.averageComputingPower != null && m.averageComputingPower !== 0)
    w.uint32(248).uint32(m.averageComputingPower);
  if (m.tpowOfWorkExemptionBlocks != null && m.tpowOfWorkExemptionBlocks !== 0)
    w.uint32(256).uint32(m.tpowOfWorkExemptionBlocks);
  if (m.transactionPowOfWorkConfig != null)
    m.transactionPowOfWorkConfig &&
      m.$type._types[28].encode(m.transactionPowOfWorkConfig, w.uint32(266).fork()).ldelim();
  if (m.maxMultipleOfAssetAndMainAsset != null) {
    if (m.maxMultipleOfAssetAndMainAsset.denominator) {
      m.maxMultipleOfAssetAndMainAsset &&
        m.$type._types[29].encode(m.maxMultipleOfAssetAndMainAsset, w.uint32(274).fork()).ldelim();
    }
  }
  if (m.issueEntityFactoryMinChainAsset != null && m.issueEntityFactoryMinChainAsset !== "")
    w.uint32(282).string(m.issueEntityFactoryMinChainAsset);
  return w;
};
GenesisAssetModel.decode = GenesisAssetModelSetup.decode = function GenesisAssetModel$decode(
  r: Reader | Uint8Array,
  l?: number,
) {
  if (!(r instanceof Reader)) r = Reader.create(r);
  var c = l === undefined ? r.len : r.pos + l,
    m = new this.ctor();
  m.newDelegates = [];
  m.nextRoundDelegates = [];
  while (r.pos < c) {
    var t = r.uint32();
    switch (t >>> 3) {
      case 5:
        m.chainName = r.string();
        break;
      case 6:
        m.assetType = r.string();
        break;
      case 7:
        m.magic = r.string();
        break;
      case 8:
        m.bnid = r.string();
        break;
      case 9:
        m.beginEpochTimeLong = (r as any).uint64();
        break;
      case 10:
        m.genesisLocationName = r.string();
        break;
      case 11:
        m.genesisAmount = r.string();
        break;
      case 12:
        m.minTransactionFeePerByte = m.$type._types[7].decode(r, r.uint32());
        break;
      case 13:
        m.maxTransactionSize = r.uint32();
        break;
      case 14:
        m.maxBlockSize = r.uint32();
        break;
      case 15:
        m.maxTPSPerBlock = r.uint32();
        break;
      case 16:
        m.consessusBeforeSyncBlockDiff = r.uint32();
        break;
      case 17:
        m.maxDelegateTxsPerRound = r.uint32();
        break;
      case 18:
        m.maxGrabTimesOfGiftAsset = r.uint32();
        break;
      case 19:
        m.issueAssetMinChainAsset = r.string();
        break;
      case 20:
        m.registerChainMinChainAsset = r.string();
        break;
      case 21:
        m.maxApplyAndConfirmedBlockHeightDiff = r.uint32();
        break;
      case 22:
        m.blockPerRound = r.uint32();
        break;
      case 23:
        m.delegates = r.uint32();
        break;
      case 24:
        m.whetherToAllowDelegateContinusElections = r.bool();
        break;
      case 25:
        m.forgeInterval = r.uint32();
        break;
      case 26:
        m.rewardPercent = m.$type._types[21].decode(r, r.uint32());
        break;
      case 27:
        m.ports = m.$type._types[22].decode(r, r.uint32());
        break;
      case 28:
        m.rewardPerBlock = m.$type._types[23].decode(r, r.uint32());
        break;
      case 29:
        m.accountParticipationWeightRatio = m.$type._types[24].decode(r, r.uint32());
        break;
      case 30:
        m.blockParticipationWeightRatio = m.$type._types[25].decode(r, r.uint32());
        break;
      case 31:
        m.averageComputingPower = r.uint32();
        break;
      case 32:
        m.tpowOfWorkExemptionBlocks = r.uint32();
        break;
      case 33:
        m.transactionPowOfWorkConfig = m.$type._types[28].decode(r, r.uint32());
        break;
      case 34:
        m.maxMultipleOfAssetAndMainAsset = m.$type._types[29].decode(r, r.uint32());
        break;
      case 35:
        m.issueEntityFactoryMinChainAsset = r.string();
        break;
      case 1:
        m.newDelegates.push(r.string());
        break;
      case 2:
        m.maxBeginBalance = r.string();
        break;
      case 3:
        m.maxTxCount = r.uint32();
        break;
      case 4:
        m.nextRoundDelegates.push(m.$type._types[34].decode(r, r.uint32()));
        break;
      default:
        r.skipType(t & 7);
        break;
    }
  }
  if (m.chainName == null)
    throw util.ProtocolError("missing required 'chainName'", { instance: m });
  if (m.assetType == null)
    throw util.ProtocolError("missing required 'assetType'", { instance: m });
  if (m.magic == null) throw util.ProtocolError("missing required 'magic'", { instance: m });
  if (m.bnid == null) throw util.ProtocolError("missing required 'bnid'", { instance: m });
  if (m.beginEpochTimeLong == null)
    throw util.ProtocolError("missing required 'beginEpochTimeLong'", { instance: m });
  if (m.genesisLocationName == null)
    throw util.ProtocolError("missing required 'genesisLocationName'", { instance: m });
  if (m.genesisAmount == null)
    throw util.ProtocolError("missing required 'genesisAmount'", { instance: m });
  if (m.minTransactionFeePerByte == null)
    throw util.ProtocolError("missing required 'minTransactionFeePerByte'", { instance: m });
  if (m.maxTransactionSize == null)
    throw util.ProtocolError("missing required 'maxTransactionSize'", { instance: m });
  if (m.maxBlockSize == null)
    throw util.ProtocolError("missing required 'maxBlockSize'", { instance: m });
  if (m.maxTPSPerBlock == null)
    throw util.ProtocolError("missing required 'maxTPSPerBlock'", { instance: m });
  if (m.consessusBeforeSyncBlockDiff == null)
    throw util.ProtocolError("missing required 'consessusBeforeSyncBlockDiff'", { instance: m });
  if (m.maxDelegateTxsPerRound == null)
    throw util.ProtocolError("missing required 'maxDelegateTxsPerRound'", { instance: m });
  if (m.maxGrabTimesOfGiftAsset == null)
    throw util.ProtocolError("missing required 'maxGrabTimesOfGiftAsset'", { instance: m });
  if (m.issueAssetMinChainAsset == null)
    throw util.ProtocolError("missing required 'issueAssetMinChainAsset'", { instance: m });
  if (m.registerChainMinChainAsset == null)
    throw util.ProtocolError("missing required 'registerChainMinChainAsset'", { instance: m });
  if (m.maxApplyAndConfirmedBlockHeightDiff == null)
    throw util.ProtocolError("missing required 'maxApplyAndConfirmedBlockHeightDiff'", {
      instance: m,
    });
  if (m.blockPerRound == null)
    throw util.ProtocolError("missing required 'blockPerRound'", { instance: m });
  if (m.delegates == null)
    throw util.ProtocolError("missing required 'delegates'", { instance: m });
  if (m.whetherToAllowDelegateContinusElections == null)
    throw util.ProtocolError("missing required 'whetherToAllowDelegateContinusElections'", {
      instance: m,
    });
  if (m.forgeInterval == null)
    throw util.ProtocolError("missing required 'forgeInterval'", { instance: m });
  if (m.rewardPercent == null)
    throw util.ProtocolError("missing required 'rewardPercent'", { instance: m });
  if (m.ports == null) throw util.ProtocolError("missing required 'ports'", { instance: m });
  if (m.rewardPerBlock == null)
    throw util.ProtocolError("missing required 'rewardPerBlock'", { instance: m });
  if (m.accountParticipationWeightRatio == null)
    throw util.ProtocolError("missing required 'accountParticipationWeightRatio'", { instance: m });
  if (m.blockParticipationWeightRatio == null)
    throw util.ProtocolError("missing required 'blockParticipationWeightRatio'", { instance: m });
  if (m.averageComputingPower == null)
    throw util.ProtocolError("missing required 'averageComputingPower'", { instance: m });
  if (m.tpowOfWorkExemptionBlocks == null)
    throw util.ProtocolError("missing required 'tpowOfWorkExemptionBlocks'", { instance: m });
  if (m.transactionPowOfWorkConfig == null)
    throw util.ProtocolError("missing required 'transactionPowOfWorkConfig'", { instance: m });
  if (m.maxMultipleOfAssetAndMainAsset == null) m.maxMultipleOfAssetAndMainAsset = undefined;
  // throw util.ProtocolError("missing required 'maxMultipleOfAssetAndMainAsset'",{instance:m})
  if (m.issueEntityFactoryMinChainAsset == null || m.issueEntityFactoryMinChainAsset == "")
    m.issueEntityFactoryMinChainAsset = undefined;
  // throw util.ProtocolError("missing required 'issueEntityFactoryMinChainAsset'",{instance:m})
  if (m.newDelegates == null)
    throw util.ProtocolError("missing required 'newDelegates'", { instance: m });
  if (m.maxBeginBalance == null)
    throw util.ProtocolError("missing required 'maxBeginBalance'", { instance: m });
  if (m.maxTxCount == null)
    throw util.ProtocolError("missing required 'maxTxCount'", { instance: m });
  if (m.nextRoundDelegates == null)
    throw util.ProtocolError("missing required 'nextRoundDelegates'", { instance: m });
  return m;
};

@Injectable()
export class V2_Patch extends PatchBase {
  @Inject(EventLogicVerifier)
  eventLogicVerifier!: EventLogicVerifier;

  readonly name = "patch-v2";
  readonly patchEffectiveAfterHeight = 144486;
  protected _version = 1;
  readonly consensusVersion = 2;
  async upgradeHandler(oldVersion: number, newVersion: number) {
    switch (oldVersion) {
      case 0: {
        {
          /**在合适的条件下，更新共识
           * 如果需要，执行数据库升级。。。。
           */
          this.planAfterHeight(
            this.patchEffectiveAfterHeight,
            () => {
              const oldBlock = this.config.getHookGenesisBlock(this.consensusVersion) || {};
              oldBlock.asset = deepMix(oldBlock.asset, {
                genesisAsset: {
                  maxMultipleOfAssetAndMainAsset: FractionBigIntModel.fromObject({
                    numerator: "100000",
                    denominator: "1",
                  }),
                },
              });
              this.config.setHookGenesisBlock(this.consensusVersion, oldBlock);
              BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, V2_GenesisBlockFactory);
              BLOCK_FACTORY_TYPES_MAP.FK.set(V2_GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
            },
            () => {
              this.config.rollBackHookGenesisBlock(this.consensusVersion);
              BLOCK_FACTORY_TYPES_MAP.KF.set(BLOCK_TYPES_BASE.GENESIS, GenesisBlockFactory);
              BLOCK_FACTORY_TYPES_MAP.FK.set(GenesisBlockFactory, BLOCK_TYPES_BASE.GENESIS);
            },
          );
        }
      }
    }
  }
}
