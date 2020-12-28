declare namespace BFChainCore {
  interface SomeTransactionJSON<T extends TransactionJSON> {
    transaction: T;
  }
  type SomeTransactionModel<
    T extends Transaction = Transaction
  > = import("./").SomeTransactionModel<T>;

  type AssetPrealnumJSON = {
    /**剩余的权益数量 */
    remainAssetPrealnum: string;
    /**冻结的主权益数量 */
    frozenMainAssetPrealnum: string;
  };

  interface TransactionInBlockJSON<T extends TransactionJSON = TransactionJSON>
    extends SomeTransactionJSON<T> {
    /**事件在区块内的索引 */
    index: number;
    /**区块高度 */
    height: number;
    /**事件发起账户的事件量 */
    numberOfSenderTransactions: number;
    /**事件涉及的账户权益变动信息 */
    transactionAssetChanges: TransactionAssetChangeJSON[];
    /**权益销毁前权益的最新信息 */
    assetPrealnum?: AssetPrealnumJSON;
    /**区块锻造者的签名 */
    signature: string;
    /**区块锻造者的安全签名 */
    signSignature?: string;
  }
  interface TransactionAssetChangeJSON {
    /**账户类型 */
    accountType: number;
    /**权益在块内的索引 */
    assetTypes: number;
    /**账户最新的权益持有量 */
    assetBalance: string;
  }
  type TransactionInBlock<T extends Transaction = Transaction> = import("./").TransactionInBlock<T>;
}
