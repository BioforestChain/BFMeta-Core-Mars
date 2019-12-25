declare namespace BFChainCore {
    type TransactionLogicVerifier<T extends Transaction> = import("./atom_transactionLogicVerifier/_txbaseLogicVerifier").TransactionLogicVerifier<T>;
    type TransactionLogicVerifierConstructor<T extends Transaction = any> = new (...args: any[]) => TransactionLogicVerifier<T>;
}
//# sourceMappingURL=@types.d.ts.map