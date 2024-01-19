declare namespace BFChainCore {
  // #region TransactionFactory
  type TransactionFactory<T extends Transaction> =
    import("./atom_transaction/_txbase").TransactionFactory<T>;
  type TransactionFactoryConstructor<T extends Transaction = any> = new (
    ...args: any[]
  ) => TransactionFactory<T>;
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
  interface ApplyResult_DestroyAssetJSON {
    type: "destroyAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      assetsApplyAddress: string;
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
      /**冻结的事件 id */
      frozenId: string;
      /**冻结事件的发起账户地址 */
      recipientId: string;
    };
  }

  interface ApplyResult_SignForAssetJSON {
    type: "signForAsset";
    applyInfo: {
      address: string;
      publicKey: string;
      /**冻结的事件 id */
      frozenId: string;
      /**冻结事件的发起账户地址 */
      frozenAddress: string;
      /**冻结事件的接收账户地址 */
      recipientId: string;
      assetInfo: AssetInfoJSON;
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
      /**dappid 的拥有者地址 */
      possessorAddress: string;
      type: DAPP_TYPE;
      purchaseAsset?: string;
    };
  }

  interface ApplyResult_FrozenDAppidJSON {
    type: "frozenDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      dappid: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
      frozenId: string;
    };
  }

  interface ApplyResult_UnfrozenDAppidJSON {
    type: "unfrozenDAppid";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      dappid: string;
      /**dappid 的拥有者地址 */
      possessorAddress: string;
      frozenId: string;
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
      /**创世账户地址 */
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
      genesisBlock: string;
    };
  }

  interface ApplyResult_RegisterLocationNameJSON {
    type: "registerLocationName";
    applyInfo: {
      /**事件的发起地址 */
      address: string;
      publicKey: string;
      name: string;
      sourceChainName: string;
      sourceChainMagic: string;
      /**lns 的拥有者地址 */
      possessorAddress: string;
    };
  }

  interface ApplyResult_CancelLocationNameJSON {
    type: "cancelLocationName";
    applyInfo: {
      /**事件的发起账户地址 */
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      name: string;
    };
  }

  interface ApplyResult_SetLnsManagerJSON {
    type: "setLnsManager";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      name: string;
      manager: string;
    };
  }

  interface ApplyResult_SetLnsRecordValueJSON {
    type: "setLnsRecordValue";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      name: string;
      operationType: RECORD_OPERATION_TYPE;
      addRecord?: LocationNameRecordJSON;
      deleteRecord?: LocationNameRecordJSON;
    };
  }

  interface ApplyResult_FrozenLocationNameJSON {
    type: "frozenLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      name: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
      frozenId: string;
    };
  }

  interface ApplyResult_UnfrozenLocationNameJSON {
    type: "unfrozenLocationName";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      name: string;
      /**lns 的拥有者地址 */
      possessorAddress: string;
      frozenId: string;
    };
  }

  interface ApplyResult_FrozenEntityJSON {
    type: "frozenEntity";
    applyInfo: {
      address: string;
      publicKey: string;
      sourceChainName: string;
      sourceChainMagic: string;
      entityId: string;
      minEffectiveHeight: number;
      maxEffectiveHeight: number;
      frozenId: string;
    };
  }

  interface ApplyResult_UnfrozenEntityJSON {
    type: "unfrozenEntity";
    applyInfo: {
      address: string;
      publicKey: string;
      /**entityId 的拥有者地址 */
      possessorAddress: string;
      sourceChainName: string;
      sourceChainMagic: string;
      entityId: string;
      frozenId: string;
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
    | ApplyResult_DestroyAssetJSON
    | ApplyResult_FrozenAssetJSON
    | ApplyResult_UnfrozenAssetJSON
    | ApplyResult_SignForAssetJSON
    | ApplyResult_FrozenAccountJSON
    | ApplyResult_IssueDAppidJSON
    | ApplyResult_FrozenDAppidJSON
    | ApplyResult_UnfrozenDAppidJSON
    | ApplyResult_IssueAssetJSON
    | ApplyResult_RegisterChainJSON
    | ApplyResult_RegisterLocationNameJSON
    | ApplyResult_CancelLocationNameJSON
    | ApplyResult_SetLnsManagerJSON
    | ApplyResult_SetLnsRecordValueJSON
    | ApplyResult_FrozenLocationNameJSON
    | ApplyResult_UnfrozenLocationNameJSON
    | ApplyResult_FrozenEntityJSON
    | ApplyResult_UnfrozenEntityJSON;

  //#endregion
}
