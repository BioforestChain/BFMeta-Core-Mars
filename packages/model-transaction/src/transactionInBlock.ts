import { Type, Field, Message } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import type { Transaction } from "@bfchain/core-model-transaction-base";
import { SomeTransactionModel } from "./someTransaction";

@Type.d("AssetPrealnumModel")
export class AssetPrealnumModel
  extends Message<AssetPrealnumModel>
  implements BFChainCore.JSONToModelType<BFChainCore.AssetPrealnumJSON>
{
  static INC = 1;
  @Field.d(AssetPrealnumModel.INC++, "string")
  remainAssetPrealnum!: string;
  @Field.d(AssetPrealnumModel.INC++, "string")
  frozenMainAssetPrealnum!: string;

  toJSON() {
    return {
      remainAssetPrealnum: this.remainAssetPrealnum,
      frozenMainAssetPrealnum: this.frozenMainAssetPrealnum,
    };
  }
}

/**交易与其在区块中的下标 */
@Type.d("TransactionInBlock")
export class TransactionInBlock<
  T extends Transaction = Transaction,
> extends SomeTransactionModel<T> {
  /**交易在链内的索引 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  tIndex!: number;
  /**交易所属的区块高度 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  height!: number;
  /**非同质资产信息 */
  @Field.d(TransactionInBlock.INC++, AssetPrealnumModel, "optional")
  assetPrealnum?: AssetPrealnumModel;
  /**区块锻造者的签名 */
  @Field.d(TransactionInBlock.INC++, "bytes")
  signatureBuffer!: Uint8Array;
  get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }
  /**区块锻造者的安全签名 */
  @Field.d(TransactionInBlock.INC++, "bytes", "optional")
  signSignatureBuffer?: Uint8Array;
  get signSignature() {
    return (
      (this.signSignatureBuffer && getHexFromArrayBuffer(this.signSignatureBuffer)) || undefined
    );
  }
  set signSignature(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.signSignatureBuffer = parseHexToArrayBuffer(value);
  }
  @cacheBytesGetter
  getBytes(skipSignature?: boolean, skipSignSignature?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      props.signatureBuffer = { value: null };
    }
    if (skipSignSignature) {
      props.signSignatureBuffer = { value: null };
    }
    const trsWrapper = Object.create(this, props);
    const bytes = this.$type.encode(trsWrapper).finish();
    return bytes;
  }
  toJSON() {
    const res: BFChainCore.TransactionInBlockJSON<BFChainUtil.ToJSONType<T>> = {
      tIndex: this.tIndex,
      height: this.height,
      signature: this.signature,
      transaction: this.transaction.toJSON() as BFChainUtil.ToJSONType<T>,
    };

    this.assetPrealnum && (res.assetPrealnum = this.assetPrealnum.toJSON());
    this.signSignature && (res.signSignature = this.signSignature);

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<TransactionInBlock>,
  ) {
    const res = super.fromObject(object) as TransactionInBlock;
    if (object !== res) {
      object.signature && (res.signature = object.signature);
      object.signSignature && (res.signSignature = object.signSignature);
    }
    return res as unknown as T;
  }
}
