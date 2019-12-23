declare namespace BFChainCore {
  interface SomeTransactionJSON<T extends TransactionJSON> {
    transaction: T;
  }
  type SomeTransactionModel<
    T extends Transaction = Transaction
  > = import("./").SomeTransactionModel<T>;

  interface TransactionInBlockJSON<T extends TransactionJSON = TransactionJSON>
    extends SomeTransactionJSON<T> {
    index: number;
    height: number;
    transactionAssetChanges: TransactionAssetChangeJSON[];
    signature: string;
  }
  interface TransactionAssetChangeJSON {
    accountType: number;
    assetTypes: number;
    assetBalance: string;
  }
  type TransactionInBlock<T extends Transaction = Transaction> = import("./").TransactionInBlock<T>;
}
