declare namespace BFChainCore {
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
