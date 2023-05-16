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

  namespace Macro {
    type MACRO_INPUT_TYPE = import("./atom_input/constants").MACRO_INPUT_TYPE;
    type MACRO_NUMBER_FORMAT = import("./atom_input/constants").MACRO_NUMBER_FORMAT;
    type BaseInputModel<T extends MACRO_INPUT_TYPE> =
      import("./atom_input/_baseInput").BaseInputModel<T>;

    interface BaseInputJSON<T extends MACRO_INPUT_TYPE> {
      type: T;
      name: string;
      keyPath: string;
      // regexp
      pattern?: string;
    }
    interface TextInputJSON<
      T extends MACRO_INPUT_TYPE = import("./atom_input/constants").MACRO_INPUT_TYPE.TEXT,
    > extends BaseInputJSON<T> {}
    interface AddressInputJSON
      extends TextInputJSON<import("./atom_input/constants").MACRO_INPUT_TYPE.ADDRESS> {}
    interface SignatureInputJSON
      extends TextInputJSON<import("./atom_input/constants").MACRO_INPUT_TYPE.SIGNATURE> {}

    interface NumberInputJSON<
      T extends MACRO_INPUT_TYPE = import("./atom_input/constants").MACRO_INPUT_TYPE.NUMBER,
    > extends BaseInputJSON<T> {
      min?: FractionJSON<string>;
      max?: FractionJSON<string>;
      step?: FractionJSON<string>;
      format: MACRO_NUMBER_FORMAT;
    }

    interface CalcInputJSON
      extends NumberInputJSON<import("./atom_input/constants").MACRO_INPUT_TYPE.CALC> {
      calc: string;
    }

    type InputJSON =
      | TextInputJSON
      | AddressInputJSON
      | SignatureInputJSON
      | NumberInputJSON
      | CalcInputJSON;
  }
  interface MacroJSON {
    inputs: Macro.InputJSON[];
    template: BFChainCore.TransactionJSON;
  }
  interface MacroAssetJSON {
    macro: MacroJSON;
  }
  type MacroTransactionJSON = TransactionMixJSON<MacroAssetJSON, { hasRecipientId: false }>;

  interface MacroCallJSON {
    macroId: string;
    inputs: { [name: string]: string };
  }
  type MacroCallInputs = { [key: string]: string };
  interface MacroCallAssetJSON {
    call: MacroCallJSON;
  }
  type MacroCallTransactionJSON = TransactionMixJSON<MacroCallAssetJSON, { hasRecipientId: false }>;
  //#endregion
}
