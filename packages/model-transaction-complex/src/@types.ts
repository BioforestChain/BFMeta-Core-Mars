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
    genesisBlock: string;
  }
  interface RegisterChainAssetJSON {
    registerChain: RegisterChainJSON;
  }
  type RegisterChainTransactionJSON = TransactionMixJSON<
    RegisterChainAssetJSON,
    { hasRecipientId: false }
  >;

  interface MultipleJSON {
    transactions: BFChainCore.TransactionJSON[];
  }
  interface MultipleAssetJSON {
    multiple: MultipleJSON;
  }
  type MultipleTransactionJSON = TransactionMixJSON<MultipleAssetJSON, { hasRecipientId: false }>;
}
