declare namespace BFChainCore {
  // #region TransactionLogicVerifier
  type TransactionLogicVerifier<
    T extends Transaction
  > = import("./atom_transactionLogicVerifier/_txbaseLogicVerifier").TransactionLogicVerifier<T>;
  type TransactionLogicVerifierConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionLogicVerifier<T>;
  // #endregion
}
