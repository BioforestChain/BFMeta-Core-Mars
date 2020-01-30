declare namespace BFChainCore {
  type Transaction<AJ extends object = object> = import("./transaction").Transaction<AJ>;
  type TransactionModelConstructor = typeof import("./transaction").Transaction;

  type GetMessageAssetModel<T> = T extends TransactionJSON<infer U> ? U : any;
  type GetAssetModel<T> = GetMessageAssetModel<T> extends import("@bfchain/protobuf").Message<
    infer U
  >
    ? U
    : any;
  type GetTransactionAssetJSON<T extends Transaction> = T["ASSET_JSON_TYPE"];

  //#region Transaction

  type TransactionMixJSON<
    AssetJSON extends object = object,
    Opts extends TransactionOptions = {}
  > = Opts["hasRecipientId"] extends true
    ? Omit<TransactionJSON<AssetJSON>, "recipientId"> & { recipientId: string }
    : Opts["hasRecipientId"] extends false
    ? Omit<TransactionJSON<AssetJSON>, "recipientId"> & { recipientId: undefined }
    : TransactionJSON<AssetJSON>;

  type TransactionOptions = {
    hasRecipientId?: boolean;
  };
  interface TransactionStorageJSON {
    key: string;
    value: string;
  }
  interface TransactionJSON<AssetJSON extends object = object> {
    version: number;
    type: string;
    senderId: string;
    senderPublicKey: string;
    senderSecondPublicKey?: string;
    recipientId?: string;
    rangeType: BFChainCore.RANGE_TYPE;
    range: string[];
    fee: string;
    timestamp: number;
    dappid?: string;
    lns?: string;
    sourceIP?: string;
    fromMagic: string;
    toMagic: string;
    applyBlockHeight: number;
    numberOfEffectiveBlocks: number;
    signature: string;
    signSignature?: string;
    remark: { [key: string]: string };
    id: string;
    asset: AssetJSON;
    storage?: TransactionStorageJSON;
    storageKey?: TransactionStorageJSON["key"];
    storageValue?: TransactionStorageJSON["value"];
    nonce: number;
  }
  //#endregion

  //#region Atom Transaction

  type AcceptVoteTransactionJSON = TransactionMixJSON<
    AcceptVoteAssetJSON,
    { hasRecipientId: false }
  >;
  type BeExchangeAssetTransactionJSON = TransactionMixJSON<
    BeExchangeAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type BeExchangeSpecialAssetTransactionJSON = TransactionMixJSON<
    BeExchangeSpecialAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type CustomTransactionJSON = TransactionJSON<CustomAssetJSON>;
  type DAppPurchasingTransactionJSON = TransactionMixJSON<
    DAppPurchasingAssetJSON,
    { hasRecipientId: true }
  >;
  type DAppTransactionJSON = TransactionMixJSON<DAppAssetJSON, { hasRecipientId: false }>;
  type DelegateTransactionJSON = TransactionMixJSON<DelegateAssetJSON, { hasRecipientId: false }>;
  type DestoryAssetTransactionJSON = TransactionMixJSON<
    DestoryAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type EmigrateAssetTransactionJSON = TransactionMixJSON<
    EmigrateAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type GiftAssetTransactionJSON = TransactionMixJSON<GiftAssetAssetJSON, { hasRecipientId: false }>;
  type GrabAssetTransactionJSON = TransactionMixJSON<GrabAssetAssetJSON, { hasRecipientId: true }>;
  type ImmigrateAssetTransactionJSON = TransactionMixJSON<
    ImmigrateAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type IssueAssetTransactionJSON = TransactionMixJSON<
    IssueAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type LocationNameTransactionJSON = TransactionMixJSON<
    LocationNameAssetJSON,
    { hasRecipientId: false }
  >;
  type MarkTransactionJSON = TransactionMixJSON<MarkAssetJSON, { hasRecipientId: true }>;
  type RejectVoteTransactionJSON = TransactionMixJSON<
    RejectVoteAssetJSON,
    { hasRecipientId: false }
  >;
  type SetLnsManagerTransactionJSON = TransactionMixJSON<
    SetLnsManagerAssetJSON,
    { hasRecipientId: true }
  >;
  type SetLnsRecordValueTransactionJSON = TransactionMixJSON<
    SetLnsRecordValueAssetJSON,
    { hasRecipientId: false }
  >;
  type SignatureTransactionJSON = TransactionMixJSON<SignatureAssetJSON, { hasRecipientId: false }>;
  type SignForAssetTransactionJSON = TransactionMixJSON<
    SignForAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type ToExchangeAssetTransactionJSON = TransactionMixJSON<
    ToExchangeAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type ToExchangeSpecialAssetTransactionJSON = TransactionMixJSON<
    ToExchangeSpecialAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type TransferAssetTransactionJSON = TransactionMixJSON<
    TransferAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type TrustAssetTransactionJSON = TransactionMixJSON<
    TrustAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type UsernameTransactionJSON = TransactionMixJSON<UsernameAssetJSON, { hasRecipientId: false }>;
  type VoteTransactionJSON = TransactionMixJSON<VoteAssetJSON, { hasRecipientId: true }>;
  //#endregion

  //#region Transaction Asset

  interface AcceptVoteAssetJSON {}

  interface ToExchangeAssetJSON {
    cipherPublicKeys: string[];
    toExchangeSource: string;
    beExchangeSource: string;
    toExchangeChainName: string;
    beExchangeChainName: string;
    toExchangeAsset: string;
    beExchangeAsset: string;
    toExchangeNumber: string;
    exchangeRate: BFChainCore.RateJSON<string>;
    // numberOfBeginUnfrozenBlocks?: number;
  }
  interface ToExchangeAssetAssetJSON {
    toExchangeAsset: ToExchangeAssetJSON;
  }

  interface BeExchangeAssetJSON {
    transactionSignature: string;
    ciphertextSignature?: AccountSignatureJSON;
    applyBlockHeight: number;
    // numberOfBeginUnfrozenBlocks?: number;
    numberOfEffectiveBlocks: number;
    transactionRangeType: BFChainCore.RANGE_TYPE;
    transactionRange: string[];
    toExchangeNumber: string;
    beExchangeNumber: string;
    exchangeAsset: ToExchangeAssetJSON;
  }
  interface BeExchangeAssetAssetJSON {
    beExchangeAsset: BeExchangeAssetJSON;
  }

  interface ToExchangeSpecialAssetJSON {
    cipherPublicKeys: string[];
    toExchangeSource: string;
    beExchangeSource: string;
    toExchangeChainName: string;
    beExchangeChainName: string;
    toExchangeAsset: string;
    beExchangeAsset: string;
    exchangeNumber: string;
    // numberOfBeginUnfrozenBlocks?: number;
    exchangeAssetType: BFChainCore.SPECIAL_ASSET_TYPE;
    exchangeDirection: BFChainCore.EXCHANGE_DIRECTION;
  }
  interface ToExchangeSpecialAssetAssetJSON {
    toExchangeSpecialAsset: ToExchangeSpecialAssetJSON;
  }

  interface BeExchangeSpecialAssetJSON {
    transactionSignature: string;
    ciphertextSignature?: AccountSignatureJSON;
    applyBlockHeight: number;
    // numberOfBeginUnfrozenBlocks?: number;
    numberOfEffectiveBlocks: number;
    transactionRangeType: BFChainCore.RANGE_TYPE;
    transactionRange: string[];
    exchangeSpecialAsset: ToExchangeSpecialAssetJSON;
  }
  interface BeExchangeSpecialAssetAssetJSON {
    beExchangeSpecialAsset: BeExchangeSpecialAssetJSON;
  }
  interface DAppPurchaseAssetJSON {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
  }
  interface DAppJSON {
    sourceChainName: string;
    sourceChainMagic: string;
    dappid: string;
    type: BFChainCore.DAPP_TYPE;
    purchaseAsset?: DAppPurchaseAssetJSON;
  }
  interface DAppAssetJSON {
    dapp: DAppJSON;
  }

  interface DAppPurchasingJSON {
    dappPossessor: string;
    dappAsset: DAppJSON;
  }
  interface DAppPurchasingAssetJSON {
    dappPurchasing: DAppPurchasingJSON;
  }
  interface DelegateJSON {
    username: string;
    publicKey: string;
  }
  interface DelegateAssetJSON {
    delegate: DelegateJSON;
  }

  interface DestoryAssetJSON {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
  }
  interface DestoryAssetAssetJSON {
    destoryAsset: DestoryAssetJSON;
  }

  interface IssueAssetJSON {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    expectedIssuedAssets: string;
    genesisAddress: string;
  }
  interface IssueAssetAssetJSON {
    issueAsset: IssueAssetJSON;
  }

  interface LocationNameJSON {
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    operationType: BFChainCore.LOCATION_NAME_OPERATION_TYPE;
  }
  interface LocationNameAssetJSON {
    locationName: LocationNameJSON;
  }

  interface LocationNameRecordJSON {
    recordType: BFChainCore.RECORD_TYPE;
    recordValue: string;
  }
  interface MarkJSON {
    markPossessor: string;
    content: string;
    action: string;
    dapp: DAppJSON;
  }
  interface MarkAssetJSON {
    mark: MarkJSON;
  }
  interface RejectVoteAssetJSON {}

  interface SetLnsManagerJSON {
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    manager: string;
  }
  interface SetLnsManagerAssetJSON {
    lnsManager: SetLnsManagerJSON;
  }
  interface SetLnsRecordValueJSON {
    name: string;
    sourceChainName: string;
    sourceChainMagic: string;
    operationType: BFChainCore.RECORD_OPERATION_TYPE;
    addRecord?: LocationNameRecordJSON;
    deleteRecord?: LocationNameRecordJSON;
  }
  interface SetLnsRecordValueAssetJSON {
    lnsRecordValue: SetLnsRecordValueJSON;
  }

  interface SignatureJSON {
    publicKey: string;
  }
  interface SignatureAssetJSON {
    signature: SignatureJSON;
  }

  interface TransferAssetJSON {
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
  }
  interface TransferAssetAssetJSON {
    transferAsset: TransferAssetJSON;
  }
  interface UsernameJSON {
    alias: string;
    publicKey: string;
  }
  interface UsernameAssetJSON {
    username: UsernameJSON;
  }

  interface VoteJSON {
    equity: string;
  }
  interface VoteAssetJSON {
    vote: VoteJSON;
  }
  interface GiftAssetJSON {
    cipherPublicKeys: string[];
    sourceChainMagic: string;
    sourceChainName: string;
    assetType: string;
    amount: string;
    totalGrabableTimes: number;
    // unitReserveFee: string;
    numberOfBeginUnfrozenBlocks?: number;
    giftDistributionRule: BFChainCore.GIFT_DISTRIBUTION_RULE;
  }
  interface GiftAssetAssetJSON {
    giftAsset: GiftAssetJSON;
  }

  interface GrabAssetJSON {
    blockSignature: string;
    transactionSignature: string;
    /**根据共识规则计算出来的：抢到的金额 */
    amount: string;
    /**用于校验身份的密文签名，如果需要的话 */
    ciphertextSignature?: AccountSignatureJSON;
    //#region 冗余的字段
    /**以下是冗余的字段
     * 都是能从`transactionSignature`中查询出来的，但这个仍然做了存储，是为了确保能够在独立的情况下仍然能够将之渲染出来
     */
    /**礼物交易的接收者列表、dappid、解码密文用的公钥 */
    transactionRangeType: BFChainCore.RANGE_TYPE;
    transactionRange: string[];

    applyBlockHeight: number;
    numberOfBeginUnfrozenBlocks?: number;
    numberOfEffectiveBlocks: number;

    /**礼物配置 */
    giftAsset: GiftAssetJSON;
    //#endregion
  }
  interface GrabAssetAssetJSON {
    grabAsset: GrabAssetJSON;
  }
  interface FeeRateJSON {
    senderPaidFeeRate: BFChainCore.FractionJSON;
    recipientPaidFeeRate: BFChainCore.FractionJSON;
  }
  interface CustomJSON {
    type: string;
    data: string;
  }
  interface CustomAssetJSON {
    custom: CustomJSON;
  }

  interface TrustAssetJSON {
    trustees: string[];
    numberOfSignFor: number;
    // numberOfBeginUnfrozenBlocks?: number;
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
  }
  interface TrustAssetAssetJSON {
    trustAsset: TrustAssetJSON;
  }
  interface AccountSignatureJSON {
    publicKey: string;
    signature: string;
    secondPublicKey?: string;
    signSignature?: string;
  }
  interface SignForAssetJSON {
    transactionSignature: string;
    thirdPartySignatures: AccountSignatureJSON[];
    trustSenderId: string;
    trustRecipientId: string;
    trustNumberOfSignFor: number;
    applyBlockHeight: number;
    // numberOfBeginUnfrozenBlocks?: number;
    numberOfEffectiveBlocks: number;
    /**委托信息 */
    trustAsset: TrustAssetJSON;
  }
  interface SignForAssetAssetJSON {
    signForAsset: SignForAssetJSON;
  }
  interface EmigrateAssetJSON {
    genesisDelegateSignature: AccountSignatureJSON;
    sourceChainName: string;
    sourceChainMagic: string;
    assetType: string;
    amount: string;
  }
  interface EmigrateAssetAssetJSON {
    emigrateAsset: EmigrateAssetJSON;
  }

  interface ImmigrateAssetJSON {
    genesisDelegateSignature: AccountSignatureJSON;
    emigrateAssetTransaction: EmigrateAssetTransactionJSON;
  }
  interface ImmigrateAssetAssetJSON {
    immigrateAsset: ImmigrateAssetJSON;
  }
  //#endregion
}
