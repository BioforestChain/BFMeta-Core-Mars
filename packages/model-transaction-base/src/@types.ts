declare namespace BFChainCore {
  type Transaction<AJ extends object = object> = import("./transaction").Transaction<AJ>;
  type TransactionModelConstructor = typeof import("./transaction").Transaction;

  type GetMessageAssetModel<T> = T extends TransactionJSON<infer U> ? U : any;
  type GetAssetModel<T> = GetMessageAssetModel<T> extends import("@bfchain/protobuf").Message<
    infer U
  >
    ? U
    : any;
  type GetTransactionJSONAssetJSON<T extends TransactionJSON> = T["asset"];
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
    /**事件的索引键，提供额外查询使用的字段名 */
    key: string;
    /**事件的索引值，提供额外查询使用的字段值 */
    value: string;
  }
  interface TransactionJSON<AssetJSON extends object = object> {
    /**事件版本号 */
    version: number;
    /**事件类型 */
    type: string;
    /**事件的发起账户地址，base58 编码的 16 进制字符串 */
    senderId: string;
    /**事件的发起账户公钥，128 个字节的 16 进制字符串 */
    senderPublicKey: string;
    /**事件的发起账户安全公钥，128 个字节的 16 进制字符串 */
    senderSecondPublicKey?: string;
    /**事件的接收账户地址，base58 编码的 16 进制字符串 */
    recipientId?: string;
    /**事件的接收范围类型 */
    rangeType: BFChainCore.RANGE_TYPE;
    /**事件的接收范围 */
    range: string[];
    /**事件的手续费 */
    fee: string;
    /**事件的时间戳 */
    timestamp: number;
    /**事件所属的 dappid */
    dappid?: string;
    /**事件所属的位名 */
    lns?: string;
    /**事件的来源IP，IPv4或者IPv6，不包含头尾(例如: 127.0.0.1)，默认为空 */
    sourceIP?: string;
    /**事件的来源链网络标识符 */
    fromMagic: string;
    /**事件的去往链网络标识符 */
    toMagic: string;
    /**事件的发起高度 */
    applyBlockHeight: number;
    /**事件的有效高度 */
    effectiveBlockHeight: number;
    /**事件的签名 */
    signature: string;
    /**事件的安全签名 */
    signSignature?: string;
    /**事件的备注信息 */
    remark: { [key: string]: string };
    /**实际事件部分 */
    asset: AssetJSON;
    /**事件的索引对象 */
    storage?: TransactionStorageJSON;
    /**事件的索引键，提供额外查询使用的字段名 */
    storageKey?: TransactionStorageJSON["key"];
    /**事件的索引值，提供额外查询使用的字段值 */
    storageValue?: TransactionStorageJSON["value"];
    /**事件 pow 噪点 */
    nonce: number;
  }
  //#endregion

  //#region Transaction Asset
  interface UsernameJSON {
    /**用户名字符串，大小写字母、数字、下划线组成，1-20 个字符，不能包含本链名 */
    alias: string;
  }
  interface UsernameAssetJSON {
    /**地址名命事件附带信息 */
    username: UsernameJSON;
  }
  interface DelegateAssetJSON {}
  interface AcceptVoteAssetJSON {}
  interface RejectVoteAssetJSON {}
  interface VoteJSON {
    /**投出的权益数，0-9 组成并且不包含小数点，允许为 0 */
    equity: string;
  }
  interface VoteAssetJSON {
    /**投票事件附带信息 */
    vote: VoteJSON;
  }

  interface DAppJSON {
    /**dappid 所属的链名，小写字母组成，3-8 位 */
    sourceChainName: string; // chain_name;
    /**dappid 所属的链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string; // chain_magic;
    /**dappid，大写字母或数字组成，8 个字符，最后一位是校验位 */
    dappid: string;
    /**dappid 的类型，只能为 0 或 1；0 表示这个 dappid 是付费使用的，1 表示这个 dappid 是免费使用的 */
    type: BFChainCore.DAPP_TYPE;
    /**购买 dappid 使用的权益 */
    purchaseAsset?: string; // asset_amount;
  }
  interface DAppAssetJSON {
    /**发行 dapp 事件附带信息 */
    dapp: DAppJSON;
  }
  interface DAppPurchasingJSON {
    /**购买的 dapp 信息 */
    dappAsset: DAppJSON;
  }
  interface DAppPurchasingAssetJSON {
    /**购买 dapp 事件附带信息 */
    dappPurchasing: DAppPurchasingJSON;
  }

  interface MarkJSON {
    /**存证内容，为任意字符串 */
    content: string;
    /**存证类型，为任意字符串，用于区别存证 */
    action: string;
    /**存证事件使用的 dapp 信息 */
    dapp: DAppJSON;
  }
  interface MarkAssetJSON {
    /**存证事件附带信息 */
    mark: MarkJSON;
  }

  interface SignatureJSON {
    /**安全密钥生成的公钥，128 个字节的 16 进制字符串 */
    publicKey: string;
  }
  interface SignatureAssetJSON {
    /**设置安全密码事件附带信息 */
    signature: SignatureJSON;
  }

  interface IssueAssetJSON {
    /**权益所属链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**权益所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**权益名称，大写字母组成，3-5 个字符 */
    assetType: string;
    /**发行的新权益总数，权益数量由0-9共十个数字组成，权益数量不包含小数点且必须大于0 */
    expectedIssuedAssets: string;
  }
  interface IssueAssetAssetJSON {
    /**发行权益事件附带信息 */
    issueAsset: IssueAssetJSON;
  }
  interface TransferAssetJSON {
    /**转移的权益所属链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**转移的权益所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**转移的权益名称，大写字母组成，3-5 个字符 */
    assetType: string;
    /**转移的权益数量，0-9 组成并且不包含小数点，必须大于0 */
    amount: string;
  }
  interface TransferAssetAssetJSON {
    /**权益转移事件附带信息 */
    transferAsset: TransferAssetJSON;
  }
  interface DestoryAssetJSON {
    /**销毁的权益所属链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**销毁的的权益所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**销毁的权益名称，大写字母组成，3-5 个字符 */
    assetType: string;
    /**销毁的权益数量，0-9 组成并且不包含小数点，必须大于0 */
    amount: string;
  }
  interface DestoryAssetAssetJSON {
    /**权益销毁事件附带信息 */
    destoryAsset: DestoryAssetJSON;
  }
  interface EmigrateAssetJSON {
    /**创世受托人签名 */
    genesisDelegateSignature: AccountSignatureJSON;
    /**迁出的权益所属链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**迁出的权益所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**迁出的权益名称，大写字母组成，3-5 个字符 */
    assetType: string;
    /**迁出的权益数量，0-9 组成并且不包含小数点，必须大于0 */
    amount: string;
  }
  interface EmigrateAssetAssetJSON {
    /**权益迁出事件附带信息 */
    emigrateAsset: EmigrateAssetJSON;
  }

  interface ImmigrateAssetJSON {
    /**创世受托人签名 */
    genesisDelegateSignature: AccountSignatureJSON;
    /**完整的主权益迁出事件 */
    emigrateAssetTransaction: EmigrateAssetTransactionJSON;
  }
  interface ImmigrateAssetAssetJSON {
    /**权益迁入事件附带信息 */
    immigrateAsset: ImmigrateAssetJSON;
  }
  interface GiftAssetJSON {
    /**加密密钥生成的公钥数组 */
    cipherPublicKeys: string[];
    /**赠送的权益所属链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**赠送的权益所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**赠送的权益名称，大写字母组成，3-5 个字符 */
    assetType: string;
    /**赠送的权益数量，0-9 组成并且不包含小数点，必须大于0 */
    amount: string;
    /**可被接收的次数，0-9 组成并且不包含小数点，必须大于 0 */
    totalGrabableTimes: number;
    /**开始被签收的区块高度，0-9 组成并且不包含小数点 */
    beginUnfrozenBlockHeight?: number;
    /**接收规则，只能为 0，1 或 2，0 表示平均分配，1 表示根据任意账户的地址的随机分配，2 表示根据接收者列表中账户地址的随机分配 */
    giftDistributionRule: BFChainCore.GIFT_DISTRIBUTION_RULE;
  }
  interface GiftAssetAssetJSON {
    /**权益赠送事件附带信息 */
    giftAsset: GiftAssetJSON;
  }

  interface GrabAssetJSON {
    /**赠送事件所在的区块签名，128 个字节的 16 进制字符串 */
    blockSignature: string;
    /**赠送事件的签名，128 个字节的 16 进制字符串 */
    transactionSignature: string;
    /**根据共识规则计算出来的：抢到的金额 */
    amount: string;
    /**用于校验身份的密文签名，如果需要的话 */
    ciphertextSignature?: AccountSignatureJSON;
    //#region 冗余的字段
    /**以下是冗余的字段
     * 都是能从`transactionSignature`中查询出来的，但这个仍然做了存储，是为了确保能够在独立的情况下仍然能够将之渲染出来
     */

    /**礼物配置 */
    giftAsset: GiftAssetJSON;
    //#endregion
  }
  interface GrabAssetAssetJSON {
    /**接收权益赠送事件附带信息 */
    grabAsset: GrabAssetJSON;
  }
  interface TrustAssetJSON {
    /**见证账户地址数组，base58 编码的 16 进制字符串数组 */
    trustees: string[];
    /**签收时需要的见证人签名数量，0-9 组成，必须大于 0，最大值为指定的受托人数量+2 */
    numberOfSignFor: number;
    /**见证的权益所属链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**见证的权益所属链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**见证的权益名称，大写字母组成，3-5 个字符 */
    assetType: string;
    /**见证的权益数量，0-9 组成并且不包含小数点，必须大于0 */
    amount: string;
  }
  interface TrustAssetAssetJSON {
    /**见证事件附带信息 */
    trustAsset: TrustAssetJSON;
  }
  interface AccountSignatureJSON {
    /**账户密钥生成的公钥 */
    publicKey: string;
    /**账户公钥生成的签名 */
    signature: string;
    /**账户安全密钥生成的公钥 */
    secondPublicKey?: string;
    /**账户安全公钥生成的签名 */
    signSignature?: string;
  }
  interface SignForAssetJSON {
    /**见证交易的签名，*/
    transactionSignature: string;
    /**见证交易的发起账户地址，base58 编码的 16 进制字符串 */
    trustSenderId: string;
    /**见证交易的接收账户地址，base58 编码的 16 进制字符串 */
    trustRecipientId: string;
    /**见证信息 */
    trustAsset: TrustAssetJSON;
  }
  interface SignForAssetAssetJSON {
    /**签收见证事件事件附带信息 */
    signForAsset: SignForAssetJSON;
  }
  interface FeeRateJSON {
    senderPaidFeeRate: BFChainCore.FractionJSON;
    recipientPaidFeeRate: BFChainCore.FractionJSON;
  }
  interface ToExchangeAssetJSON {
    /**加密密钥生成的公钥数组 */
    cipherPublicKeys: string[];
    /**用于交换的权益来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    toExchangeSource: string;
    /**被交换的权益来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    beExchangeSource: string;
    /**用于交换的权益来源链名，小写字母组成，3-8 位 */
    toExchangeChainName: string;
    /**被交换的权益来源链名，小写字母组成，3-8 位 */
    beExchangeChainName: string;
    /**用于交换的权益名，大写字母组成，3-5 个字符 */
    toExchangeAsset: string;
    /**被交换的权益名，大写字母组成，3-5 个字符 */
    beExchangeAsset: string;
    /**用于交换的权益数量，0-9 组成并且不包含小数点，必须大于 0 */
    toExchangeNumber: string;
    /**权益的交换比例 */
    exchangeRate: BFChainCore.RateJSON<string>;
  }
  interface ToExchangeAssetAssetJSON {
    /**发起权益交换事件附带信息 */
    toExchangeAsset: ToExchangeAssetJSON;
  }

  interface BeExchangeAssetJSON {
    /**发起权益交换的事件签名，128 个字节的 16 进制字符串 */
    transactionSignature: string;
    /**加密密钥生成的签名数组 */
    ciphertextSignature?: AccountSignatureJSON;
    /**用于交换的权益数量，权益数量由0-9共十个数字组成，权益数量不包含小数点且必须大于0 */
    toExchangeNumber: string;
    /**交换得到的权益数量，权益数量由0-9共十个数字组成，权益数量不包含小数点且必须大于0 */
    beExchangeNumber: string;
    /**权益交换信息 */
    exchangeAsset: ToExchangeAssetJSON;
  }
  interface BeExchangeAssetAssetJSON {
    /**接收权益交换事件附带信息 */
    beExchangeAsset: BeExchangeAssetJSON;
  }

  interface ToExchangeSpecialAssetJSON {
    /**加密密钥生成的公钥数组 */
    cipherPublicKeys: string[];
    /**用于交换的权益/资产来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    toExchangeSource: string;
    /**被交换的资产/权益来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    beExchangeSource: string;
    /**用于交换的权益/资产来源链名，小写字母组成，3-8 位 */
    toExchangeChainName: string;
    /**被交换的资产/权益来源链名，小写字母组成，3-8 位 */
    beExchangeChainName: string;
    /**用于交换的权益/资产名，大写字母组成，3-5 个字符 */
    toExchangeAsset: string;
    /**被交换的资产/权益名，大写字母组成，3-5 个字符 */
    beExchangeAsset: string;
    /**用于交换或交换得到的权益数量，权益数量由0-9共十个数字组成，权益数量不包含小数点且必须大于0 */
    exchangeNumber: string;
    /**资产的类型，只能为 0 或 1，0 为 dappid，1 为位名 */
    exchangeAssetType: BFChainCore.SPECIAL_ASSET_TYPE;
    /**资产的来源，只能为 0 或 1，0 为出售，1 为求购 */
    exchangeDirection: BFChainCore.EXCHANGE_DIRECTION;
  }
  interface ToExchangeSpecialAssetAssetJSON {
    /**发起资产交换事件附带信息 */
    toExchangeSpecialAsset: ToExchangeSpecialAssetJSON;
  }
  interface BeExchangeSpecialAssetJSON {
    /**发起资产交换的事件签名，128 个字节的 16 进制字符串 */
    transactionSignature: string;
    /**加密密钥生成的签名数组 */
    ciphertextSignature?: AccountSignatureJSON;
    /**资产交换信息 */
    exchangeSpecialAsset: ToExchangeSpecialAssetJSON;
  }
  interface BeExchangeSpecialAssetAssetJSON {
    /**接收资产交换事件附带信息 */
    beExchangeSpecialAsset: BeExchangeSpecialAssetJSON;
  }

  interface LocationNameJSON {
    /**注册/注销的位名，2-1024 个字符，每级域名最大长度为 128 个字符，一级域名只能是小写字母组成，二级及以上开头及结尾只能由小写字母或数字组成，中间可以包含下划线，根域名必须是本链链名 */
    name: string;
    /**注册/注销的位名来源链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**注册/注销的位名来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**操作类型，只能是 0 或 1，0 表示注册位名，1 表示注销位名 */
    operationType: BFChainCore.LOCATION_NAME_OPERATION_TYPE;
  }
  interface LocationNameAssetJSON {
    /**注册/注销的位名事件附带信息 */
    locationName: LocationNameJSON;
  }
  interface LocationNameRecordJSON {
    /**解析值类型 */
    recordType: BFChainCore.RECORD_TYPE;
    /**解析值 */
    recordValue: string;
  }
  interface SetLnsManagerJSON {
    /**位名，2-1024 个字符，每级域名最大长度为 128 个字符，一级域名只能是小写字母组成，二级及以上开头及结尾只能由小写字母或数字组成，中间可以包含下划线，根域名必须是本链链名 */
    name: string;
    /**位名来源链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**位名来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
  }
  interface SetLnsManagerAssetJSON {
    /**设置位名管理员事件附带信息 */
    lnsManager: SetLnsManagerJSON;
  }
  interface SetLnsRecordValueJSON {
    /**位名，2-1024 个字符，每级域名最大长度为 128 个字符，一级域名只能是小写字母组成，二级及以上开头及结尾只能由小写字母或数字组成，中间可以包含下划线，根域名必须是本链链名 */
    name: string;
    /**位名来源链名，小写字母组成，3-8 位 */
    sourceChainName: string;
    /**位名来源链网络标识符，大写字母或数字组成，5 个字符，最后一位是校验位 */
    sourceChainMagic: string;
    /**操作类型，只能为 0 或 1 或 2，0 表示添加，1 表示删除，2 表示更新 */
    operationType: BFChainCore.RECORD_OPERATION_TYPE;
    /**增加的解析值，解析值的类型只能为 A 或 AAAA 或 LNG_LAT 或 BLOCK_CHAIN_ACCOUNT_ADDRESS，A 表示 ipV4，AAAA 表示 ipV6，LNG_LAT 表示经纬度，BLOCK_CHAIN_ACCOUNT_ADDRESS 表示链上账户地址，下划线前面为解析值类型，下划线后面为解析值，可选，操作类型为 0 或 2 时必填 */
    addRecord?: LocationNameRecordJSON;
    /**删除的解析值，解析值的类型只能为 A 或 AAAA 或 LNG_LAT 或 BLOCK_CHAIN_ACCOUNT_ADDRESS，A 表示 ipV4，AAAA 表示 ipV6，LNG_LAT 表示经纬度，BLOCK_CHAIN_ACCOUNT_ADDRESS 表示链上账户地址，下划线前面为解析值类型，下划线后面为解析值，可选，操作类型为 1 或 2 时必填 */
    deleteRecord?: LocationNameRecordJSON;
  }
  interface SetLnsRecordValueAssetJSON {
    /**设置位名解析值事件附带信息 */
    lnsRecordValue: SetLnsRecordValueJSON;
  }
  //#endregion

  //#region Atom Transaction
  type UsernameTransactionJSON = TransactionMixJSON<UsernameAssetJSON, { hasRecipientId: false }>;
  type SignatureTransactionJSON = TransactionMixJSON<SignatureAssetJSON, { hasRecipientId: false }>;
  type DelegateTransactionJSON = TransactionMixJSON<DelegateAssetJSON, { hasRecipientId: false }>;
  type AcceptVoteTransactionJSON = TransactionMixJSON<
    AcceptVoteAssetJSON,
    { hasRecipientId: false }
  >;
  type RejectVoteTransactionJSON = TransactionMixJSON<
    RejectVoteAssetJSON,
    { hasRecipientId: false }
  >;
  type VoteTransactionJSON = TransactionMixJSON<VoteAssetJSON, { hasRecipientId: true }>;

  type DAppTransactionJSON = TransactionMixJSON<DAppAssetJSON, { hasRecipientId: true }>;
  type DAppPurchasingTransactionJSON = TransactionMixJSON<
    DAppPurchasingAssetJSON,
    { hasRecipientId: true }
  >;
  type MarkTransactionJSON = TransactionMixJSON<MarkAssetJSON, { hasRecipientId: true }>;

  type IssueAssetTransactionJSON = TransactionMixJSON<
    IssueAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type TransferAssetTransactionJSON = TransactionMixJSON<
    TransferAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type DestoryAssetTransactionJSON = TransactionMixJSON<
    DestoryAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type EmigrateAssetTransactionJSON = TransactionMixJSON<
    EmigrateAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type ImmigrateAssetTransactionJSON = TransactionMixJSON<
    ImmigrateAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type GiftAssetTransactionJSON = TransactionMixJSON<GiftAssetAssetJSON, { hasRecipientId: false }>;
  type GrabAssetTransactionJSON = TransactionMixJSON<GrabAssetAssetJSON, { hasRecipientId: true }>;
  type TrustAssetTransactionJSON = TransactionMixJSON<
    TrustAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type SignForAssetTransactionJSON = TransactionMixJSON<
    SignForAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type ToExchangeAssetTransactionJSON = TransactionMixJSON<
    ToExchangeAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type BeExchangeAssetTransactionJSON = TransactionMixJSON<
    BeExchangeAssetAssetJSON,
    { hasRecipientId: true }
  >;
  type ToExchangeSpecialAssetTransactionJSON = TransactionMixJSON<
    ToExchangeSpecialAssetAssetJSON,
    { hasRecipientId: false }
  >;
  type BeExchangeSpecialAssetTransactionJSON = TransactionMixJSON<
    BeExchangeSpecialAssetAssetJSON,
    { hasRecipientId: true }
  >;

  type LocationNameTransactionJSON = TransactionMixJSON<
    LocationNameAssetJSON,
    { hasRecipientId: true }
  >;
  type SetLnsManagerTransactionJSON = TransactionMixJSON<
    SetLnsManagerAssetJSON,
    { hasRecipientId: true }
  >;
  type SetLnsRecordValueTransactionJSON = TransactionMixJSON<
    SetLnsRecordValueAssetJSON,
    { hasRecipientId: false }
  >;
  //#endregion
}
