declare namespace BFChainCore {
  //#region BlockTicker
  type BlockTicker<T extends Block> = import("./atom_block").BlockTicker<T>;
  type BlockTickerConstructor<T extends Block = any> = new (...args: any[]) => BlockTicker<T>;
  //#endregion
  interface BlockTickGetterHelperInterface {
    /**更新打块账户 */
    updateForgingAccount(block: BFChainCore.Block, forgingReward: bigint): Promise<void>;
    /**更新持仓账户 */
    updateHoldingAccount(
      block: Block,
      holdingRewardsList: BFChainCore.EntityHolderRewardInfo[],
    ): Promise<void>;
    /**累加流通量 */
    accumulateCirculations(magic: string, assetType: string, circulations: bigint): Promise<void>;
  }
}
