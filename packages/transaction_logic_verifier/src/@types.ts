declare namespace BFChainCore {
  // #region TransactionLogicVerifier
  type TransactionLogicVerifier<T extends Transaction> =
    import("./atom_transactionLogicVerifier/_txbaseLogicVerifier").TransactionLogicVerifier<T>;
  type TransactionLogicVerifierConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionLogicVerifier<T>;
  // #endregion

  // #region TransactionGetterHelperInterface
  interface TransactionGetterHelperInterface {
    /**根据交易 subId 获取交易和交易所在的区块id */
    getTransactionAndBlockIdBySubId(
      subId: string,
      heightRange: { startHeight: number; endHeight: number },
    ): Promise<
      | {
          transaction: TransactionJSON;
          blockId: string;
        }
      | undefined
    >;
    /**
     * 根据交易 subId 获取交易
     *
     * @param subId
     * @param heightRange
     */
    getTransactionBySubId(
      subId: string,
      heightRange: { startHeight: number; endHeight: number },
    ): Promise<TransactionJSON | undefined>;
    /**
     * 某个账户是否购买指定的 dappid
     *
     * @param address 账户地址
     * @param dappid dappid
     */
    getPurchaseDApp(address: string, dappid: string): Promise<boolean>;
    /**
     * 查询事件在未处理事件中的数量
     *
     * @param subId
     * @param heightRange
     */
    countTransactionInUntreatedBySubId(senderId: string, subId: string): Promise<number>;
    /**
     * 查询事件在链上的数量
     *
     * @param signature
     * @param heightRange
     */
    countTransactionInBlockChainBySubId(
      subId: string,
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
      storageValue?: string;
      /**迁移凭证 */
      migrateCertificateId?: string;
      /**事件查询范围 */
      heightRange: { startHeight: number; endHeight: number };
    }): Promise<boolean>;
    /**
     * 查询新注册的受托人
     *
     * @param height 区块高度
     */
    getRegisterNewDelegates(height: number): Promise<string[]>;
    /**
     * 查询当前轮新注册的受托人数量
     *
     */
    getNumberOfNewDelegate(): Promise<number>;
  }
  // #endregion
}
