import {
  BlockHelper,
  ChainTimeHelper,
  ConfigHelper,
  AccountBaseHelper,
  JSBIHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable, Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "@bfchain/core-block";
import type { Block } from "@bfchain/core-model-block";

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
  protected accountBaseHelper!: AccountBaseHelper;
  @Inject(JSBIHelper)
  protected jsbiHelper!: JSBIHelper;
  @Inject(BlockGeneratorCalculator)
  protected blockGeneratorCalculator!: BlockGeneratorCalculator;
  @Inject("accountGetterHelper", { optional: true, dynamics: true })
  protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface;
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
  @Inject("blockTickGetterHelper", { optional: true, dynamics: true })
  protected blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface;

  abstract tick(
    block: T,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
    blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ): Promise<BFChainCore.TickResultInfo>;

  async tickBlockBase(
    block: T,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    const blockUpdateData = await this.calcForgingAndVotingReward(block, blockGetterHelper);

    // 更新打块账户和投票账户（分配奖励）
    await this.updateForgingAndVotingAccount(block, blockUpdateData, blockTickGetterHelper);
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
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    if (typeof blockGetterHelper.getVoteForDelegate !== "function") {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "getVoteForDelegate",
        target: "blockGetterHelper",
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
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }

    const { accountBaseHelper } = this;
    const { height } = block;
    const generatorAddress = await accountBaseHelper.getAddressFromPublicKeyString(
      block.generatorPublicKey,
    );
    const { totalEquity, voters } = await this.getVoteForDelegate(
      generatorAddress,
      height,
      blockGetterHelper,
    );

    const blockUpdateData = await this.blockHelper.calcForgingAndVotingReward(
      block,
      voters,
      totalEquity,
    );

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
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    const { voters, totalEquity } = blockUpdateData;
    if (block.height !== 1 && totalEquity > BigInt(0)) {
      const voteTotalReward = BigInt(blockUpdateData.vrewards);
      const { voteRewardList, vrewardsRemaining } = this.blockHelper.calcBlockVotesRewards(
        voters,
        totalEquity,
        voteTotalReward,
      );
      // 分配剩余的奖励给打块账户
      blockUpdateData.reward = blockUpdateData.reward + vrewardsRemaining;
      await blockTickGetterHelper.updateVotingAccount(block, voteRewardList);
    }
    await blockTickGetterHelper.updateForgingAccount(block, blockUpdateData.reward);
  }
}
