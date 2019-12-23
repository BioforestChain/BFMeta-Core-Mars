import { Message, Type, Field } from "@bfchain/protobuf";
import { CommonResponse, ErrorMessage } from "./common.chainChannel.model";
import {
  TransactionBaseStorageModel,
  TransactionInBlock,
  SomeTransactionModel,
} from "@bfchain/core-model-transaction";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";

/**
 * 查询交易的查询条件
 */
@Type.d("TransactionQueryOptions")
export class TransactionQueryOptions extends Message<TransactionQueryOptions>
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionQueryOptionsJSON> {
  static INC = 1;
  /**交易类型 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  type?: string;
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
  /**查询的区块的最小高度 */
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  minHeight?: number;
  /**查询的区块的ID */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  blockId?: string;
  /**查询的区块的最大高度 */
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  maxHeight?: number;
  /**自定义索引 */
  @Field.d(TransactionQueryOptions.INC++, TransactionBaseStorageModel, "optional")
  storage?: TransactionBaseStorageModel;
  /**交易见证者地址 */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  trusteeId?: string;
  /**购买的 dappid */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  purchaseDAppid?: string;
  /**交易来源的 dappid */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  dappid?: string;
  /**交易来源的 lns */
  @Field.d(TransactionQueryOptions.INC++, "string", "optional")
  lns?: string;
  /**查询结果分页：起始下标 */
  @Field.d(TransactionQueryOptions.INC++, "uint32")
  offset!: number;
  /**查询结果分页：返回数量， */
  @Field.d(TransactionQueryOptions.INC++, "uint32", "optional")
  limit?: number;
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<TransactionQueryOptions>,
  ) {
    const res = super.fromObject(object) as TransactionQueryOptions;
    if (res !== object) {
      object.signature && (res.signature = object.signature);
    }
    return (res as unknown) as T;
  }
  toJSON() {
    return {
      type: this.type,
      signature: this.signature,
      senderId: this.senderId,
      recipientId: this.recipientId,
      minHeight: this.minHeight,
      blockId: this.blockId,
      maxHeight: this.maxHeight,
      storage: this.storage,
      trusteeId: this.trusteeId,
      purchaseDAppid: this.purchaseDAppid,
      dappid: this.dappid,
      lns: this.lns,
      offset: this.offset,
      limit: this.limit,
    };
  }
}

/**
 * 查询交易的排序条件
 */
@Type.d("TransactionSortOptions")
export class TransactionSortOptions extends Message<TransactionSortOptions>
  implements BFChainCore.JSONToModelType<BFChainCore.TransactionSortOptionsJSON> {
  static INC = 1;
  /**根据交易的下标索引排序 */
  @Field.d(TransactionSortOptions.INC++, "int32", "optional")
  index?: -1 | 1;
  /**根据区块高度排序 */
  @Field.d(TransactionSortOptions.INC++, "int32", "optional")
  height?: -1 | 1;
  toJSON() {
    return {
      index: this.index,
      height: this.height,
    };
  }
}

/**
 * 查询交易的传入参数
 */
@Type.d("QueryTransactionArg")
export class QueryTransactionArgModel extends Message<QueryTransactionArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionArgJSON> {
  /**查询参数 */
  @Field.d(1, TransactionQueryOptions)
  query!: TransactionQueryOptions;
  /**排序参数 */
  @Field.d(2, TransactionSortOptions)
  sort!: TransactionSortOptions;
  toJSON() {
    return {
      query: this.query,
      sort: this.sort,
    };
  }
}

/**
 * 查询交易的返回值
 * 可能的错误：查询参数有误
 */
@Type.d("QueryTransactionReturn")
export class QueryTransactionReturnModel extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.QueryTransactionReturnJSON> {
  /**查询到的交易 */
  @Field.d(QueryTransactionReturnModel.INC++, TransactionInBlock, "repeated")
  transactions!: TransactionInBlock[];
  toJSON() {
    return Object.assign(super.toJSON(), {
      transactions: this.transactions.map(tib => tib.toJSON()),
    });
  }
}

/**
 * 广播交易的传入参数
 */
@Type.d("NewTransactionArg")
export class NewTransactionArgModel extends SomeTransactionModel
  implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionArgJSON> {
  /**红包的密码 */
  @Field.d(NewTransactionArgModel.INC++, "string", "optional")
  grabSecret?: string;
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<NewTransactionArgModel>,
  ) {
    return (super.fromObject(object) as unknown) as T;
  }
}

/**接收新区块后，区块的所处位置判断 */
export enum NewTransactionStatus {
  /**拒绝接收，可能是队列已经满 */
  Refuse = 0,
  /**已经在区块中 */
  InBlock = 1,
  /**已经在未处理交易中 */
  InUnconfirmQuene = 2,
}

/**接收到新交易时拒绝的理由 */
export enum NewTransactionRefuseReason {
  /**手续费低于网络手续费 */
  FEE_LESS_THAN_WEB_FEE,
  /**交易过期 */
  TRS_EXPRIED,
  /**交易已经在未处理交易进程 */
  TRANSACTION_IN_UNTREATEDTR,
  /**交易已经在交易表中 */
  TRANSACTION_IN_TRS,
  /**交易基础类型未找到 */
  TRANSACTION_BASE_TYPE_NOT_FOUND,
  /**交易类型未找到 */
  TRANSACTION_BASE_NOT_FOUND,
  /**链资产不足 */
  CHAIN_ASSET_NOT_ENOUGH,
  /**资产不足 */
  ASSET_NOT_ENOUGH,
  /**交易的发起账户资产冻结 */
  TRANSACTION_SENDER_ASSET_FROZEN,
  /**交易的接收账户资产冻结 */
  TRANSACTION_RECIPIENT_ASSET_FROZEN,
  /**交易的手续费不足 */
  TRANSACTION_FEE_NOT_ENOUGH,
  /**必须给 dapp 的开发者投票 */
  MUSET_VOTE_FOR_DAPP_POSSESSOR,
  /**交易资产负债 */
  TRANSACTION_ASSET_DEBT,
  /**链域名不存在 */
  LOCATION_NAME_NOT_EXIST,
  /**账户不是链域名的拥有者 */
  ACCOUNT_NOT_LNS_POSSESSOR,
  /**dapp 已经存在 */
  DAPP_ALREADY_EXISTS,
  /**账户已经是一个受托人 */
  ACCOUNT_ALREADY_DELEGATE,
  /**DApp拥有者不能发行资产 */
  DAPP_POSSESSOR_CAN_NOT_ISSUE_ASSET,
  /**DApp拥有者不能发行子链 */
  DAPP_POSSESSOR_CAN_NOT_ISSUE_SUBCHAIN,
  /**链域名拥有者或管理员不能发行资产 */
  LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_ASSET,
  /**链域名拥有者或管理员不能发行子链 */
  LNS_POSSESSOR_OR_MANAGER_CAN_NOT_ISSUE_SUBCHAIN,
  /**缩写名已经存在 */
  ASSETTYPE_ALREADY_EXIST,
  /**链名已经存在 */
  CHAINNAME_ALREADY_EXIST,
  /**资产已经存在 */
  ASSET_ALREADY_EXIST,
  /**链域名已经存在 */
  LOCATION_NAME_ALREADY_EXIST,
  /**不能将冻结账户设置为管理员 */
  CAN_NOT_SET_FROZEN_ACCOUNT_AS_MANAGER,
  /**不能将原来的管理员设置为管理员 */
  CAN_NOT_SET_SAME_ACCOUNT_AS_MANAGER,
  /**没有设置链域名管理员的权限 */
  SET_LNS_MANAGER_PERMISSION_DENIED,
  /**没有设置链域名管理员的权限 */
  SET_LNS_RECORD_VALUE_PERMISSION_DENIED,
  /**账户已经设置了用户名 */
  ACCOUNT_ALREADY_HAVE_USERNAME,
  /**用户名已经存在 */
  USERNAME_ALREADY_EXIST,
  /**子链的每个区块最大交易量太大 */
  SUBCHAIN_MAXTPSPERBLOCK_TOO_BIG,
  /**账户已经给受托人投票 */
  ACCOUNT_ALREADY_VOTED_FOR_DELEGATE,
}

/**
 * 广播交易的返回值
 * 可能的错误：交易验证不通过，或者手续费不足，或者已经超出可处理的时间段
 */
@Type.d("NewTransactionReturn")
export class NewTransactionReturnModel extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.NewTransactionReturnJSON> {
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
  toJSON() {
    return Object.assign(super.toJSON(), {
      newTrsStatus: this.newTrsStatus,
      minFee: this.minFee,
      refuseReason: this.refuseReason,
    });
  }
}
