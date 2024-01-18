import type { TransactionInBlock } from "@bfchain/core-model-transaction";
import { BlockFactory } from "./_blockbase";
import { BNID_TYPE } from "@bfchain/core-model-constants";
import { GenesisBlock } from "@bfchain/core-model-block";
import {
  BlockHelper,
  BaseHelper,
  AccountBaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, Inject, ModuleStroge } from "@bfchain/util";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
import { GenerateBlockCore } from "./generateBlock";
import { ReplayBlockCore } from "./replayBlock";
import { VerifyBlockCore } from "./verifyBlock";
const { ArgumentIllegalException } = CoreExceptionGenerator("CONTROLLER", "GenesisBlockFactory");

/**
 * genesisBlock 工厂
 *
 */
@Injectable()
export class GenesisBlockFactory extends BlockFactory<GenesisBlock> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public accountBaseHelper: AccountBaseHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public asymmetricHelper: AsymmetricHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    public blockGeneratorCalculator: BlockGeneratorCalculator,

    public commonBlockVerify: CommonBlockVerify<GenesisBlock>,
    public verifyBlockCore: VerifyBlockCore<GenesisBlock>,
    public generateBlockCore: GenerateBlockCore<GenesisBlock>,
    public replayBlockCore: ReplayBlockCore<GenesisBlock>,

    public moduleMap: ModuleStroge,
  ) {
    super();
  }

  /**
   * 从 json 转出 protobuf
   * JSON格式一般是进程内部通讯在使用,所以JSON格式默认不校验
   *
   * @param blockBody
   */
  async fromJSON(
    blockBody: BFChainCore.BlockJSON<BFChainCore.GenesisBlockAssetJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = GenesisBlock.fromObject(blockBody);
    // if (blockBody.transactions && blockBody.transactions.length > 0) {
    //   block.transactions = blockBody.transactions.map((twi) => {
    //     return this.transactionInBlockFromJSON(twi);
    //   });
    // } else {
    //   block.transactions = [];
    // }
    if (opts && opts.verify) {
      await this.verify(block, opts.config);
    }
    return block;
  }

  /**
   * 校验输入信息
   *
   * @param body
   * @param genesisBlockAsset
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    genesisBlockAsset: BFChainCore.GenesisBlockAssetJSON,
    config = this.config,
  ) {
    await super.verifyBlockBody(body, genesisBlockAsset);

    const { baseHelper } = this;

    const genesisAsset = genesisBlockAsset.genesisAsset;

    if (!genesisAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "genesisBlock",
      });
    }

    const GenesisBlockAsset_Exception_Detail = {
      target: "genesisBlock",
    };

    const assetType = genesisAsset.assetType;
    if (!assetType) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "assetType",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetType(assetType)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `assetType ${genesisAsset.assetType}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const chainName = genesisAsset.chainName;
    if (!chainName) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "chainName",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainName(chainName)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `chainName ${genesisAsset.chainName}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const magic = genesisAsset.magic;
    if (!magic) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "magic",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainMagic(magic)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `magic ${genesisAsset.magic}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const bnid = genesisAsset.bnid;
    if (!bnid) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "bnid",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (bnid !== BNID_TYPE.TESTNET && bnid !== BNID_TYPE.MAINNET) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `bnid ${bnid}`,
        to_target: "remark",
        be_compare_prop: "BNID_TYPE",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.beginEpochTime)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `beginEpochTime ${genesisAsset.beginEpochTime}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const genesisLocationName = genesisAsset.genesisLocationName;
    if (!genesisLocationName) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "genesisLocationName",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidLocationName(genesisLocationName, config.chainName)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `genesisLocationName ${genesisAsset.genesisLocationName}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.genesisAmount) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "genesisAmount",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(genesisAsset.genesisAmount)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `genesisAmount ${genesisAsset.genesisAmount}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.maxSupply) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "maxSupply",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(genesisAsset.maxSupply)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxSupply ${genesisAsset.maxSupply}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveFloatContainZero(genesisAsset.minTransactionFeePerByte)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `minTransactionFeePerByte ${genesisAsset.minTransactionFeePerByte}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxTPSPerBlock)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxTPSPerBlock ${genesisAsset.maxTPSPerBlock}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxTransactionSize)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxTransactionSize ${genesisAsset.maxTransactionSize}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisAsset.maxTransactionBlobSize === undefined) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `maxTransactionBlobSize ${genesisAsset.maxTransactionBlobSize}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isNaturalNumber(genesisAsset.maxTransactionBlobSize)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxTransactionBlobSize ${genesisAsset.maxTransactionBlobSize}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxBlockSize)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxBlockSize ${genesisAsset.maxBlockSize}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (genesisAsset.maxBlockBlobSize === undefined) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `maxBlockBlobSize ${genesisAsset.maxBlockBlobSize}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isNaturalNumber(genesisAsset.maxBlockBlobSize)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxBlockBlobSize ${genesisAsset.maxBlockBlobSize}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(genesisAsset.consessusBeforeSyncBlockDiff)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `consessusBeforeSyncBlockDiff ${genesisAsset.consessusBeforeSyncBlockDiff}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxGrabTimesOfGiftAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxGrabTimesOfGiftAsset ${genesisAsset.maxGrabTimesOfGiftAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.issueAssetMinChainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "issueAssetMinChainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisAsset.issueAssetMinChainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `issueAssetMinChainAsset ${genesisAsset.issueAssetMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.maxMultipleOfAssetAndMainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "maxMultipleOfAssetAndMainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isPositiveBigFloatNotContainZero(genesisAsset.maxMultipleOfAssetAndMainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxMultipleOfAssetAndMainAsset ${genesisAsset.maxMultipleOfAssetAndMainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.issueEntityFactoryMinChainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "issueEntityFactoryMinChainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisAsset.issueEntityFactoryMinChainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `issueEntityFactoryMinChainAsset ${genesisAsset.issueEntityFactoryMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.maxMultipleOfEntityAndMainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "maxMultipleOfEntityAndMainAsset",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (
      !baseHelper.isPositiveBigFloatNotContainZero(genesisAsset.maxMultipleOfEntityAndMainAsset)
    ) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxMultipleOfEntityAndMainAsset ${genesisAsset.maxMultipleOfEntityAndMainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.registerChainMinChainAsset) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `registerChainMinChainAsset ${genesisAsset.registerChainMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(genesisAsset.registerChainMinChainAsset)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `registerChainMinChainAsset ${genesisAsset.registerChainMinChainAsset}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(genesisAsset.maxApplyAndConfirmedBlockHeightDiff)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxApplyAndConfirmedBlockHeightDiff ${genesisAsset.maxApplyAndConfirmedBlockHeightDiff}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const { blockPerRound, forgeInterval, basicRewards, whetherToAllowGeneratorContinusElections } =
      genesisAsset;

    if (!baseHelper.isPositiveInteger(blockPerRound)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `blockPerRound ${blockPerRound}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!basicRewards) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "maxSupply",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetNumber(basicRewards)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `basicRewards ${basicRewards}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isBoolean(whetherToAllowGeneratorContinusElections)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `whetherToAllowGeneratorContinusElections ${whetherToAllowGeneratorContinusElections}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(forgeInterval)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `forgeInterval ${forgeInterval}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (forgeInterval < 5) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_SHOULD_GTE_FIELD, {
        prop: `forgeInterval ${forgeInterval}`,
        field: 5,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.ports) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "ports",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidChainPorts(genesisAsset.ports)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `ports ${genesisAsset.ports}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    if (!genesisAsset.assetChangeHash) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `assetChangeHash`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isValidAssetChangeHash(genesisAsset.assetChangeHash)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `assetChangeHash ${genesisAsset.assetChangeHash}`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }

    const { nextRoundGenerators } = genesisAsset;
    if (!nextRoundGenerators) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: `nextRoundGenerators`,
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (!baseHelper.isArray(nextRoundGenerators)) {
      throw new ArgumentIllegalException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: "nextRoundGenerators",
        to_target: "genesisBlock",
        be_compare_prop: "array",
        ...GenesisBlockAsset_Exception_Detail,
      });
    }
    if (nextRoundGenerators.length !== genesisAsset.blockPerRound) {
      throw new ArgumentIllegalException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `nextRoundGenerators's length ${nextRoundGenerators.length}`,
        to_target: "genesisBlock",
        be_compare_prop: `blockPerRound: ${config.blockPerRound}`,
        be_target: "genesisBlock",
      });
    }
    for (let i = 0; i < nextRoundGenerators.length; i++) {
      const nextRoundGenerator = nextRoundGenerators[i];
      if (!(await this.accountBaseHelper.isAddress(nextRoundGenerator.address))) {
        throw new ArgumentIllegalException(ERROR_LIST.NOT_EXIST, {
          prop: `genesisBlock.nextRoundGenerators[${i}].address ${nextRoundGenerator.address}`,
          target: "genesisBlock.newGenerators",
        });
      }
      if (!this.baseHelper.isNaturalNumber(nextRoundGenerator.numberOfEntities)) {
        throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `nextRoundGenerators[${i}].numberOfEntities ${nextRoundGenerator.numberOfEntities}`,
          target: "genesisBlock.nextRoundGenerators",
        });
      }
    }
  }

  /**
   * 初始化 genesisBlock
   *
   * @param body
   * @param genesisBlockAsset
   */
  _generateBlock(
    body: BFChainCore.BlockBody,
    genesisBlockAsset: BFChainCore.GenesisBlockAssetJSON,
  ) {
    const block = GenesisBlock.fromObject({
      ...body,
      asset: genesisBlockAsset,
    });
    block.generatorPublicKey = body.generatorPublicKey;
    // 绑定区块奖励
    block.reward = "0";

    return block;
  }

  async replayBlock(
    block: BFChainCore.GenesisBlock,
    transactions: AsyncIterable<TransactionInBlock>,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    options: BFChainCore.ReplayBlockOptions = {},
    config = this.config,
  ) {
    await super.replayBlock(block, transactions, eventEmitter, options, config);

    if (options.verifyAsset) {
      await this.checkAssetChangeHash(
        block.height,
        block.asset.genesisAsset.assetChangeHash,
        options,
      );
    }

    return block;
  }
}
