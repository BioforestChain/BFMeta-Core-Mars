declare namespace BFChainCore {
  // #region TransactionLogicVerifier
  type TransactionLogicVerifier<
    T extends Transaction
  > = import("./atom_transactionLogicVerifier/_txbaseLogicVerifier").TransactionLogicVerifier<T>;
  type TransactionLogicVerifierConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionLogicVerifier<T>;
  // #endregion

  // #region TransactionGetterHelperInterface
  interface TransactionGetterHelperInterface {
    /**根据交易 signature 获取交易 */
    getTransactionBySignature(signature: string): Promise<TransactionJSON | undefined>;
    /**查询交易是否存在 */
    getCountTransaction(args: {
      /**交易类型 */
      type?: string;
      /**交易的发起账户 */
      senderId?: string;
      /**交易的接收账户 */
      recipientId?: string;
      /**交易的签名 */
      signature?: string;
      /**索引值 */
      storageValue?: string;
      /**起始高度 */
      startHeight?: number;
      /**结束高度 */
      endHeight?: number;
    }): Promise<number>;
    /**某个账户是否购买指定的 dappid */
    getPurchaseDApp(address: string, dappid: string): Promise<boolean>;
    /**查询交易是否已经在未处理交易中 */
    checkRepeatInUntreatedTransaction(senderId: string, signature: string): Promise<boolean>;
    /**查询交易是否已经在链上 */
    checkRepeatInBlockChainTransaction(signature: string): Promise<boolean>;
    /**查询是否二次操作某笔交易 */
    checkSecondaryTransaction(args: {
      type?: string;
      senderId?: string;
      storageValue: string;
    }): Promise<boolean>;
    /**查询新生成的受托人 */
    getNewDelegates(height: number): Promise<string[]>;
  }
  // #endregion
}
