import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable } from "@bfchain/util";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "TICKER",
  "BlockLogicTicker",
);
import { BlockTicker } from "./_blockbaseTicker";
import type { RoundLastBlock } from "@bfchain/core-model-block";

@Injectable()
export class RoundLastBlockTicker extends BlockTicker {
  async tick(
    block: RoundLastBlock,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    await this.tickBlockBase(block, blockGetterHelper, blockTickGetterHelper);

    const round = this.blockHelper.calcRoundByHeight(block.height);

    return await this.roundEnd(
      block,
      round,
      accountGetterHelper,
      blockGetterHelper,
      blockTickGetterHelper,
    );
  }
  /**
   * 轮次结束时做扫尾工作
   *
   * @param block
   * @param round
   */
  async roundEnd(
    block: BFChainCore.Block,
    round: number,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    // 保存受托人账户的累计权益和所有受托人的总权益（用于参与竞争打块，计算得票率）
    const equities = await this.saveGeneratorsVoteAndTotalVote(
      block.height,
      blockGetterHelper,
      accountGetterHelper,
    );
    // 保存投票账户的权益
    await this.saveVotingAccountEquity(block.height, blockTickGetterHelper);
    await this.saveVotingAccountLastInfoAndEquity(block.height, blockTickGetterHelper);
    const result = await this.getMaxBeginBalanceAndMaxTxCountAndRate(round, blockTickGetterHelper);
    return {
      equities,
      ...result,
    };
  }

  /**
   * 保存受托人账户的累计权益和所有受托人的总权益（用于参与竞争打块，计算得票率）
   *
   * @param height
   * @param blockGetterHelper
   * @param accountGetterHelper
   */
  async saveGeneratorsVoteAndTotalVote(
    height: number,
    blockGetterHelper = this.blockGetterHelper,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    if (!accountGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
      });
    }
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    if (typeof blockGetterHelper.getVoteRecords !== "function") {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "getVoteForGenerator",
        target: "blockGetterHelper",
      });
    }
    const generatorsEquity: BFChainCore.AccountEquityInfo = {};
    const voteRecords = await blockGetterHelper.getVoteRecords();
    let totalEquity = BigInt(0);
    for (const address in voteRecords) {
      const voteInfos = voteRecords[address];
      for (const generatorAddress in voteInfos) {
        if (!generatorsEquity[generatorAddress]) {
          generatorsEquity[generatorAddress] = BigInt(0);
        }
        generatorsEquity[generatorAddress] += voteInfos[generatorAddress];
        totalEquity += generatorsEquity[generatorAddress];
      }
    }
    // 设置受托人账户获得的权益
    await accountGetterHelper.mergeAccountEquity(height, generatorsEquity);
    return totalEquity;
  }

  /**
   * 保存参与投票账户的权益
   *
   * @param height
   */
  async saveVotingAccountEquity(
    height: number,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    if (!blockTickGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
      });
    }
    await blockTickGetterHelper.saveVotingAccountEquity(height);
  }

  /**
   * 更新投票账户轮某时余额/交易和权益
   *
   * @param height
   * @param blockTickGetterHelper
   */
  async saveVotingAccountLastInfoAndEquity(
    height: number,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    if (!blockTickGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
      });
    }
    await blockTickGetterHelper.saveVotingAccountLastInfoAndEquity(height);
  }

  /**
   * 获取投票账户最大初始余额和最大交易量的比值
   *
   * @param round
   * @param blockTickGetterHelper
   */
  async getMaxBeginBalanceAndMaxTxCountAndRate(
    round: number,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    if (!blockTickGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
      });
    }
    return await blockTickGetterHelper.getMaxBeginBalanceAndMaxTxCountAndRate(round);
  }
}
