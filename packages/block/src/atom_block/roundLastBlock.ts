import { BlockFactory } from "./_blockbase";
import { RoundLastBlock } from "@bfchain/core-model-block";
import type { TransactionInBlock } from "@bfchain/core-model-transaction";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, Inject, ModuleStroge } from "@bfchain/util";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
import { VerifyBlockCore } from "./verifyBlock";
import { GenerateBlockCore } from "./generateBlock";
import { ReplayBlockCore } from "./replayBlock";
const { ArgumentIllegalException, ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "CONTROLLER",
  "RoundLastBlockFactory",
);

/**
 * roundLastBlock 工厂
 *
 */
@Injectable()
export class RoundLastBlockFactory extends BlockFactory<RoundLastBlock> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public asymmetricHelper: AsymmetricHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    public blockGeneratorCalculator: BlockGeneratorCalculator,

    public commonBlockVerify: CommonBlockVerify<RoundLastBlock>,
    public verifyBlockCore: VerifyBlockCore<RoundLastBlock>,
    public generateBlockCore: GenerateBlockCore<RoundLastBlock>,
    public replayBlockCore: ReplayBlockCore<RoundLastBlock>,

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
    blockBody: BFChainCore.BlockJSON<BFChainCore.RoundLastBlockAssetJSON>,
    opts?: { verify?: boolean; config?: ConfigHelper },
  ) {
    const block = RoundLastBlock.fromObject(blockBody);
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
   * @param roundLastBlockAsset
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    roundLastBlockAsset: BFChainCore.RoundLastBlockAssetJSON,
    config = this.config,
  ) {
    await super.verifyBlockBody(body, roundLastBlockAsset, config);

    const roundLastAsset = roundLastBlockAsset.roundLastAsset;

    const RoundLastBlockAsset_Exception_Detail = {
      target: "roundLastBlockAsset",
    };

    const { baseHelper } = this;
    if (!roundLastAsset.nextRoundGenerators) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "nextRoundGenerators",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainOnChainHash(roundLastAsset.chainOnChainHash)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `chainOnChainHash ${roundLastAsset.chainOnChainHash}`,
        type: "chainOnChainHash",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }
  }

  /**
   * 初始化 roundLastBlock
   *
   * @param body
   * @param roundLastBlockAsset
   */
  _generateBlock(
    body: BFChainCore.BlockBody,
    roundLastBlockAsset: BFChainCore.RoundLastBlockAssetJSON,
  ) {
    const block = RoundLastBlock.fromObject({
      ...body,
      asset: roundLastBlockAsset,
    });
    /**@TODO 这里要加上手续费奖励 */
    block.reward = this.config.basicRewards;

    return block;
  }

  async replayBlock(
    block: BFChainCore.RoundLastBlock,
    transactions: AsyncIterable<TransactionInBlock>,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    options: BFChainCore.ReplayBlockOptions = {},
    config = this.config,
  ) {
    await super.replayBlock(block, transactions, eventEmitter, options, config);

    if (options.verifyAsset) {
      const { height, asset } = block;

      let transactionGetterHelper = options.transactionGetterHelper;
      if (!transactionGetterHelper) {
        transactionGetterHelper = this.moduleMap.get("transactionGetterHelper");
        if (!transactionGetterHelper) {
          throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
            prop: "transactionGetterHelper",
            target: "moduleStroge",
          });
        }
      }

      const roundLastAsset = asset.roundLastAsset;

      let blockGetterHelper = options.blockGetterHelper;
      if (!blockGetterHelper) {
        blockGetterHelper = this.moduleMap.get("blockGetterHelper");
        if (!blockGetterHelper) {
          throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
            prop: "blockGetterHelper",
            target: "moduleStroge",
          });
        }
      }

      await this.checkAssetChangeHash(height, roundLastAsset.assetChangeHash, options);

      await this.__checkChainOnChainHash(
        height,
        roundLastAsset.chainOnChainHash,
        blockGetterHelper,
      );

      await this.__checkNewForgingGenerators(block, blockGetterHelper);
    }

    return block;
  }

  /**
   * 校验链上链 hash
   *
   * @param height
   * @param hash
   * @param blockGetterHelper
   */
  private async __checkChainOnChainHash(
    height: number,
    hash: string,
    blockGetterHelper: BFChainUtil.SecondArgument<BlockHelper["calcChainOnChainHash"]>,
  ) {
    const calcHash = await this.blockHelper.calcChainOnChainHash(height, blockGetterHelper);
    if (calcHash !== hash) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `chainOnChainHash ${hash}`,
        be_compare_prop: `chainOnChainHash ${calcHash}`,
        to_target: "block",
        be_target: "calculate",
      });
    }
  }

  /**
   * 校验新一轮的打块账户是否合法
   *
   * @param block
   * @param blockGetterHelper
   */
  private async __checkNewForgingGenerators(
    block: RoundLastBlock,
    blockGetterHelper: Required<
      Pick<BFChainCore.BlockGetterHelperInterface, "getNewForgingGenerators" | "getLastBlock">
    >,
  ) {
    const calcNextRoundGenerators = await blockGetterHelper.getNewForgingGenerators(
      await blockGetterHelper.getLastBlock(),
      block.generatorPublicKey,
    );
    const nextRoundGenerators = block.asset.roundLastAsset.nextRoundGenerators;
    const generatorLength = calcNextRoundGenerators.length;
    if (generatorLength !== nextRoundGenerators.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `nextRoundGenerators length ${nextRoundGenerators.length}`,
        be_compare_prop: `nextRoundGenerators length ${calcNextRoundGenerators.length}`,
        to_target: "block remark",
        be_target: "calculate",
      });
    }

    for (let i = 0; i < generatorLength; i++) {
      const { address, numberOfGeneratorEntities } = calcNextRoundGenerators[i];
      const nextRoundGenerator = nextRoundGenerators[i];
      if (nextRoundGenerator.address !== address) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundGenerators index ${i} address ${nextRoundGenerator.address}`,
          be_compare_prop: `nextRoundGenerators index ${i} address ${address}`,
          to_target: "block remark",
          be_target: "calculate",
        });
      }
      if (nextRoundGenerator.numberOfGeneratorEntities !== numberOfGeneratorEntities) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundGenerators index ${i} address ${nextRoundGenerator.address} numberOfGeneratorEntities ${nextRoundGenerator.numberOfGeneratorEntities}`,
          be_compare_prop: `nextRoundGenerators index ${i} address ${address} numberOfGeneratorEntities ${numberOfGeneratorEntities}`,
          to_target: "block remark",
          be_target: "calculate",
        });
      }
    }
  }
}
