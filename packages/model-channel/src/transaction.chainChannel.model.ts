import { Message, Type, Field } from "@bfchain/protobuf";
import { CommonResponse, ErrorMessage } from "./common.chainChannel.model";
import {
  TransactionBaseStorageModel,
  TransactionInBlock,
  SomeTransactionModel,
} from "@bfchain/core-model-transaction";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { NewTransactionRefuseReason, NewTransactionStatus } from "./constants";

/**
 * 查询交易的查询条件
 */
@Type.d("TransactionQueryOptions")
export class TransactionQueryOptions
  extends Message<TransactionQueryOptions>
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionQueryOptionsJSON>
{
  static INC = 1;
  /**交易类型 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  type?: string;
  /**交易类型组 */
  @Field.d(TransactionQueryOptions.INC++, "string", "repeated")
  types?: string[];
  /**交易唯一编号 */
  @Field.d(TransactionQueryOptions.INC++, "bytes", "optional")
  signatureBuffer?: Uint8Array;
  get signature() {
    return (this.signatureBuffer && getHexFromArrayBuffer(this.signatureBuffer)) || undefined;
  }
  set signature(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }
  /**交易发送者地址 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  senderId?: string;
  /**交易接收者地址 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  recipientId?: string;
  /**交易来源的 dappid */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  dappid?: string;
  /**交易来源的 lns */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  lns?: string;
  /**自定义索引 */
  @Field.d(TransactionQueryOptions.INC++, TransactionBaseStorageModel, "optional")
  storage?: TransactionBaseStorageModel;
  /**查询的区块的ID */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  blockSignature?: string;
  /**查询的区块的最小高度 */
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  minHeight?: number;
  /**查询的区块的最大高度 */
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  maxHeight?: number;
  /**交易发起账户的第 i 笔交易 */
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  numberOfSenderTransactions?: number;
  /**交易见证者地址 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  trusteeId?: string;
  /**购买的 dappid */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  purchaseDAppid?: string;
  /**查询结果分页：起始下标 */
  @Field.d(TransactionQueryOptions.INC++, "uint32")
  offset!: number;
  /**查询结果分页：返回数量*/
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  limit?: number;
  /**在range中的元素 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  range?: string;
  /**账户地址 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  address?: string;
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<TransactionQueryOptions>,
  ) {
    const res = super.fromObject(object) as TransactionQueryOptions;
    if (res !== object) {
      object.signature && (res.signature = object.signature);
    }
    return res as unknown as T;
  }
  toJSON() {
    const res: BFChainCore.TransactionQueryOptionsJSON = {
      type: this.type,
      types: this.types,
      signature: this.signature,
      senderId: this.senderId,
      recipientId: this.recipientId,
      dappid: this.dappid,
      lns: this.lns,
      storage: this.storage,
      blockSignature: this.blockSignature,
      minHeight: this.minHeight,
      maxHeight: this.maxHeight,
      numberOfSenderTransactions: this.numberOfSenderTransactions,
      trusteeId: this.trusteeId,
      purchaseDAppid: this.purchaseDAppid,
      range: this.range,
      offset: this.offset,
      limit: this.limit,
      address: this.address,
    };

    return res;
  }
}

/**
 * 查询交易的排序条件
 */
@Type.d("TransactionSortOptions")
export class TransactionSortOptions
  extends Message<TransactionSortOptions>
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionSortOptionsJSON>
{
  static INC = 1;
  /**根据链上事件索引排序 */
  @Field.d(TransactionSortOptions.INC++, "int32", "required", 1)
  tIndex!: -1 | 1;
  toJSON() {
    return {
      tIndex: this.tIndex,
    };
  }
  // /**根据交易的下标索引排序 */
  // @Field.d(TransactionSortOptions.INC++, "int32", "optional")
  // index?: -1 | 1;
  // /**根据区块高度排序 */
  // @Field.d(TransactionSortOptions.INC++, "int32", "optional")
  // height?: -1 | 1;
  // toJSON() {
  //   return {
  //     index: this.index,
  //     height: this.height,
  //   };
  // }
}

/**
 * 查询交易的传入参数
 */
@Type.d("QueryTransactionArg")
export class QueryTransactionArgModel
  extends Message<QueryTransactionArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionArgJSON>
{
  /**查询参数 */
  @Field.d(1, TransactionQueryOptions)
  query!: TransactionQueryOptions;
  /**排序参数 */
  @Field.d(2, TransactionSortOptions)
  sort!: TransactionSortOptions;
  toJSON() {
    return {
      query: this.query.toJSON(),
      sort: this.sort.toJSON(),
    };
  }
}

/**
 * 查询交易的返回值
 * 可能的错误：查询参数有误
 */
@Type.d("QueryTransactionReturn")
export class QueryTransactionReturnModel<
    T extends BFChainCore.Transaction = BFChainCore.Transaction,
  >
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionReturnJSON>
{
  /**查询到的交易 */
  @Field.d(QueryTransactionReturnModel.INC++, TransactionInBlock, "repeated")
  transactions!: TransactionInBlock<T>[];
  toJSON() {
    return Object.assign(
      {
        transactions: this.transactions.map((tib) => tib.toJSON()),
      },
      super.toJSON(),
    );
  }
}

/**
 * 广播交易的传入参数
 */
@Type.d("NewTransactionArg")
export class NewTransactionArgModel
  extends SomeTransactionModel
  implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionArgJSON>
{
  /**红包的密码 */
  @Field.d(NewTransactionArgModel.INC++, "string", "optional")
  grabSecret?: string;
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<NewTransactionArgModel>,
  ) {
    return super.fromObject(object) as unknown as T;
  }
}

/**
 * 广播交易的返回值
 * 可能的错误：交易验证不通过，或者手续费不足，或者已经超出可处理的时间段
 */
@Type.d("NewTransactionReturn")
export class NewTransactionReturnModel
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionReturnJSON>
{
  /**交易的接收状态 */
  @Field.d(
    NewTransactionReturnModel.INC++,
    NewTransactionStatus,
    "required",
    NewTransactionStatus.Refuse,
  )
  newTrsStatus!: NewTransactionStatus;
  /**最低手续费 */
  @Field.d(NewTransactionReturnModel.INC++, "string", "required", "0")
  minFee!: string;
  /**最低手续费 */
  @Field.d(NewTransactionReturnModel.INC++, NewTransactionRefuseReason, "optional")
  refuseReason?: NewTransactionRefuseReason;
  /**错误码 */
  @Field.d(NewTransactionReturnModel.INC++, "string", "optional")
  errorCode?: string;
  toJSON() {
    const res: BFChainCore.NewTransactionReturnJSON = Object.assign(
      {
        newTrsStatus: this.newTrsStatus,
        minFee: this.minFee,
      },
      super.toJSON(),
    );
    this.refuseReason ?? (res.refuseReason = this.refuseReason);
    this.errorCode ?? (res.errorCode = this.errorCode);
    return res;
  }
}

@Type.d("TransactionIndexModel")
export class TransactionIndexModel
  extends Message<TransactionIndexModel>
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionIndexJSON>
{
  @Field.d(1, "uint32")
  height!: number;
  @Field.d(2, "uint32")
  index!: number;
  @Field.d(3, "uint32", "required", 1)
  length!: number;
  toJSON() {
    return {
      height: this.height,
      index: this.index,
      length: this.length,
    };
  }
}

/**
 * 查询交易索引的传入参数
 */
@Type.d("IndexTransactionArg")
export class IndexTransactionArgModel
  extends Message<IndexTransactionArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.IndexTransactionArgJSON>
{
  /**查询参数 */
  @Field.d(1, TransactionQueryOptions)
  query!: TransactionQueryOptions;
  /**排序参数 */
  @Field.d(2, TransactionSortOptions)
  sort!: TransactionSortOptions;
  toJSON() {
    return {
      query: this.query.toJSON(),
      sort: this.sort.toJSON(),
    };
  }
}
/**
 * 查询交易索引的返回值
 * 可能的错误：查询参数有误
 */
@Type.d("IndexTransactionReturn")
export class IndexTransactionReturnModel
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.IndexTransactionReturnJSON>
{
  /**查询到的交易 */
  @Field.d(IndexTransactionReturnModel.INC++, TransactionIndexModel, "repeated")
  tIndexes!: TransactionIndexModel[];
  toJSON() {
    return Object.assign(
      {
        tIndexes: this.tIndexes.map((ti) => ti.toJSON()),
      },
      super.toJSON(),
    );
  }
}

/**
 * 下载交易的传入参数
 */
@Type.d("DownloadTransactionArg")
export class DownloadTransactionArgModel
  extends Message<DownloadTransactionArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.DownloadTransactionArgJSON>
{
  /**查询参数 */
  @Field.d(1, TransactionIndexModel, "repeated")
  tIndexes!: TransactionIndexModel[];
  toJSON() {
    return {
      tIndexes: this.tIndexes.map((ti) => ti.toJSON()),
    };
  }
}

/**
 * 下载交易的返回值
 */
@Type.d("DownloadTransactionReturn")
export class DownloadTransactionReturnModel<
    T extends BFChainCore.Transaction = BFChainCore.Transaction,
  >
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.DownloadTransactionReturnJSON>
{
  /**查询到的交易 */
  @Field.d(DownloadTransactionReturnModel.INC++, TransactionInBlock, "repeated")
  transactions!: TransactionInBlock<T>[];
  toJSON() {
    return Object.assign(
      {
        transactions: this.transactions.map((tib) => tib.toJSON()),
      },
      super.toJSON(),
    );
  }
}
