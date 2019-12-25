import { Injectable, Exception, bindThis } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  INVALID_PARAMS,
  INVALID_PARAMS_FIELD,
} from "@bfchain/core-util-exception";
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
} from "@bfchain/core-model";
import {
  BaseHelper,
  AccountBaseHelper,
  TransactionHelper,
  BlockHelper,
} from "@bfchain/core-helper";

const { ArgumentIllegalException, ArgumentFormatException } = CoreExceptionGenerator(
  "helper",
  "ChainChannelHelper",
);

@Injectable()
export class ChainChannelHelper {
  constructor(
    private baseHelper: BaseHelper,
    private accountHelper: AccountBaseHelper,
    private transctionHelper: TransactionHelper,
    private blockHelper: BlockHelper,
  ) {}
  /**
   * 生成并校验交易查询的传入参数
   */
  @bindThis
  boxQueryTransactionArg(params: ArrayBuffer | Uint8Array): QueryTransactionArgModel {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(INVALID_PARAMS, {
        function: "boxQueryTransactionArg",
        params,
      });
    }
    let arg: QueryTransactionArgModel;
    try {
      arg = QueryTransactionArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxQueryTransactionArg",
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    const {
      type,
      signatureBuffer,
      senderId,
      recipientId,
      blockId,
      minHeight,
      maxHeight,
      storage,
      offset,
      limit,
    } = arg.query;
    let has_query_params = false;
    if (type) {
      //if (typeof type === "string") {
      has_query_params = true;
      if (!BH.isValidTransactionType(type)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg",
          field: "type",
        });
      }
    }
    if (signatureBuffer) {
      //if (typeof signature === "string") {
      has_query_params = true;
      if (!BH.isValidSignature(signatureBuffer)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "signatureBuffer",
        });
      }
    }
    if (senderId) {
      //if (typeof senderId === "string") {
      has_query_params = true;
      if (!this.accountHelper.isAddress(senderId)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "senderId",
        });
      }
    }
    if (recipientId) {
      //if (typeof recipientId === "string") {
      has_query_params = true;
      if (!this.accountHelper.isAddress(recipientId)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "recipientId",
        });
      }
    }
    if (minHeight) {
      //if (typeof minHeight === "number") {
      has_query_params = true;
      if (!BH.isUint32(minHeight)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "minHeight",
        });
      }
    }
    if (maxHeight) {
      //if (typeof maxHeight === "number") {
      has_query_params = true;
      if (!BH.isUint32(maxHeight)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "maxHeight",
        });
      }
    }
    if (blockId) {
      //if (typeof maxHeight === "number") {
      has_query_params = true;
      if (!BH.isValidBlockId(blockId)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "blockId",
        });
      }
    }
    if (storage) {
      has_query_params = true;
      if (!(storage.key && storage.key.length)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "storage",
        });
      }
    }
    if (has_query_params === false) {
      throw new ArgumentIllegalException(
        "Invalid QueryTransaction query params, no query conditions",
      );
    }
    if (!BH.isUint32(offset)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxQueryTransactionArg.query",
        field: "offset",
      });
    }
    if (limit) {
      //if (typeof limit === "number") {
      if (!BH.isUint32(limit)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.query",
          field: "limit",
        });
      }
    }
    //#endregion
    //#region 排序参数校验
    const { index: timestamp } = arg.sort;
    if (timestamp) {
      //if (typeof timestamp === "number") {
      if (!BH.isUint32(timestamp)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryTransactionArg.sort",
          field: "timestamp",
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
  boxQueryTransactionReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(INVALID_PARAMS, {
        function: "boxQueryTransactionReturn",
        params,
      });
    }
    let arg: QueryTransactionReturnModel;
    try {
      arg = QueryTransactionReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxQueryTransactionReturn",
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      const { transactions } = arg;
      transactions.forEach(item => {
        this.transctionHelper.verifyTransactionSignature(item.transaction, {
          taskLabel: "QueryTransactionReturn",
        });
      });
    }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验交易广播的传入参数
   */
  @bindThis
  boxNewTransactionArg(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(INVALID_PARAMS, {
        function: "boxNewTransactionArg",
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
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxNewTransactionArg",
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    const { transaction } = arg;
    this.transctionHelper.verifyTransactionSignature(transaction, {
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
      throw new ArgumentIllegalException(INVALID_PARAMS, {
        function: "boxNewTransactionReturn",
        params,
      });
    }
    let arg: NewTransactionReturnModel;
    try {
      arg = NewTransactionReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxNewTransactionReturn",
        error,
        params,
      });
    }
    /// 参数校验
    //#region 交易签名校验
    if (arg.status === RESPONSE_STATUS.success) {
      if (Number.isNaN(parseFloat(arg.minFee)) || BigInt(arg.minFee) < BigInt(0)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxNewTransactionReturn",
          field: "minFee",
        });
      }
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
      throw new ArgumentIllegalException(INVALID_PARAMS, { function: "boxQueryBlockArg", params });
    }
    let arg: QueryBlockArgModel;
    try {
      arg = QueryBlockArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxQueryBlockArg",
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    const { height, id } = arg.query;
    /**是否有查询条件 */
    let has_query_params = false;
    // if (typeof height === "number") {
    if (height) {
      has_query_params = true;
      if (!BH.isUint32(height)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryBlockArg",
          field: "height",
        });
      }
    }
    // if (typeof id === "string") {
    if (id) {
      has_query_params = true;
      if (!BH.isValidBlockId(id)) {
        throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
          function: "boxQueryBlockArg",
          field: "id",
        });
      }
    }
    if (has_query_params === false) {
      throw new ArgumentIllegalException("Invalid QueryBlockArg query params, no query conditions");
    }
    //#endregion
    return arg;
  }
  /**
   * 生成并校验区块查询的返回结果
   */
  @bindThis
  boxQueryBlockReturn(params: ArrayBuffer | Uint8Array) {
    if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
      throw new ArgumentIllegalException(INVALID_PARAMS, {
        function: "boxQueryBlockReturn",

        params,
      });
    }
    let arg: QueryBlockReturnModel;
    try {
      arg = QueryBlockReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxQueryBlockReturn",
        error,
        params,
      });
    }
    // FIXME: @wmc
    /// 参数校验
    //#region 交易签名校验
    const { someBlock } = arg;
    if (arg.status === RESPONSE_STATUS.success && someBlock) {
      this.blockHelper.verifyBlockSignature(someBlock.block, {
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
      throw new ArgumentIllegalException(INVALID_PARAMS, { function: "boxNewBlockArg", params });
    }
    let newBlockArg: NewBlockArgModel;
    try {
      newBlockArg = NewBlockArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxNewBlockArg",
        error,
        params,
      });
    }
    const BH = this.baseHelper;
    /// 参数校验
    //#region 查询参数校验
    if (!BH.isUint32(newBlockArg.height)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "height",
      });
    }
    if (!BH.isValidBlockId(newBlockArg.blockId)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "blockId",
      });
    }
    if (!BH.isValidBlockId(newBlockArg.previousBlockId)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "previousBlockId",
      });
    }
    if (!BH.isFiniteBigInt(newBlockArg.totalFee)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "totalFee",
      });
    }
    if (!BH.isUint32(newBlockArg.numberOfTransactions)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "numberOfTransactions",
      });
    }
    if (!BH.isUint32(newBlockArg.timestamp)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "timestamp",
      });
    }
    if (!BH.isValidPublicKey(newBlockArg.generatorPublicKeyBuffer)) {
      throw new ArgumentIllegalException(INVALID_PARAMS_FIELD, {
        function: "boxNewBlockArg",
        field: "generatorPublicKey",
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
      throw new ArgumentIllegalException(INVALID_PARAMS, { function: "boxNewBlockReturn", params });
    }
    try {
      const arg = NewBlockReturn.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
      return arg;
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxNewBlockReturn",
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
      throw new ArgumentIllegalException(INVALID_PARAMS, { function: "boxGetPeerInfoArg", params });
    }
    try {
      const arg = GetPeerInfoArgModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
      return arg;
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxGetPeerInfoArg",
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
      throw new ArgumentIllegalException(INVALID_PARAMS, {
        function: "boxGetPeerInfoReturn",
        params,
      });
    }
    try {
      const arg = GetPeerInfoReturnModel.decode(
        params instanceof Uint8Array ? params : new Uint8Array(params),
      );
      return arg;
    } catch (error) {
      throw new ArgumentFormatException(INVALID_PARAMS, {
        function: "boxGetPeerInfoReturn",
        error,
        params,
      });
    }
  }
}
