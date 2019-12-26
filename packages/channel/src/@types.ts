declare namespace BFChainCore {
  //#region ChannelHelper
  type BroadcastNewTransactionEvents<DH extends import("./atom_channel").ChainChannel> = {
    startBroadcasting: BFChainUtil.EventInOut<{ chainChannelList: DH[] }, { break: boolean }>;
    broadcasted: BFChainUtil.EventInOut<
      {
        error: boolean;
        result: import("@bfchain/core-model-channel").NewTransactionReturnModel | Error;
        chainChannel: DH;
      },
      { break: boolean }
    >;
    endBroadcast: BFChainUtil.EventInOut<{ duraction: number }, any>;
  };
  type ChainChannelHanlderEventMap = {
    handleMessageError: {
      in: Error;
      out: undefined;
    };
    onQueryTransaction: {
      in: import("@bfchain/core-model").QueryTransactionArgModel;
      out: QueryTransactionReturnParams | undefined;
    };
    onNewTransaction: {
      in: import("@bfchain/core-model").NewTransactionArgModel;
      out: NewTransactionReturnParams | undefined;
    };
    onQueryBlock: {
      in: import("@bfchain/core-model").QueryBlockArgModel;
      out: QueryBlockReturnParams | undefined;
    };
    onNewBlock: {
      in: import("@bfchain/core-model").NewBlockArgModel;
      out: NewBlockReturnParams | undefined;
    };
    onGetPeerInfo: {
      in: import("@bfchain/core-model").GetPeerInfoArgModel;
      out: GetPeerInfoReturnParams | undefined;
    };
  };
  type ChannelRequestOptions = {
    /**超时 */
    timeout?: number;
    /**红包的密码 */
    grabSecret?: string;
  };
  //#endregion



  // #region TransactionGetterHelperInterface
  interface TransactionGetterHelperInterface {
    /**根据交易 id 获取交易 */
    getTransactionById(id: string): Promise<TransactionJSON | undefined>;
    /**查询交易是否存在 */
    getCountTransaction(args: {
      /**交易类型 */
      type?: string;
      /**交易的发起账户 */
      senderId?: string;
      /**交易的接收账户 */
      recipientId?: string;
      /**交易的签名 */
      id?: string;
      /**索引值 */
      storageValue?: string;
    }): Promise<number>;
    /**某个账户是否购买指定的 dappid */
    getPurchaseDApp(address: string, dappid: string): Promise<boolean>;
    /**查询交易是否已经在未处理交易中 */
    checkRepeatInUntreatedTransaction(senderId: string, id: string): Promise<boolean>;
    /**查询交易是否已经在链上 */
    checkRepeatInBlockChainTransaction(id: string): Promise<boolean>;
    /**查询新生成的受托人 */
    getNewDelegates(height: number): Promise<string[]>;
  }
  // #endregion
}
