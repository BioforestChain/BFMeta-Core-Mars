import { Message, Type, Field } from "@bfchain/protobuf";
import { CommonResponse, ErrorMessage } from "./common.chainChannel.model";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { SomeBlockModel } from "@bfchain/core-model-block";

/**
 * 查询区块的查询条件
 */
@Type.d("BlockQueryOptions")
export class BlockQueryOptionsModel
  extends Message<BlockQueryOptionsModel>
  implements BFChainCore.JSONToModelType<BFChainCore.BlockQueryOptionsJSON>
{
  @Field.d(1, "string", "optional")
  blockId?: string;
  @Field.d(2, "uint32", "optional")
  height?: number;
  toJSON() {
    const res: BFChainCore.BlockQueryOptionsJSON = super.toJSON();
    this.blockId && (res.blockId = this.blockId);
    this.height && (res.height = this.height);
    return res;
  }
}

/**
 * 查询区块的传入参数
 */
@Type.d("QueryBlockArg")
export class QueryBlockArgModel
  extends Message<QueryBlockArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.QueryBlockArgJSON>
{
  /**查询参数 */
  @Field.d(1, BlockQueryOptionsModel)
  query!: BlockQueryOptionsModel;
  toJSON() {
    return { query: this.query.toJSON() };
  }
}

/**
 * 查询区块的返回结果
 */
@Type.d("QueryBlockReturn")
export class QueryBlockReturnModel<B extends BFChainCore.Block = BFChainCore.Block>
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.QueryBlockReturnJSON>
{
  @Field.d(QueryBlockReturnModel.INC++, SomeBlockModel, "optional")
  someBlock?: SomeBlockModel<B>;
  toJSON() {
    const res: BFChainCore.QueryBlockReturnJSON<B> = super.toJSON();
    if (this.someBlock) {
      res.someBlock = this.someBlock.toJSON();
    }
    return res;
  }
}

/**
 * 广播区块的传入参数
 */
@Type.d("NewBlockArg")
export class NewBlockArgModel
  extends Message<NewBlockArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.NewBlockArgJSON>
{
  static INC = 1;
  @Field.d(NewBlockArgModel.INC++, "uint32")
  height!: number;
  @Field.d(NewBlockArgModel.INC++, "string")
  blockId!: string;
  @Field.d(NewBlockArgModel.INC++, "string")
  previousBlockId!: string;
  @Field.d(NewBlockArgModel.INC++, "uint32")
  timestamp!: number;
  @Field.d(NewBlockArgModel.INC++, "string")
  totalFee!: string;
  @Field.d(NewBlockArgModel.INC++, "uint32")
  numberOfTransactions!: number;
  @Field.d(NewBlockArgModel.INC++, "bytes")
  generatorPublicKeyBuffer!: Uint8Array;
  get generatorPublicKey(): string {
    return getHexFromArrayBuffer(this.generatorPublicKeyBuffer);
  }
  set generatorPublicKey(value: string) {
    this.generatorPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  @Field.d(NewBlockArgModel.INC++, "string")
  blockParticipation!: string;
  @Field.d(NewBlockArgModel.INC++, "uint32")
  version!: number;
  toJSON() {
    return {
      height: this.height,
      blockId: this.blockId,
      previousBlockId: this.previousBlockId,
      timestamp: this.timestamp,
      totalFee: this.totalFee,
      numberOfTransactions: this.numberOfTransactions,
      generatorPublicKey: this.generatorPublicKey,
      blockParticipation: this.blockParticipation,
      version: this.version,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<NewBlockArgModel>,
  ) {
    const res = super.fromObject(object) as NewBlockArgModel;
    if (res !== object) {
      object.generatorPublicKey && (res.generatorPublicKey = object.generatorPublicKey);
    }
    return res as unknown as T;
  }
}

/**
 * 广播区块的返回结果
 */
@Type.d("NewBlockReturn")
export class NewBlockReturn
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.NewBlockReturnJSON> {}
