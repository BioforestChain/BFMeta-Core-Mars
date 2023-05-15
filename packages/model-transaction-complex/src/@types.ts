declare namespace BFChainCore {
  interface CustomJSON {
    type: string;
    data: string;
  }
  interface CustomAssetJSON {
    custom: CustomJSON;
  }
  type CustomTransactionJSON = TransactionJSON<CustomAssetJSON>;

  interface RegisterChainJSON {
    genesisBlock: string;
  }
  interface RegisterChainAssetJSON {
    registerChain: RegisterChainJSON;
  }
  type RegisterChainTransactionJSON = TransactionMixJSON<
    RegisterChainAssetJSON,
    { hasRecipientId: false }
  >;

  interface MultipleJSON {
    transactions: BFChainCore.TransactionJSON[];
  }
  interface MultipleAssetJSON {
    multiple: MultipleJSON;
  }
  type MultipleTransactionJSON = TransactionMixJSON<MultipleAssetJSON, { hasRecipientId: false }>;

  //#region 承诺交易
  interface PromiseJSON {
    /// 承诺兑现时才上链
    transaction: BFChainCore.TransactionJSON;
  }
  interface PromiseAssetJSON {
    promise: PromiseJSON;
  }
  type PromiseTransactionJSON = TransactionMixJSON<PromiseAssetJSON, { hasRecipientId: true }>;

  interface PromiseResolveJSON {
    promiseId: string;
  }
  interface PromiseResolveAssetJSON {
    resolve: PromiseResolveJSON;
  }
  type PromiseResolveTransactionJSON = TransactionMixJSON<
    PromiseResolveAssetJSON,
    { hasRecipientId: true }
  >;
  //#endregion

  //#region 宏交易
  interface MacroJSON {
    inputs: MacroJSON.Inputs[];
    /// json 模板
    transactionTemplate: string;
  }
  namespace MacroJSON {
    interface BaseInput {
      name: string;
      pattern?: string; // regexp
    }
    interface TextInput extends BaseInput {}
    interface AddressInput extends TextInput {}
    interface SignatureInput extends TextInput {}

    interface NumberInput extends BaseInput {
      min?: number;
      max?: number;
      step?: number;
    }

    interface CalcInput extends NumberInput {
      calc: string;
    }

    type Inputs = TextInput | AddressInput | SignatureInput | NumberInput | CalcInput;
  }
  interface MacroAssetJSON {
    macro: MacroJSON;
  }
  type MacroTransactionJSON = TransactionMixJSON<MacroAssetJSON, { hasRecipientId: false }>;
  //#endregion
}
