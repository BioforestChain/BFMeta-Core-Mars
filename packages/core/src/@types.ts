declare namespace BFChainCore {
  //#region Block

  type BlockFactory<T extends Block> = import("./block/index").BlockFactory<T>;
  type BlockFactoryConstructor<T extends Block = any> = new (...args: any[]) => BlockFactory<T>;
  type BlockLogicVerifier<
    T extends Block
  > = import("./blockLogicVerifier/index").BlockLogicVerifier<T>;
  type BlockLogicVerifierConstructor<T extends Block = any> = new (
    ...args: any[]
  ) => BlockLogicVerifier<T>;
  type BlockTicker<T extends Block> = import("./blockTicker/index").BlockTicker<T>;
  type BlockTickerConstructor<T extends Block = any> = new (...args: any[]) => BlockTicker<T>;
  //#endregion

  //#region Subchain

  type StatisticWeekMapKey = {
    height: number;
    generatorPublicKey: string;
  };

  type EmergencyDelegateAddressCacheMap = Map<
    number,
    { round: number; delegateAddressList: string[]; times: Map<number, string> }
  >;
}
