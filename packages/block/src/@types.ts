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

  type ReplayBlockOptions = {
    verifySignature?: boolean;
    verifyAsset?: boolean;
    skipVerifyStatisticInfo?: boolean;
    skipVerifyParticipation?: boolean;
    recordForkBlock?: boolean;
    transactionGetterHelper?: Required<
      Pick<BFChainCore.TransactionGetterHelperInterface, "getRegisterNewGenerators">
    >;
    blockGetterHelper?: Required<
      Pick<
        BFChainCore.BlockGetterHelperInterface,
        "chainBlockFork" | "getNewForgingGenerators" | "getLastBlock" | "getBlockByHeight"
      >
    >;
    accountGetterHelper?: Required<
      Pick<BFChainCore.AccountGetterHelperInterface, "getAccountsAssetsChange">
    >;
  };

  type ForgeInfos = {
    producedblocks: number;
    applyTxNumber: number;
  };

  type CanBePickAccount = {
    address: string;
    forgedBlocks: number;
    applyTxNumber: number;
    numberOfEntities: number;
  };
  // #endregion
}
