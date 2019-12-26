declare namespace BFChainCore {
  // #region BlockLogicVerifier
  type BlockLogicVerifier<T extends Block> = import("./atom_block").BlockLogicVerifier<T>;
  type BlockLogicVerifierConstructor<T extends Block = any> = new (
    ...args: any[]
  ) => BlockLogicVerifier<T>;
  // #endregion
}
