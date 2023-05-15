import { TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { Message, Field, Type } from "@bfchain/protobuf";

/**
 * promiseResolve 交易 asset 模型
 *
 */
@Type.d("PromiseResolveModel")
export class PromiseResolveModel
  extends Message<PromiseResolveModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.PromiseResolveJSON>
{
  static INC = 1;

  /**要兑现的承诺交易签名 */
  @Field.d(PromiseResolveModel.INC++, "bytes")
  promiseIdBuffer!: Uint8Array;
  public get promiseId(): string {
    return getHexFromArrayBuffer(this.promiseIdBuffer);
  }
  public set promiseId(value: string) {
    this.promiseIdBuffer = parseHexToArrayBuffer(value);
  }
  toJSON() {
    return {
      promiseId: this.promiseId,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<PromiseResolveModel>,
  ) {
    const res = super.fromObject(object) as PromiseResolveModel;
    if (res !== object) {
      object.promiseId && (res.promiseId = object.promiseId);
    }
    return res as unknown as T;
  }
}

/**
 * promiseResolve 交易 asset 外层模型
 *
 */
@Type.d("PromiseResolveAssetModel")
export class PromiseResolveAssetModel
  extends Message<PromiseResolveAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.PromiseResolveAssetJSON>
{
  @Field.d(1, PromiseResolveModel)
  resolve!: PromiseResolveModel;
  toJSON() {
    return {
      resolve: this.resolve.toJSON(),
    };
  }
}
