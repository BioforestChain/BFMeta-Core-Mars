declare namespace BFChainCore {
  // #region TransactionFactory
  type TransactionFactory<
    T extends Transaction
  > = import("./atom_transaction/_txbase").TransactionFactory<T>;
  type TransactionFactoryConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionFactory<T>;
  // #endregion

  // #region TransactonPoW
  type TransactonPoWOptions<T extends Transaction = any> = {
    count: number;
    participation: string;
    event?: BFChainUtil.QueneEventEmitter<TransactonPoWControllerEvents<T>>;
    calculator?: import("./transaction").TransactionCore["transactionPowCalculator"];
  };
  type TransactonPoWControllerEvents<T extends Transaction = any> = {
    start: BFChainUtil.EventInOut<{ diff: string; transaction: T }, { break: boolean }>;
    work: BFChainUtil.EventInOut<{ nonce: number; transaction: T }, { break: boolean }>;
    done: BFChainUtil.EventInOut<{ transaction: T }, any>;
    error: BFChainUtil.EventInOut<{ transaction: T }, any>;
  };
  // #endregion

  //#region SubChainCenter
  interface ApplyResult_SetSecondPublicKeyJSON {
    type: "setSecondPublicKey";
    applyInfo: {
      address: string;
      publicKey: string;
      secondPublicKey: string;
    };
  }
  interface ApplyResult_SetUsernameJSON {
    type: "setUsername";
    applyInfo: {
      address: string;
      publicKey: string;
      alias: string;
    };
  }
  interface ApplyResult_RegisterToDelegateJSON {
    type: "registerToDelegate";
    applyInfo: {
      address: string;
      publicKey: string;
    };
  }
  interface ApplyResult_AcceptVoteJSON {
    type: "acceptVote";
    applyInfo: {
      address: string;
      publicKey: string;
    };
  }
  interface ApplyResult_RejectVoteJSON {
    type: "rejectVote";
    applyInfo: {
      address: string;
      publicKey: string;
    };
  }
  interface ApplyResult_VoteEquityJSON {
    type: "voteEquity";
    applyInfo: {
      address: string;
      publicKey: string;
      equity: string;
      recipientId: string;
    };
  }
  interface ApplyResult_AssetJSON {
    type: "asset";
    applyInfo: {
      address: string;
      publicKey?: string;
      magic: string;
      assetType: string;
      amount: string;
      action: string;
    };
  }
  interface ApplyResult_DestoryAssetJSON {
    type: "destoryAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      magic: string;
      assetType: string;
      amount: string;
    };
  }
  interface ApplyResult_FrozenAssetJSON {
    type: "frozenAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      magic: string;
      assetType: string;
      amount: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
      totalUnfrozenTimes?: number;
    };
  }
  interface ApplyResult_UnfrozenAssetJSON {
    type: "unfrozenAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      magic: string;
      assetType: string;
      amount: string;
      frozenId: string;
      recipientId: string;
    };
  }

  interface ApplyResult_FrozenAccountJSON {
    type: "frozenAccount";
    applyInfo: {
      address: string;
      publicKey: string;
      accountStatus: ACCOUNT_STATUS;
    };
  }

  interface ApplyResult_IssueDAppidJSON {
    type: "issueDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      dappid: string;
      possessorAddress: string;
      type: DAPP_TYPE;
      purchaseAsset?: DAppPurchaseAssetJSON;
    };
  }

  interface ApplyResult_SaleDAppidJSON {
    type: "saleDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      dappid: string;
      sourceChainMagic: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
    };
  }

  interface ApplyResult_PurchaseDAppidJSON {
    type: "purchaseDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      dappid: string;
      possessorAddress: string;
      sourceChainMagic: string;
    };
  }

  interface ApplyResult_IssueAssetJSON {
    type: "issueAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      applyAddress: string;
      sourceChainName: string;
      sourceChainMagic: string;
      assetType: string;
      genesisAddress: string;
      expectedIssuedAssets: string;
      remainAssets: string;
    };
  }

  interface ApplyResult_RegisterChainJSON {
    type: "registerChain";
    applyInfo: {
      address: string;
      publicKey: string;
      genesisBlock: BlockJSON<GenesisBlockRemarkJSON>;
    };
  }

  interface ApplyResult_RegisterLocationNameJSON {
    type: "registerLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainName: string;
      sourceChainMagic: string;
    };
  }

  interface ApplyResult_CancelLocationNameJSON {
    type: "cancelLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
    };
  }

  interface ApplyResult_SetLnsManagerJSON {
    type: "setLnsManager";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
      manager: string;
    };
  }

  interface ApplyResult_SetLnsRecordValueJSON {
    type: "setLnsRecordValue";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
      operationType: RECORD_OPERATION_TYPE;
      addRecord?: LocationNameRecordJSON;
      deleteRecord?: LocationNameRecordJSON;
    };
  }

  interface ApplyResult_SaleLocationNameJSON {
    type: "saleLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      name: string;
      sourceChainMagic: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
    };
  }

  interface ApplyResult_PurchaseLocationNameJSON {
    type: "purchaseLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      possessorAddress: string;
      name: string;
      sourceChainMagic: string;
    };
  }

  type ApplyResultJSON =
    | ApplyResult_SetSecondPublicKeyJSON
    | ApplyResult_SetUsernameJSON
    | ApplyResult_RegisterToDelegateJSON
    | ApplyResult_AcceptVoteJSON
    | ApplyResult_RejectVoteJSON
    | ApplyResult_VoteEquityJSON
    | ApplyResult_AssetJSON
    | ApplyResult_DestoryAssetJSON
    | ApplyResult_FrozenAssetJSON
    | ApplyResult_UnfrozenAssetJSON
    | ApplyResult_FrozenAccountJSON
    | ApplyResult_IssueDAppidJSON
    | ApplyResult_SaleDAppidJSON
    | ApplyResult_PurchaseDAppidJSON
    | ApplyResult_IssueAssetJSON
    | ApplyResult_RegisterChainJSON
    | ApplyResult_RegisterLocationNameJSON
    | ApplyResult_CancelLocationNameJSON
    | ApplyResult_SetLnsManagerJSON
    | ApplyResult_SetLnsRecordValueJSON
    | ApplyResult_SaleLocationNameJSON
    | ApplyResult_PurchaseLocationNameJSON;

  interface CustomTrCenterInterface {
    verify(body: TxBodyJSON, customAsset: CustomAssetJSON): { ret: boolean; message?: string };
    apply(tx: BFChainCore.Transaction): ApplyResultJSON[];
    logicVerify(tx: BFChainCore.Transaction): Promise<{ ret: boolean; message?: string }>;
  }

  interface AccountApiInterface {
    getAccountUsername(address: string): Promise<string | undefined>;
    getAccountIsDelegate(address: string): Promise<number>;
    getAccountIsAcceptVote(address: string): Promise<number>;
    getAccountSecondPublicKey(address: string): Promise<string | undefined>;
    getAccountMissedBlocks(address: string): Promise<number>;
    getAccountProducedBlocks(address: string): Promise<number>;
    getAccountStatus(address: string): Promise<number>;
    getAccountVote(address: string): Promise<string>;
    getAccountEquityInfo(
      address: string,
    ): Promise<{
      round: number;
      equity: string;
    }>;
    getAccountAsset(address: string, magic: string, assetType: string): Promise<string>;
  }

  interface TransactionApiInterface {
    // FIXME: remove
    getTransactionByTransactionSignature(transactionSignature: string): Promise<TransactionJSON>;
    // FIXME: remove
    getTransactionBySenderIdAndType(
      senderId: string,
      type?: string,
      limit?: number,
      offset?: number,
    ): Promise<TransactionJSON[]>;
    // FIXME: remove
    getTransactionByRecipientIdAndType(
      recipientId: string,
      type?: string,
      limit?: number,
      offset?: number,
    ): Promise<TransactionJSON[]>;
    getTransactionByQueryOptions(
      queryOptions: TransactionQueryOptionsJSON,
    ): Promise<TransactionInBlockJSON[]>;
  }

  interface BlockApiInterface {
    getLastBlockHeight(): Promise<number>;
    getBlockByBlockHeight(blockHeight: number): Promise<BlockJSON<any>>;
    getBlockByBlockSignature(blockSignature: string): Promise<BlockJSON<any>>;
    getBlockByBlocksGenerator(
      generatorPublicKey: string,
      limit?: number,
      offset?: number,
    ): Promise<BlockJSON<any>>;
  }

  interface BFChainApiInterface {
    readonly api: {
      readonly blockApi: BlockApiInterface;
      readonly accountApi: AccountApiInterface;
      readonly transactionApi: TransactionApiInterface;
      readonly genesisBlock: BFChainCore.BlockJSON<BFChainCore.GenesisBlockRemarkJSON>;
    };
  }
  //#endregion
}
