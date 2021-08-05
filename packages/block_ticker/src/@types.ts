declare namespace BFChainCore {
  //#region BlockTicker
  type BlockTicker<T extends Block> = import("./atom_block").BlockTicker<T>;
  type BlockTickerConstructor<T extends Block = any> = new (...args: any[]) => BlockTicker<T>;
  //#endregion
  interface BlockTickGetterHelperInterface {
    /**保存参与投票账户的权益 */
    saveVotingAccountEquity(height: number): Promise<void>;
    /**更新投票账户轮某时余额/交易和权益 */
    saveVotingAccountLastInfoAndEquity(height: number): Promise<void>;
    /**获取投票账户最大初始余额和最大交易量和二者比值 */
    getMaxBeginBalanceAndMaxTxCountAndRate(round: number): {
      maxBeginBalance: string;
      maxTxCount: number;
      rate: string;
    };
    /**更新打块账户 */
    updateForgingAccount(block: BFChainCore.Block, forgingReward: bigint): Promise<void>;
    /**更新投票账户 */
    updateVotingAccount(block: Block, voteRewardList: VoterRewardListInfo): Promise<void>;
  }
}
