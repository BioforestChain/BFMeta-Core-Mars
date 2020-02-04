declare namespace BFChainCore {
  // #region
  type BlockFactory<T extends Block> = import("./atom_block/_blockbase").BlockFactory<T>;
  type BlockFactoryConstructor<T extends Block = any> = new (...args: any[]) => BlockFactory<T>;
  // #endregion

  // #region
  type UsedAddressCacheJSON = Map<number, { signature: string; timestamp: number; address: string }>
  // #endregion
}
