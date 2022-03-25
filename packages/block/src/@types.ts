declare namespace BFChainCore {
  // #region
  type BlockFactory<T extends Block> = import("./atom_block/_blockbase").BlockFactory<T>;
  type BlockFactoryConstructor<T extends Block = any> = new (...args: any[]) => BlockFactory<T>;
  // #endregion

  // #region
  type UsedAddressCacheJSON = Map<
    number,
    { signature: string; timestamp: number; address: string }
  >;
  // #endregion

  // #region
  type RecommendedDelegateOptions = {
    /**选出的推荐人数量 */
    maxNumberOfRecommended: number;
    /**选取的区块范围, 最近的 100 轮 */
    numberOfRounds: number;
    /**在线率占比 */
    productivityPercent: BFChainCore.FractionJSON;
    /**打块数量占比 */
    forgedBlocksPercent: BFChainCore.FractionJSON;
    /**打包交易数量占比 */
    applyTxPercent: BFChainCore.FractionJSON;
    /**上一轮的得票率占比 */
    votePercent: BFChainCore.FractionJSON;
    /**新受托人(在线率 100%)占比 */
    newDelegatePercent: BFChainCore.FractionJSON;
    /**最小可被推荐得账户在线率 */
    minBeSelectProductivity: BFChainCore.FractionJSON;
    /**新受托人资产要求信息 */
    newDelegateAssetNeedInfo?: NewDelegateAssetNeedInfo;
  };

  type ReplayBlockOptions = {
    verifySignature?: boolean;
    verifyAsset?: boolean;
    skipVerifyStatisticInfo?: boolean;
    skipVerifyParticipation?: boolean;
    recordForkBlock?: boolean;
    transactionGetterHelper?: Required<
      Pick<BFChainCore.TransactionGetterHelperInterface, "getNewDelegates">
    >;
    blockGetterHelper?: Required<
      Pick<
        BFChainCore.BlockGetterHelperInterface,
        "chainBlockFork" | "getNewForgingDelegates" | "getLastBlock" | "getBlockByHeight"
      >
    >;
  };

  type ForgeInfos = {
    producedblocks: number;
    applyTxNumber: number;
  };

  type CanBePickAccount = {
    address: string;
    productivity: number;
    forgedBlocks: number;
    applyTxNumber: number;
    vote: bigint;
  };
  // #endregion
}
