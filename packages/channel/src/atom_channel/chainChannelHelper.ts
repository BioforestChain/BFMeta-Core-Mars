import {
  Injectable,
  Exception,
  bindThis,
  PromiseOut,
  safePromiseThen,
  safePromiseOffThen,
  cacheGetter,
} from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  QueryTransactionArgModel,
  QueryTransactionReturnModel,
  RESPONSE_STATUS,
  NewTransactionArgModel,
  NewTransactionReturnModel,
  QueryBlockArgModel,
  QueryBlockReturnModel,
  NewBlockArgModel,
  NewBlockReturn,
  GetPeerInfoArgModel,
  GetPeerInfoReturnModel,
  IndexTransactionReturnModel,
  DownloadTransactionArgModel,
  DownloadTransactionReturnModel,
  OpenBlobArgModel,
  OpenBlobReturnModel,
  CloseBlobArgModel,
  CloseBlobReturnModel,
  ReadBlobArgModel,
  ReadBlobReturnModel,
  QueryTindexArgModel,
  QueryTindexReturnModel,
  GetTransactionInBlockArgModel,
  GetTransactionInBlockReturnModel,
} from "@bfchain/core-model";
import {
  BaseHelper,
  TransactionHelper,
  BlockHelper,
  ChainTimeHelper,
  AccountBaseHelper,
} from "@bfchain/core-helper";
import { PromiseTimeout } from "./PromiseTimeout";

const { ArgumentIllegalException, ArgumentFormatException, TimeOutException } =
  CoreExceptionGenerator("channel", "chainChannelHelper");

@Injectable()
export class ChainChannelHelper {
  constructor(
    private baseHelper: BaseHelper,
    private transctionHelper: TransactionHelper,
    private blockHelper: BlockHelper,
    private timeHelper: ChainTimeHelper,
    private accountBaseHelper: AccountBaseHelper,
  ) {}

  // FIXME: 这里没确定 base58 编码的最大长度，临时使用 40
  private static MAX_ADDRESS_LENGTH = 40;
  private static MAX_SIGNATURE_LENGTH = 128;

  /**
   * 生成并校验交易查询的传入参数
   */
  @bindThis
  async boxQueryTransactionArg(
    params: ArrayBuffer | Uint8Array,
  ): Promise<QueryTransactionArgModel> {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: QueryTransactionArgModel;
    try {
      arg = QueryTransactionArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    const {
      type,
      types,
      signature,
      senderId,
      recipientId,
      dappid,
      lns,
      storage,
      blockSignature,
      minHeight,
      maxHeight,
      trusteeId,
      purchaseDAppid,
      range,
      offset,
      limit,
      address,
    } = arg.query;
    let has_query_params = false;
    if (type) {
      has_query_params = true;
      if (!BH.isValidTransactionType(type)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `type ${type}`,
        });
      }
    }
    if (types) {
      has_query_params = true;
      for (const type of types) {
        if (!BH.isValidTransactionType(type)) {
          throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
            field: `types.type ${type}`,
          });
        }
      }
    }
    if (signature) {
      has_query_params = true;
      // 只验证签名长度
      if (signature.length !== ChainChannelHelper.MAX_SIGNATURE_LENGTH) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `signature ${signature}`,
        });
      }
    }
    if (senderId) {
      has_query_params = true;
      // 不再验证字符串是否isAddress，只验证字符串的长度符合地址的最大长度即可
      if (senderId.length > ChainChannelHelper.MAX_ADDRESS_LENGTH) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `senderId ${senderId}`,
        });
      }
    }
    if (recipientId) {
      has_query_params = true;
      if (recipientId.length > ChainChannelHelper.MAX_ADDRESS_LENGTH) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `recipientId ${recipientId}`,
        });
      }
    }
    if (address) {
      has_query_params = true;
      // 不再验证字符串是否isAddress，只验证字符串的长度符合地址的最大长度即可
      if (address.length > ChainChannelHelper.MAX_ADDRESS_LENGTH) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `address ${address}`,
        });
      }
    }
    if (dappid) {
      has_query_params = true;
      if (!BH.isValidDAppId(dappid)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `dappid ${dappid}`,
        });
      }
    }
    if (lns) {
      has_query_params = true;
      if (!BH.isValidLocationName(lns)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `lns ${lns}`,
        });
      }
    }
    if (storage) {
      has_query_params = true;
      if (!(storage.key && storage.key.length)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `storage.key ${storage.key}`,
        });
      }
      if (!(storage.value && storage.value.length)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `storage.value ${storage.value}`,
        });
      }
    }
    if (blockSignature) {
      has_query_params = true;
      // 只验证签名长度
      if (blockSignature.length !== ChainChannelHelper.MAX_SIGNATURE_LENGTH) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `blockSignature ${blockSignature}`,
        });
      }
    }
    if (minHeight !== undefined) {
      has_query_params = true;
      if (!BH.isUint32(minHeight)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `minHeight ${minHeight}`,
        });
      }
    }
    if (maxHeight !== undefined) {
      has_query_params = true;
      if (!BH.isUint32(maxHeight)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `maxHeight ${maxHeight}`,
        });
      }
    }
    if (trusteeId) {
      has_query_params = true;
      if (trusteeId.length > ChainChannelHelper.MAX_ADDRESS_LENGTH) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `trusteeId ${trusteeId}`,
        });
      }
    }
    if (purchaseDAppid) {
      has_query_params = true;
      if (!BH.isValidDAppId(purchaseDAppid)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `purchaseDAppid ${purchaseDAppid}`,
        });
      }
    }
    if (range) {
      has_query_params = true;
      if (!BH.isString(range)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `range ${range}`,
        });
      }
    }

    if (has_query_params === false) {
      throw new ArgumentIllegalException(
        "Invalid QueryTransaction query params, no query conditions",
      );
    }
    if (!BH.isUint32(offset)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `offset ${offset}`,
      });
    }
    if (limit) {
      if (!BH.isUint32(limit)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `limit ${limit}`,
        });
      }
    }
    //#endregion
    //#region 排序参数校验
    const { tIndex } = arg.sort;
    if (tIndex !== undefined) {
      if (tIndex !== -1 && tIndex !== 1) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `tIndex ${tIndex}`,
        });
      }
    }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxQueryTransactionReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: QueryTransactionReturnModel;
    try {
      arg = QueryTransactionReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      const { transactions } = arg;
      // forEach 如果出错会有未捕获的异常
      for (const trsInBlock of transactions) {
        await this.transctionHelper.verifyTransactionSignature(trsInBlock.transaction, {
          taskLabel: "QueryTransactionReturn",
        });
      }
    }
    //#endregion
    return arg;
  }
  @cacheGetter
  get boxIndexTransactionArg() {
    return this.boxQueryTransactionArg;
  }
  @bindThis
  async boxIndexTransactionReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: IndexTransactionReturnModel;
    try {
      arg = IndexTransactionReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    /// 参数校验
    return arg;
  }

  async boxDownloadTransactionArg(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: DownloadTransactionArgModel;
    try {
      arg = DownloadTransactionArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    const { tIndexes } = arg;
    if (tIndexes.length === 0) {
      throw new ArgumentIllegalException(
        "Invalid Download transaction query params, no query conditions",
      );
    }
    const BH = this.baseHelper;
    for (const item of tIndexes) {
      const { height, tIndex, length } = item;
      if (!BH.isPositiveInteger(height)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `height ${height}`,
        });
      }
      if (!BH.isNaturalNumber(tIndex)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `tIndex ${tIndex}`,
        });
      }
      if (!BH.isPositiveInteger(length)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: `length ${length}`,
        });
      }
    }
    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxDownloadTransactionReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: DownloadTransactionReturnModel;
    try {
      arg = DownloadTransactionReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      const { transactions } = arg;
      // forEach 如果出错会有未捕获的异常
      for (const trsInBlock of transactions) {
        await this.transctionHelper.verifyTransactionSignature(trsInBlock.transaction, {
          taskLabel: "DownloadTransactionReturn",
        });
      }
    }
    //#endregion
    return arg;
  }

  /**
   * 生成并校验交易广播的传入参数
   */
  @bindThis
  async boxNewTransactionArg(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: NewTransactionArgModel;
    try {
      arg = NewTransactionArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    const { transaction } = arg;
    await this.transctionHelper.verifyTransactionSignature(transaction, {
      taskLabel: "NewTransactionArg",
    });
    //#endregion
    return arg;
  }
  /**
   * 生成并校验交易广播的返回结果
   */
  @bindThis
  boxNewTransactionReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: NewTransactionReturnModel;
    try {
      arg = NewTransactionReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      if (Number.isNaN(parseFloat(arg.minFee)) || BigInt(arg.minFee) < BigInt(0)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: "minFee",
        });
      }
    }
    //#endregion
    return arg;
  }
  @bindThis
  async boxOpenBlobArg(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: OpenBlobArgModel;
    try {
      arg = OpenBlobArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    const { hash: sha256 } = arg;
    if (sha256 === undefined || sha256.length !== 32) {
      throw new ArgumentIllegalException("Invalid Open Blob query params, wrong sha256 value");
    }

    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxOpenBlobReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: OpenBlobReturnModel;
    try {
      arg = OpenBlobReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    //#endregion
    return arg;
  }

  @bindThis
  async boxCloseBlobArg(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: CloseBlobArgModel;
    try {
      arg = CloseBlobArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }

    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxCloseBlobReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: CloseBlobReturnModel;
    try {
      arg = CloseBlobReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    //#endregion
    return arg;
  }

  @bindThis
  async boxReadBlobArg(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: ReadBlobArgModel;
    try {
      arg = ReadBlobArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    const { start, end } = arg;
    if (start < 0 || start >= end) {
      throw new ArgumentIllegalException("Invalid Read Blob range");
    }
    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxReadBlobReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: ReadBlobReturnModel;
    try {
      arg = ReadBlobReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    //#endregion
    return arg;
  }

  /**
   * 生成并校验区块查询的传入参数
   */
  @bindThis
  boxQueryBlockArg(params: ArrayBuffer | Uint8Array): QueryBlockArgModel {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: QueryBlockArgModel;
    try {
      arg = QueryBlockArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    const { height, signature } = arg.query;
    /**是否有查询条件 */
    let has_query_params = false;
    // if (typeof height === "number") {
    if (height) {
      has_query_params = true;
      if (!BH.isUint32(height)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: "height",
        });
      }
    }
    if (signature) {
      has_query_params = true;
      if (!BH.isValidBlockSignature(signature)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          field: "signature",
        });
      }
    }
    if (has_query_params === false) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_QUERYBLOCKARG_QUERY_PARAMS);
    }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验区块查询的返回结果
   */
  @bindThis
  async boxQueryBlockReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let arg: QueryBlockReturnModel;
    try {
      arg = QueryBlockReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    // FIXME: @wmc
    /// 参数校验
    //#region 交易签名校验
    const { someBlock } = arg;
    if (arg.status === RESPONSE_STATUS.success && someBlock) {
      await this.blockHelper.verifyBlockSignature(someBlock.block, {
        taskLabel: "QueryBlockReturn",
      });
    }
    // #endregion
    return arg;
  }
  /**
   * 生成并校验区块查询的传入参数
   */
  @bindThis
  boxNewBlockArg(params: ArrayBuffer | Uint8Array): NewBlockArgModel {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    let newBlockArg: NewBlockArgModel;
    try {
      newBlockArg = NewBlockArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    if (!BH.isUint32(newBlockArg.height)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `height ${newBlockArg.height}`,
      });
    }
    if (!BH.isValidBlockSignature(newBlockArg.signature)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `signature ${newBlockArg.signature}`,
      });
    }
    if (!BH.isValidBlockSignature(newBlockArg.previousBlockSignature)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `previousBlockSignature ${newBlockArg.previousBlockSignature}`,
      });
    }
    if (!BH.isFiniteBigInt(newBlockArg.totalFee)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `totalFee ${newBlockArg.totalFee}`,
      });
    }
    if (!BH.isUint32(newBlockArg.numberOfTransactions)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `numberOfTransactions ${newBlockArg.numberOfTransactions}`,
      });
    }
    if (!BH.isUint32(newBlockArg.timestamp)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `timestamp ${newBlockArg.timestamp}`,
      });
    }
    if (!BH.isValidPublicKey(newBlockArg.generatorPublicKeyBuffer)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `generatorPublicKey ${newBlockArg.generatorPublicKey}`,
      });
    }
    if (!BH.isUint32(newBlockArg.version)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        field: `version ${newBlockArg.version}`,
      });
    }
    //#endregion
    return newBlockArg;
  }
  /**
   * 生成并校验区块查询的返回结果
   */
  @bindThis
  boxNewBlockReturn(params: ArrayBuffer | Uint8Array): NewBlockReturn {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    try {
      const arg = NewBlockReturn.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
      return arg;
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
  }
  /**
   * 生成并校验获取节点信息的传入参数
   */
  @bindThis
  boxGetPeerInfoArg(params: ArrayBuffer | Uint8Array): GetPeerInfoArgModel {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    try {
      const arg = GetPeerInfoArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
      return arg;
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
  }
  /**
   * 生成并校验获取节点信息的返回结果
   */
  @bindThis
  boxGetPeerInfoReturn(params: ArrayBuffer | Uint8Array): GetPeerInfoReturnModel {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        params,
      });
    }
    try {
      const arg = GetPeerInfoReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
      return arg;
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        error,
        params,
      });
    }
  }

  /**
   * 生成并校验交易查询的传入参数
   */
  @bindThis
  async boxQueryTindexArg(params: ArrayBuffer | Uint8Array): Promise<QueryTindexArgModel> {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxQueryTindexArg",
        params,
      });
    }
    let arg: QueryTindexArgModel;
    try {
      arg = QueryTindexArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxQueryTindexArg",
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    const {
      type,
      signature,
      senderId,
      recipientId,
      dappid,
      lns,
      storage,
      blockSignature,
      minHeight,
      maxHeight,
      trusteeId,
      purchaseDAppid,
      range,
      address,
      offset,
      limit,
    } = arg.query;
    let has_query_params = false;
    if (type) {
      has_query_params = true;
      if (!BH.isValidTransactionType(type)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg",
          field: `type ${type}`,
        });
      }
    }
    if (signature) {
      has_query_params = true;
      if (!BH.isValidTransactionSignature(signature)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `signature ${signature}`,
        });
      }
    }
    if (senderId) {
      has_query_params = true;
      if (!(await this.accountBaseHelper.isAddress(senderId))) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `senderId ${senderId}`,
        });
      }
    }
    if (recipientId) {
      has_query_params = true;
      if (!(await this.accountBaseHelper.isAddress(recipientId))) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `recipientId ${recipientId}`,
        });
      }
    }
    if (dappid) {
      has_query_params = true;
      if (!BH.isValidDAppId(dappid)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `dappid ${dappid}`,
        });
      }
    }
    if (lns) {
      has_query_params = true;
      if (!BH.isValidLocationName(lns)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `lns ${lns}`,
        });
      }
    }
    if (storage) {
      has_query_params = true;
      if (!(storage.key && storage.key.length)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `storage.key ${storage.key}`,
        });
      }
      if (!(storage.value && storage.value.length)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `storage.value ${storage.value}`,
        });
      }
    }
    if (blockSignature) {
      has_query_params = true;
      if (!BH.isValidBlockSignature(blockSignature)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `blockSignature ${blockSignature}`,
        });
      }
    }
    if (minHeight !== undefined) {
      has_query_params = true;
      if (!BH.isUint32(minHeight)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `minHeight ${minHeight}`,
        });
      }
    }
    if (maxHeight !== undefined) {
      has_query_params = true;
      if (!BH.isUint32(maxHeight)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `maxHeight ${maxHeight}`,
        });
      }
    }
    if (trusteeId) {
      has_query_params = true;
      if (!(await this.accountBaseHelper.isAddress(trusteeId))) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `trusteeId ${trusteeId}`,
        });
      }
    }
    if (purchaseDAppid) {
      has_query_params = true;
      if (!BH.isValidDAppId(purchaseDAppid)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `purchaseDAppid ${purchaseDAppid}`,
        });
      }
    }
    if (range) {
      has_query_params = true;
      if (!BH.isString(range)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `range ${range}`,
        });
      }
    }
    if (address) {
      has_query_params = true;
      if (!(await this.accountBaseHelper.isAddress(address))) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `address ${address}`,
        });
      }
    }

    if (has_query_params === false) {
      throw new ArgumentIllegalException(
        "Invalid QueryTransaction query params, no query conditions",
      );
    }
    if (!BH.isUint32(offset)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        function: "boxQueryTindexArg.query",
        field: `offset ${offset}`,
      });
    }
    if (limit) {
      // if (typeof limit === "number") {
      if (!BH.isUint32(limit)) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.query",
          field: `limit ${limit}`,
        });
      }
    }
    //#endregion
    //#region 排序参数校验
    const { tIndex } = arg.sort;
    if (tIndex !== undefined) {
      // if (typeof timestamp === "number") {
      if (tIndex !== -1 && tIndex !== 1) {
        throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
          function: "boxQueryTindexArg.sort",
          field: `tIndex ${tIndex}`,
        });
      }
    }
    // const { index } = arg.sort;
    // if (index) {
    //   // if (typeof timestamp === "number") {
    //   if (index !== -1 && index !== 1) {
    //     throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
    //       function: "boxQueryTindexArg.sort",
    //       field: "timestamp",
    //     });
    //   }
    // }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxQueryTindexReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxQueryTindexesReturn",
        params,
      });
    }
    let arg: QueryTindexReturnModel;
    try {
      arg = QueryTindexReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxQueryTindexesReturn",
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      const tIndexes = arg.tIndexes;
      const BH = this.baseHelper;
      for (const tIndex of tIndexes) {
        if (!BH.isNaturalNumber(tIndex)) {
          throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
            function: "boxQueryTindexesReturn",
            field: `tIndexes ${tIndex}`,
          });
        }
      }
    }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验交易查询的传入参数
   */
  @bindThis
  async boxGetTransactionInBlockArg(
    params: ArrayBuffer | Uint8Array,
  ): Promise<GetTransactionInBlockArgModel> {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxGetTransactionInBlockArg",
        params,
      });
    }
    let arg: GetTransactionInBlockArgModel;
    try {
      arg = GetTransactionInBlockArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxGetTransactionInBlockArg",
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    if (!BH.isValidTindexRanges(arg.query.tIndexRanges)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS_FIELD, {
        function: "boxGetTransactionInBlockArg.query.tIndexRanges",
        field: `tIndexRanges ${arg.query.tIndexRanges}`,
      });
    }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验交易查询的返回结果
   */
  @bindThis
  async boxGetTransactionInBlockReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxGetTransactionInBlockReturn",
        params,
      });
    }
    let arg: GetTransactionInBlockReturnModel;
    try {
      arg = GetTransactionInBlockReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_PARAMS, {
        function: "boxGetTransactionInBlockReturn",
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      const { transactionInBlocks } = arg;
      transactionInBlocks.forEach(async (item) => {
        await this.transctionHelper.verifyTransactionSignature(item.transaction, {
          taskLabel: "GetTransactionInBlockReturn",
        });
      });
    }
    //#endregion
    return arg;
  }

  @bindThis
  parserAborterOptions<R, ENV = unknown>(options: BFChainCore.AborterOptions<ENV>, env: ENV) {
    if (options.disabledAborterOptions) {
      return;
    }
    let po: PromiseTimeout<R> | undefined; // = new PromiseTimeout<R>();
    if (options.aborter) {
      po || (po = new PromiseTimeout<R>());
      this._bindRejectedToPromiseOut(options.aborter.abortedPromise, po);
    }

    //#region 处理超时问题

    let sleepTime: number | undefined;
    /// 超时
    if (options.timeout !== undefined) {
      sleepTime = typeof options.timeout === "function" ? options.timeout(env) : options.timeout;
    }
    /// 截止
    if (options.deadlineTime !== undefined) {
      const now = this.timeHelper.now();
      const diffTime = options.deadlineTime - now;
      if (sleepTime) {
        if (diffTime < sleepTime) {
          sleepTime = diffTime;
        }
      } else {
        sleepTime = diffTime;
      }
    }
    /// 进行setTimeout等待
    if (sleepTime !== undefined) {
      const { reject } = po || (po = new PromiseTimeout<R>());
      po.setTimeout(sleepTime, () =>
        reject(
          typeof options.timeoutException === "function"
            ? options.timeoutException(env)
            : options.timeoutException || new TimeOutException(),
        ),
      );
    }
    //#endregion

    if (options.rejected) {
      po || (po = new PromiseTimeout<R>());
      this._bindRejectedToPromiseOut(options.rejected, po);
    }

    return po;
  }
  private _bindRejectedToPromiseOut(promise: PromiseLike<unknown>, po: PromiseOut<any>) {
    safePromiseThen(promise, undefined, po.reject);
    po.onFinished(() => safePromiseOffThen(promise, undefined, po.reject));
  }

  wrapAborterOptions<R, ENV = unknown>(resp: Promise<R>, options: undefined, env?: ENV): Promise<R>;
  wrapAborterOptions<R, ENV extends undefined>(
    resp: Promise<R>,
    options: BFChainCore.AborterOptions<ENV>,
    env?: ENV,
  ): Promise<R>;
  wrapAborterOptions<R, ENV = unknown>(
    resp: Promise<R>,
    options: BFChainCore.AborterOptions<ENV> | undefined,
    env: ENV,
  ): Promise<R>;
  wrapAborterOptions<R, ENV = unknown>(
    resp: Promise<R>,
    options: BFChainCore.AborterOptions<ENV>,
    env: ENV,
  ): Promise<R>;
  @bindThis
  wrapAborterOptions<R, ENV = unknown>(
    resp: Promise<R>,
    options?: BFChainCore.AborterOptions<ENV>,
    env?: ENV,
  ) {
    const po = options && this.parserAborterOptions<R, ENV>(options, env as ENV);
    if (po) {
      resp.then(po.resolve, po.reject);
      resp = po.promise;
    }
    return resp;
  }

  wrapOutAborterOptions<R, ENV = unknown>(
    respo: PromiseOut<R>,
    options: undefined,
    env?: ENV,
  ): PromiseOut<R>;
  wrapOutAborterOptions<R, ENV extends undefined>(
    respo: PromiseOut<R>,
    options: BFChainCore.AborterOptions<ENV>,
    env?: ENV,
  ): PromiseOut<R>;
  wrapOutAborterOptions<R, ENV = unknown>(
    respo: PromiseOut<R>,
    options: BFChainCore.AborterOptions<ENV> | undefined,
    env: ENV,
  ): PromiseOut<R>;
  wrapOutAborterOptions<R, ENV = unknown>(
    respo: PromiseOut<R>,
    options: BFChainCore.AborterOptions<ENV>,
    env: ENV,
  ): PromiseOut<R>;
  @bindThis
  wrapOutAborterOptions<R, ENV = unknown>(
    respo: PromiseOut<R>,
    options?: BFChainCore.AborterOptions<ENV>,
    env?: ENV,
  ) {
    const po = options && this.parserAborterOptions<R, ENV>(options, env as ENV);
    if (po) {
      /// 双向绑定
      safePromiseThen(respo.promise, po.resolve, po.reject);
      safePromiseThen(po.promise, respo.resolve, respo.reject);
      respo = po;
    }
    return respo;
  }

  /**通用的，计算一般timeout的函数 */
  @bindThis
  getChainChannelTimeout(chainChannel: BFChainCore.SimpleChainChannel, baseTime = 3e4) {
    return (
      Math.max(Number.isFinite(chainChannel.delay) ? chainChannel.delay : 1000, 2000) + baseTime
    );
  }
}
