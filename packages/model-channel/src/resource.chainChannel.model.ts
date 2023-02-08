import { Field, Message, Type, Long } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";

/**
 * 下载交易的传入参数
 */
@Type.d("OpenBlobArgModel")
export class OpenBlobArgModel
  extends Message<OpenBlobArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.OpenBlobArgJSON>
{
  static INC = 1;
  @Field.d(OpenBlobArgModel.INC++, "string")
  algorithm!: BFChainCore.OpenBlobArgJSON.Algorithm;
  /**查询参数 */
  @Field.d(OpenBlobArgModel.INC++, "bytes")
  hashBuffer!: Uint8Array;
  get hash() {
    return getHexFromArrayBuffer(this.hashBuffer);
  }
  set hash(value: string) {
    this.hashBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    return {
      algorithm: this.algorithm,
      hash: this.hash,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BFChainCore.OpenBlobArgJSON & T>,
  ) {
    const res = super.fromObject(object as any) as OpenBlobArgModel;
    object.hash && (res.hash = object.hash);
    return res as unknown as T;
  }
}

/**
 * 下载交易的返回值
 */
@Type.d("OpenBlobReturn")
export class OpenBlobReturnModel
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.OpenBlobReturnJSON>
{
  @Field.d(OpenBlobReturnModel.INC++, "uint32", "optional")
  descriptor!: number;
  @Field.d(OpenBlobReturnModel.INC++, "string", "optional")
  contentType!: string;
  @Field.d(OpenBlobReturnModel.INC++, "uint32", "optional")
  size!: number;
  @Field.d(OpenBlobReturnModel.INC++, "uint32", "optional")
  chunkSize!: number;
  @Field.d(OpenBlobReturnModel.INC++, "uint64", "optional")
  expriedTimeLong!: Long;
  get expriedTime() {
    return this.expriedTimeLong.toNumber();
  }
  set expriedTime(v) {
    this.expriedTimeLong = Long.fromNumber(v);
  }
  toJSON() {
    const res = super.toJSON() as BFChainCore.OpenBlobReturnJSON;
    res.descriptor = this.descriptor;
    res.contentType = this.contentType;
    res.size = this.size;
    res.chunkSize = this.chunkSize;
    res.expriedTime = this.expriedTime;
    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BFChainCore.OpenBlobReturnJSON>,
  ) {
    const res = super.fromObject(object as any) as OpenBlobReturnModel;
    object.expriedTime && (res.expriedTime = object.expriedTime);
    return res as unknown as T;
  }
}

@Type.d("CloseBlobArg")
export class CloseBlobArgModel
  extends Message<CloseBlobArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.CloseBlobArgJSON>
{
  static INC = 1;
  /**查询参数 */
  @Field.d(CloseBlobArgModel.INC++, "uint32")
  descriptor!: number;

  toJSON() {
    return {
      descriptor: this.descriptor,
    };
  }
}

@Type.d("CloseBlobReturn")
export class CloseBlobReturnModel
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.CloseBlobReturnJSON> {}

@Type.d("ReadBlobArg")
export class ReadBlobArgModel
  extends Message<ReadBlobArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.ReadBlobArgJSON>
{
  static INC = 1;
  /**查询参数 */
  @Field.d(ReadBlobArgModel.INC++, "uint32")
  descriptor!: number;
  @Field.d(ReadBlobArgModel.INC++, "uint32")
  start!: number;
  @Field.d(ReadBlobArgModel.INC++, "uint32")
  end!: number;

  toJSON() {
    return {
      descriptor: this.descriptor,
      start: this.start,
      end: this.end,
    };
  }
}

@Type.d("ReadBlobReturn")
export class ReadBlobReturnModel
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.ReadBlobReturnJSON>
{
  static INC = 1;
  @Field.d(ReadBlobArgModel.INC++, "bytes")
  chunkBuffer!: Uint8Array;
  get chunk() {
    return getHexFromArrayBuffer(this.chunkBuffer);
  }
  set chunk(hex: string) {
    this.chunkBuffer = parseHexToArrayBuffer(hex);
  }
  toJSON(): BFChainCore.ReadBlobReturnJSON {
    const res = super.toJSON() as BFChainCore.ReadBlobReturnJSON;
    res.chunk = this.chunk;
    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BFChainCore.ReadBlobReturnJSON>,
  ) {
    const res = super.fromObject(object as any) as ReadBlobReturnModel;
    object.chunk && (res.chunk = object.chunk);
    return res as unknown as T;
  }
}
