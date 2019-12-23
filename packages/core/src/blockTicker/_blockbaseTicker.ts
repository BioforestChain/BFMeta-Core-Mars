import {
  CoreExceptionGenerator,
  BlockHelper,
  ChainTimeHelper,
  NOT_EXIST,
  ConfigHelper,
  PROP_IS_INVALID,
  AccountBaseHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import { Injectable, Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "../block/blockGeneratorCalculator";
import { Block } from "../../model";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "TICKER",
  "BlockLogicTicker",
);

@Injectable()
export abstract class BlockTicker<T extends Block<any> = Block<any>> {
  @Inject(BlockHelper)
  protected blockHelper!: BlockHelper;
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject(ChainTimeHelper)
  protected timeHelper!: ChainTimeHelper;
  @Inject(AccountBaseHelper)
  protected accountHelper!: AccountBaseHelper;
  @Inject(JSBIHelper)
  protected jsbiHelper!: JSBIHelper;
  @Inject(BlockGeneratorCalculator)
  protected blockGeneratorCalculator!: BlockGeneratorCalculator;
  @Inject("accountGetterHelper", { optional: true, dynamics: true })
  protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>;
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
  @Inject("blockTickGetterHelper", { optional: true, dynamics: true })
  protected blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface;

  abstract tick(
    block: T,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
    blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface,
  ): Promise<BFChainCore.TickResultInfo>;

  async tickBlockBase(
    block: T,
    accountGetterHelper = this.accountGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    await this.calcMissedBlocks(block, accountGetterHelper, blockGetterHelper);

    await this.isBlockAlreadyTick(block.height, blockGetterHelper);

    const blockUpdateData = await this.calcForgingAndVotingReward(block, blockGetterHelper);

    // 更新打块账户和投票账户（分配奖励）
    await this.updateForgingAndVotingAccount(block, blockUpdateData, blockTickGetterHelper);
  }

  /**
   * 计算掉块账户
   *
   * @param block
   */
  async calcMissedBlocks(
    block: T,
    accountGetterHelper = this.accountGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "calcMissedBlocks",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const { height: curBlockHeight, timestamp: curBlockTimestamp } = block;
    const lastBlock = await blockGetterHelper.getBlockByHeight(curBlockHeight - 1);
    if (!lastBlock) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Block with height ${curBlockHeight - 1}`,
      });
    }

    const { height: lastBlockHeight, timestamp: lastBlockTimestamp } = lastBlock;

    const { blockGeneratorCalculator, configHelper, timeHelper } = this;

    const { forgeInterval } = configHelper;

    const delegates = blockGeneratorCalculator.calcGenerateBlockDelegateGenerator(
      {
        timestamp: lastBlockTimestamp,
        height: lastBlockHeight,
      },
      {
        heightAcc: 0,
        timeAcc: forgeInterval,
        curTime: timeHelper.getTimeByTimestamp(lastBlockTimestamp + forgeInterval),
      },
    );
    const results: BFChainCore.AccountAccumulationInfo = {};
    for await (const delegate of delegates) {
      const { address, timestamp } = delegate;
      if (timestamp === curBlockTimestamp) {
        break;
      }
      if (!results[address]) {
        results[address] = 0;
      }
      results[address]++;
    }

    await accountGetterHelper.mergeAccountMissedBlock(curBlockHeight, results);
  }

  /**
   * 区块是否已经 tick
   *
   * @param height
   * @param blockGetterHelper
   */
  async isBlockAlreadyTick(height: number, blockGetterHelper = this.blockGetterHelper) {
    const Function_Exception_Detail = {
      function: "isBlockAlreadyTick",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (typeof blockGetterHelper.countBlockTick !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "countBlockTick",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const count = await blockGetterHelper.countBlockTick(height);
    if (count > 0) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Block tick with height ${height}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 获取给打块账户投票的账户
   *
   * @param generatorAddress
   * @param height
   */
  async getVoteForDelegate(
    generatorAddress: string,
    height: number,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "getVoteForDelegate",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (typeof blockGetterHelper.getVoteForDelegate !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "getVoteForDelegate",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const voterArray = await blockGetterHelper.getVoteForDelegate(generatorAddress, height);
    const voters: BFChainCore.VoterInfo[] = [];
    const minEquity = BigInt(0);
    let totalEquity = BigInt(0);
    // 只有投票权益大于 0 的账户才能得到奖励
    for (const voter of voterArray) {
      if (voter.equity > minEquity) {
        totalEquity += voter.equity;
        voters[voters.length] = voter;
      }
    }
    // 不需要进行排序，得到的奖励只和账户的投出权益有关，分配剩余的奖励给打块账户
    return {
      voters,
      totalEquity,
    };
  }

  /**
   * 计算打块和投票奖励
   *
   * @param block
   * @param blockGetterHelper
   */
  async calcForgingAndVotingReward(block: T, blockGetterHelper = this.blockGetterHelper) {
    const Function_Exception_Detail = {
      function: "calcForgingAndVotingReward",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const blockUpdateData: BFChainCore.BlockUpdateDataInfo = {
      reward: BigInt(0),
      vrewards: BigInt(0),
      vrewardsRemaining: BigInt(0),
      blockFee: BigInt(0),
      blockReward: BigInt(0),
      totalEquity: BigInt(0),
      voters: [],
    };
    const { accountHelper, jsbiHelper, configHelper } = this;
    const { height } = block;
    const generatorAddress = accountHelper.getAddressFromPublicKeyString(block.generatorPublicKey);
    const data = await this.getVoteForDelegate(generatorAddress, height, blockGetterHelper);
    // FIXME: only for genesis block?
    // 使用深拷贝在传值前复制一份？
    const { voters, totalEquity } = data;
    const len = voters.length;
    // 投票账户数大于 0，并且投出的权益数大于 0
    if (len > 0 && totalEquity > BigInt(0)) {
      blockUpdateData.voters = voters;
      blockUpdateData.totalEquity = totalEquity;
    }

    // 计算给打块账户和投票账户的奖励总额
    if (height != 1 && len > 0) {
      //上一轮 给打块账户投票的用户 大于 0
      const votePercent = configHelper.rewardPercent.votePercent;
      const fee = BigInt(jsbiHelper.multiplyFloorFraction(block.totalFee, votePercent).toString());
      const reward = BigInt(jsbiHelper.multiplyFloorFraction(block.reward, votePercent).toString());

      blockUpdateData.blockFee = BigInt(block.totalFee) - fee;
      blockUpdateData.blockReward = BigInt(block.reward) - reward;
      blockUpdateData.reward = BigInt(blockUpdateData.blockFee) + blockUpdateData.blockReward;

      blockUpdateData.vrewards = BigInt(fee) + reward;
      blockUpdateData.vrewardsRemaining = BigInt(0);
    } else {
      //上一轮 给打块账户投票的用户 等于 0
      blockUpdateData.reward = BigInt(block.reward) + BigInt(block.totalFee);
      blockUpdateData.blockFee = BigInt(block.totalFee);
      blockUpdateData.blockReward = BigInt(block.reward);
    }
    return blockUpdateData;
  }

  /**
   * 更新打块账户和投票账户
   *
   * @param block
   * @param blockUpdateData
   * @param blockTickGetterHelper
   */
  async updateForgingAndVotingAccount(
    block: T,
    blockUpdateData: BFChainCore.BlockUpdateDataInfo,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    if (!blockTickGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "updateForgingAndVotingAccount",
      });
    }
    const { voters, totalEquity } = blockUpdateData;
    const len = voters.length;
    if (block.height != 1 && len > 0) {
      const voteTotalReward = BigInt(blockUpdateData.vrewards);
      // 用于一次性记录奖励分配 voteRewardList[address] = voteReward
      const voteRewardList: BFChainCore.VoterRewardListInfo = {};
      let sumVoteReward = BigInt(0);
      for (const voter of voters) {
        const voteReward = (voteTotalReward * voter.equity) / totalEquity;
        sumVoteReward += voteReward;
        voteRewardList[voter.address] = voteReward;
      }
      //分配剩余的奖励给打块账户
      const vrewardsRemaining = voteTotalReward - sumVoteReward;
      blockUpdateData.reward = blockUpdateData.reward + vrewardsRemaining;
      if (len > 0) {
        await blockTickGetterHelper.updateVotingAccount(block, voteRewardList);
      }
    }
    await blockTickGetterHelper.updateForgingAccount(block, blockUpdateData.reward);
  }
}
