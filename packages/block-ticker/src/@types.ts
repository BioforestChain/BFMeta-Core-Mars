declare namespace BFChainCore {
  //#region BlockTicker
  type BlockTicker<T extends Block> = import("./atom_blocks").BlockTicker<T>;
  type BlockTickerConstructor<T extends Block = any> = new (...args: any[]) => BlockTicker<T>;
  //#endregion
}
