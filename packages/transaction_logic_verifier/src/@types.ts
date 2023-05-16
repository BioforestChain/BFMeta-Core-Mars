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
    /**
     * 根据交易 signature 获取交易和交易所在的区块签名
     *
     * @param signature 事件签名
     * @param heightRange 查询范围
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
     * 查询事件在链上的数量
     *
     * @param signatures
     * @param heightRange
     */
    countTransactionsInBlockChainBySignature(
      signatures: string[],
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
    /**
     * 根据 promiseId 获取承诺交易
     *
     * @param promiseId 事件签名
     */
    getPromiseTransaction(promiseId: string): Promise<BFChainCore.TransactionJSON | undefined>;
    /**
     * 根据 macroId 获取宏调用交易
     *
     * @param macroId 事件签名
     * @param inputs 调整参数
     */
    getMacroCallTransaction(
      macroId: string,
      inputs: { [name: string]: string },
    ): Promise<BFChainCore.TransactionJSON | undefined>;
  }
  // #endregion
}
