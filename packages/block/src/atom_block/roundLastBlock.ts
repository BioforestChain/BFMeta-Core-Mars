import { BlockFactory } from "./_blockbase";
import { RoundLastBlock } from "@bfchain/core-model-block";
import type { TransactionInBlock } from "@bfchain/core-model-transaction";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  MilestonesHelper,
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
    public milestonesHelper: MilestonesHelper,
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
    if (!roundLastAsset.nextRoundDelegates) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "nextRoundDelegates",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!roundLastAsset.newDelegates) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_REQUIRE, {
        prop: "newDelegates",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(roundLastAsset.maxBeginBalance)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "maxBeginBalance",
        type: "asset number",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(roundLastAsset.maxTxCount)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `maxTxCount ${roundLastAsset.maxTxCount}`,
        type: "block maxTxCount",
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

    if (!baseHelper.isString(roundLastAsset.rate)) {
      throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `rate ${roundLastAsset.rate}`,
        type: "rate",
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
    // 绑定区块奖励
    block.reward = this.milestonesHelper.calcReward(block.height);

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

      await this.checkBlockNewDelegates(
        block.height,
        roundLastAsset.newDelegates,
        transactionGetterHelper,
      );

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

      await this.__checkNewForgingDelegates(block, blockGetterHelper);
    }

    return block;
  }

  /**
   * 校验新生成的受托人
   *
   * @param height
   * @param transactionGetterHelper
   */
  async checkNewDelegates(
    height: number,
    transactionGetterHelper: Pick<
      BFChainCore.TransactionGetterHelperInterface,
      "getRegisterNewDelegates"
    >,
  ) {
    const newDelegates = await transactionGetterHelper.getRegisterNewDelegates(height);
    const { maxDelegateTxsPerRound, delegates, blockPerRound } = this.config;
    const delegateCount = newDelegates.length;
    // 大于第一轮
    if (height > blockPerRound) {
      if (delegateCount > maxDelegateTxsPerRound) {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
          prop: `delegateCount ${delegateCount}`,
          target: "block",
          field: `maxDelegateTxsPerRound ${maxDelegateTxsPerRound}`,
        });
      }
    } else {
      if (delegates !== delegateCount) {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_EQ_FIELD, {
          prop: `number of newDelegates ${delegateCount}`,
          target: "newDelegates",
          field: delegates,
        });
      }
    }
    return newDelegates;
  }

  /**
   * 新注册的受托人是否合法
   *
   * @param height
   * @param newDelegates
   */
  private async checkBlockNewDelegates(
    height: number,
    newDelegates: string[],
    transactionGetterHelper: Pick<
      BFChainCore.TransactionGetterHelperInterface,
      "getRegisterNewDelegates"
    >,
  ) {
    // 校验新注册的受托人
    const calcNewDelegates = await this.checkNewDelegates(height, transactionGetterHelper);
    const newDelegatesLength = newDelegates.length;
    if (newDelegatesLength !== calcNewDelegates.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `number of new delegates ${newDelegatesLength}`,
        be_compare_prop: `number of new delegates ${calcNewDelegates.length}`,
        to_target: "block",
        be_target: "calculate",
      });
    }
    // 校验新注册的受托人是否与区块携带的一致
    for (let i = 0; i < newDelegatesLength; i++) {
      if (newDelegates[i] !== calcNewDelegates[i]) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `new delegates ${newDelegates[i]}`,
          be_compare_prop: `new delegates ${calcNewDelegates[i]}`,
          to_target: "block",
          be_target: "calculate",
        });
      }
    }
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
  private async __checkNewForgingDelegates(
    block: RoundLastBlock,
    blockGetterHelper: Required<
      Pick<BFChainCore.BlockGetterHelperInterface, "getNewForgingDelegates" | "getLastBlock">
    >,
  ) {
    const calcNextRoundDelegates = await blockGetterHelper.getNewForgingDelegates(
      await blockGetterHelper.getLastBlock(),
      block.generatorPublicKey,
    );
    const nextRoundDelegates = block.asset.roundLastAsset.nextRoundDelegates;
    const delegateLength = calcNextRoundDelegates.length;
    if (delegateLength !== nextRoundDelegates.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `nextRoundDelegates length ${nextRoundDelegates.length}`,
        be_compare_prop: `nextRoundDelegates length ${calcNextRoundDelegates.length}`,
        to_target: "block remark",
        be_target: "calculate",
      });
    }

    for (let i = 0; i < delegateLength; i++) {
      const { address, vote } = calcNextRoundDelegates[i];
      const nextRoundDelegate = nextRoundDelegates[i];
      if (nextRoundDelegate.address !== address) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address}`,
          to_target: "block remark",
          be_target: "calculate",
        });
      }
      const calcEquity = vote.toString();
      if (nextRoundDelegate.equity !== calcEquity) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address} equity ${nextRoundDelegate.equity}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address} equity ${calcEquity}`,
          to_target: "block remark",
          be_target: "calculate",
        });
      }
    }
  }

  /**
   * 校验链上上一轮末投票账户中最大初始余额和交易量
   *
   * @param block
   * @param tickResult
   */
  checkMaxBeginBalanceAndMaxTxCount(block: RoundLastBlock, tickResult: BFChainCore.TickResultInfo) {
    const roundLastAsset = block.asset.roundLastAsset;
    if (roundLastAsset.maxBeginBalance !== tickResult.maxBeginBalance) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `maxBeginBalance ${roundLastAsset.maxBeginBalance}`,
        be_compare_prop: `maxBeginBalance ${tickResult.maxBeginBalance}`,
        to_target: "block remark",
        be_target: "calculate",
      });
    }
    if (roundLastAsset.maxTxCount !== tickResult.maxTxCount) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `maxTxCount ${roundLastAsset.maxTxCount}`,
        be_compare_prop: `maxTxCount ${tickResult.maxTxCount}`,
        to_target: "block remark",
        be_target: "calculate",
      });
    }
  }
}
