import { CoreExceptionGenerator, NOT_EXIST, PROP_IS_INVALID } from "@bfchain/core-util-exception";
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
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    await this.tickBlockBase(block, accountGetterHelper, blockGetterHelper, blockTickGetterHelper);

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
    const equities = await this.saveDelegatesVoteAndTotalVote(
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
  async saveDelegatesVoteAndTotalVote(
    height: number,
    blockGetterHelper = this.blockGetterHelper,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "saveDelegatesVoteAndTotalVote",
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
    if (typeof blockGetterHelper.getVoteRecords !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "getVoteForDelegate",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const delegatesEquity: BFChainCore.AccountEquityInfo = {};
    const voteRecords = await blockGetterHelper.getVoteRecords();
    let totalEquity = BigInt(0);
    for (const address in voteRecords) {
      const voteInfos = voteRecords[address];
      for (const delegateAddress in voteInfos) {
        if (!delegatesEquity[delegateAddress]) {
          delegatesEquity[delegateAddress] = BigInt(0);
        }
        delegatesEquity[delegateAddress] += voteInfos[delegateAddress];
        totalEquity += delegatesEquity[delegateAddress];
      }
    }
    // 先重置受托人账户获得的权益
    await accountGetterHelper.resetDelegateVote(height);
    // 设置受托人账户获得的权益
    await accountGetterHelper.mergeAccountEquity(height, delegatesEquity);
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
        function: "saveVotingAccountEquity",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
        function: "saveVotingAccountLastInfoAndEquity",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockTickGetterHelper",
        target: "moduleStroge",
        function: "getBalanceAndTxRate",
      });
    }
    return await blockTickGetterHelper.getMaxBeginBalanceAndMaxTxCountAndRate(round);
  }
}
