declare namespace BFChainCore {
  interface CustomJSON {
    type: string;
    data: string;
  }
  interface CustomAssetJSON {
    custom: CustomJSON;
  }
  type CustomTransactionJSON = TransactionJSON<CustomAssetJSON>;

  interface RegisterChainJSON {
    genesisBlock: BlockJSON<GenesisBlockAssetJSON>;
  }
  interface RegisterChainAssetJSON {
    registerChain: RegisterChainJSON;
  }
  type RegisterChainTransactionJSON = TransactionMixJSON<
    RegisterChainAssetJSON,
    { hasRecipientId: false }
  >;
}
