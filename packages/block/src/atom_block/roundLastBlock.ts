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
import {
  CoreExceptionGenerator,
  PROP_IS_INVALID,
  NOT_MATCH,
  PROP_SHOULD_LTE_FIELD,
  PROP_SHOULD_EQ_FIELD,
  NOT_EXIST,
  PROP_IS_REQUIRE,
} from "@bfchain/core-util-exception";
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
    if (blockBody.transactions && blockBody.transactions.length > 0) {
      block.transactions = blockBody.transactions.map((twi) => {
        return this.transactionInBlockFromJSON(twi);
      });
    } else {
      block.transactions = [];
    }
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

    const Function_Exception_Detail = { function: "verifyBlockBody" };

    const roundLastBlock = roundLastBlockAsset.roundLastBlock;

    const RoundLastBlockAsset_Exception_Detail = {
      target: "roundLastBlockAsset",
      ...Function_Exception_Detail,
    };

    const { baseHelper } = this;
    if (!roundLastBlock.nextRoundDelegates) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "nextRoundDelegates",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!roundLastBlock.newDelegates) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "newDelegates",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(roundLastBlock.maxBeginBalance)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "maxBeginBalance",
        type: "asset number",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(roundLastBlock.maxTxCount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `blockParticipation ${roundLastBlock.blockParticipation}`,
        type: "block participation",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isValidChainOnChainHash(roundLastBlock.hash)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `generatorEquity ${roundLastBlock.generatorEquity}`,
        type: "account equity",
        ...RoundLastBlockAsset_Exception_Detail,
      });
    }

    if (!baseHelper.isString(roundLastBlock.rate)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `hash ${roundLastBlock.hash}`,
        type: "remarkHash",
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
      statisticInfo: {},
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
          throw new NoFoundException(NOT_EXIST, {
            prop: "transactionGetterHelper",
            target: "moduleStroge",
            function: "replayBlock",
          });
        }
      }

      const roundLastBlock = asset.roundLastBlock;

      await this.checkBlockNewDelegates(
        block.height,
        roundLastBlock.newDelegates,
        transactionGetterHelper,
      );

      let blockGetterHelper = options.blockGetterHelper;
      if (!blockGetterHelper) {
        blockGetterHelper = this.moduleMap.get("blockGetterHelper");
        if (!blockGetterHelper) {
          throw new NoFoundException(NOT_EXIST, {
            prop: "blockGetterHelper",
            target: "moduleStroge",
            function: "replayBlock",
          });
        }
      }

      await this.checkBlockChainOnChainHash(height, roundLastBlock.hash, blockGetterHelper);

      await this.checkBlockNewForgingDelegates(block, blockGetterHelper);
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
    transactionGetterHelper: Pick<BFChainCore.TransactionGetterHelperInterface, "getNewDelegates">,
  ) {
    const newDelegates = await transactionGetterHelper.getNewDelegates(height);
    const { maxDelegateTxsPerRound, delegates, blockPerRound } = this.config;
    const delegateCount = newDelegates.length;
    // 大于第一轮
    if (height > blockPerRound) {
      if (delegateCount > maxDelegateTxsPerRound) {
        throw new ConsensusException(PROP_SHOULD_LTE_FIELD, {
          prop: `delegateCount ${delegateCount}`,
          target: "block",
          field: `maxDelegateTxsPerRound ${maxDelegateTxsPerRound}`,
          function: "checkNewDelegates",
        });
      }
    } else {
      if (delegates !== delegateCount) {
        throw new ConsensusException(PROP_SHOULD_EQ_FIELD, {
          prop: `number of newDelegates ${delegateCount}`,
          target: "newDelegates",
          field: delegates,
          function: "checkNewDelegates",
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
    transactionGetterHelper: Pick<BFChainCore.TransactionGetterHelperInterface, "getNewDelegates">,
  ) {
    const Function_Exception_Detail = {
      function: "isValidNewDelegates",
    } as const;
    // 校验新注册的受托人
    const calcNewDelegates = await this.checkNewDelegates(height, transactionGetterHelper);
    const newDelegatesLength = newDelegates.length;
    if (newDelegatesLength !== calcNewDelegates.length) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `number of new delegates ${newDelegatesLength}`,
        be_compare_prop: `number of new delegates ${calcNewDelegates.length}`,
        to_target: "block",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
    // 校验新注册的受托人是否与区块携带的一致
    for (let i = 0; i < newDelegatesLength; i++) {
      if (newDelegates[i] !== calcNewDelegates[i]) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `new delegates ${newDelegates[i]}`,
          be_compare_prop: `new delegates ${calcNewDelegates[i]}`,
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
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
  private async checkBlockChainOnChainHash(
    height: number,
    hash: string,
    blockGetterHelper: BFChainUtil.SecondArgument<BlockHelper["calcroundLastBlockHash"]>,
  ) {
    const calcHash = await this.blockHelper.calcroundLastBlockHash(height, blockGetterHelper);
    if (calcHash !== hash) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `remark hash ${hash}`,
        be_compare_prop: `remark hash ${calcHash}`,
        to_target: "block",
        be_target: "calculate",
        function: "checkRemarkHash",
      });
    }
  }

  /**
   * 校验新一轮的打块账户是否合法
   *
   * @param block
   * @param blockGetterHelper
   */
  private async checkBlockNewForgingDelegates(
    block: RoundLastBlock,
    blockGetterHelper: Required<
      Pick<BFChainCore.BlockGetterHelperInterface, "getNewForgingDelegates" | "getLastBlock">
    >,
  ) {
    const Function_Exception_Detail = {
      function: "checkNewForgingDelegates",
    } as const;
    const calcNextRoundDelegates = await blockGetterHelper.getNewForgingDelegates(
      await blockGetterHelper.getLastBlock(),
      block.generatorPublicKey,
    );
    const nextRoundDelegates = block.asset.roundLastBlock.nextRoundDelegates;
    const delegateLength = calcNextRoundDelegates.length;
    if (delegateLength !== nextRoundDelegates.length) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `nextRoundDelegates length ${nextRoundDelegates.length}`,
        be_compare_prop: `nextRoundDelegates length ${calcNextRoundDelegates.length}`,
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }

    for (let i = 0; i < delegateLength; i++) {
      const { address, vote } = calcNextRoundDelegates[i];
      const nextRoundDelegate = nextRoundDelegates[i];
      if (nextRoundDelegate.address !== address) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address}`,
          to_target: "block remark",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }
      const calcEquity = vote.toString();
      if (nextRoundDelegate.equity !== calcEquity) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address} equity ${nextRoundDelegate.equity}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address} equity ${calcEquity}`,
          to_target: "block remark",
          be_target: "calculate",
          ...Function_Exception_Detail,
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
    const Function_Exception_Detail = {
      function: "checkMaxBeginBalanceAndMaxTxCount",
    } as const;
    const roundLastBlockAsset = block.asset.roundLastBlock;
    if (roundLastBlockAsset.maxBeginBalance !== tickResult.maxBeginBalance) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `maxBeginBalance ${roundLastBlockAsset.maxBeginBalance}`,
        be_compare_prop: `maxBeginBalance ${tickResult.maxBeginBalance}`,
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
    if (roundLastBlockAsset.maxTxCount !== tickResult.maxTxCount) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `maxTxCount ${roundLastBlockAsset.maxTxCount}`,
        be_compare_prop: `maxTxCount ${tickResult.maxTxCount}`,
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
  }
}
