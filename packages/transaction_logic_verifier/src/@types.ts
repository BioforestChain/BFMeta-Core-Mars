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
    /**
     * 根据交易 signature 获取交易和交易所在的区块签名
     *
     * @param signature 事件签名
     * @param heightRange 查询范围
     *
     */
    getTransactionAndBlockSignatureBySignature(
      signature: string,
      heightRange: { startHeight: number; endHeight: number },
    ): Promise<
      | {
          transaction: TransactionJSON;
          blockSignature: string;
        }
      | undefined
    >;
    /**
     * 根据交易 signature 获取交易
     *
     * @param signature 事件签名
     * @param heightRange 查询范围
     */
    getTransactionBySignature(
      signature: string,
      heightRange: { startHeight: number; endHeight: number },
    ): Promise<TransactionJSON | undefined>;
    /**某个账户是否购买指定的 dappid */
    getPurchaseDApp(address: string, dappid: string): Promise<boolean>;
    /**
     * 查询事件在未处理事件中的数量
     *
     * @param signature
     * @param heightRange
     */
    countTransactionInUntreatedBySignature(senderId: string, signature: string): Promise<number>;
    /**
     * 查询事件在链上的数量
     *
     * @param signature
     * @param heightRange
     */
    countTransactionInBlockChainBySignature(
      signature: string,
      heightRange: { startHeight: number; endHeight: number },
    ): Promise<number>;

    /**
     * 查询是否二次操作某笔交易
     *
     * @param args 查新条件
     */
    checkSecondaryTransaction(args: {
      /**事件类型 */
      type?: string;
      /**事件发起账户地址 */
      senderId?: string;
      /**事件关联索引 */
      storageValue: string;
      /**事件查询范围 */
      heightRange: { startHeight: number; endHeight: number };
    }): Promise<boolean>;
    /**查询新生成的受托人 */
    getNewDelegates(height: number): Promise<string[]>;
    /**查询新注册的受托人数量 */
    getNumberOfNewDelegate(): Promise<number>;
  }
  // #endregion
}
