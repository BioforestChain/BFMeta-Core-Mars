declare namespace BFChainCore {
  // #region TransactionFactory
  type TransactionFactory<T extends Transaction> =
    import("./atom_transaction/_txbase").TransactionFactory<T>;
  type TransactionFactoryConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionFactory<T>;
  // #endregion
}
