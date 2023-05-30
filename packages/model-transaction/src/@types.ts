declare namespace BFChainCore {
  interface SomeTransactionJSON<T extends TransactionJSON> {
    transaction: T;
  }
  type SomeTransactionModel<T extends Transaction = Transaction> =
    import("./").SomeTransactionModel<T>;

  type AssetPrealnumJSON = {
    /**剩余的权益数量 */
    remainAssetPrealnum: string;
    /**冻结的主权益数量 */
    frozenMainAssetPrealnum: string;
  };

  interface TransactionInBlockJSON<T extends TransactionJSON = TransactionJSON>
    extends SomeTransactionJSON<T> {
    /**事件在区块内的索引 */
    tIndex: number;
    /**区块高度 */
    height: number;
    /**权益销毁前权益的最新信息 */
    assetPrealnum?: AssetPrealnumJSON;
    /**区块锻造者的签名 */
    signature: string;
    /**区块锻造者的安全签名 */
    signSignature?: string;
  }
  type TransactionInBlock<T extends Transaction = Transaction> = import("./").TransactionInBlock<T>;
}
