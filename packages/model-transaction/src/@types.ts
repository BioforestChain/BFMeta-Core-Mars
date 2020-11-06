declare namespace BFChainCore {
  interface SomeTransactionJSON<T extends TransactionJSON> {
    transaction: T;
  }
  type SomeTransactionModel<
    T extends Transaction = Transaction
  > = import("./").SomeTransactionModel<T>;

  type AssetPrealnumJSON = {
    remainAssetPrealnum: string;
    frozenMainAssetPrealnum: string;
  };

  interface TransactionInBlockJSON<T extends TransactionJSON = TransactionJSON>
    extends SomeTransactionJSON<T> {
    index: number;
    height: number;
    numberOfSenderTransactions: number;
    transactionAssetChanges: TransactionAssetChangeJSON[];
    assetPrealnum?: AssetPrealnumJSON;
    signature: string;
    signSignature?: string;
  }
  interface TransactionAssetChangeJSON {
    accountType: number;
    assetTypes: number;
    assetBalance: string;
  }
  type TransactionInBlock<T extends Transaction = Transaction> = import("./").TransactionInBlock<T>;
}
