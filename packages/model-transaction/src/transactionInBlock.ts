import { Type, Field, Message } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
import type { Transaction } from "@bfchain/core-model-transaction-base";
import { SomeTransactionModel } from "./someTransaction";

export enum TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE {
  SENDER = 0,
  /**
   * 现在`recipient`是一个数组，这里应该说是`1+`的正整数
   */
  RECIPIENT = 1,
  /**非同质资产模板的发起者 */
  ENTITY_FACTORY_APPLICANT = 2,
  /**非同质资产模板的拥有者 */
  ENTITY_FACTORY_POSSESSOR = 3,
  /**非同质资产的发起者 */
  ENTITY_APPLICANT = 4,
  /**非同质资产的拥有者 */
  ENTITY_POSSESSOR = 5,
}

@Type.d("TransactionAssetChangeModel")
export class TransactionAssetChangeModel
  extends Message
  implements BFChainUtil.JSONAble<BFChainCore.TransactionAssetChangeJSON>
{
  static INC = 1;
  /**账户类型 */
  @Field.d(TransactionAssetChangeModel.INC++, "uint32")
  accountType!: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
  /**资产所属链网络标识符 */
  @Field.d(TransactionAssetChangeModel.INC++, "string")
  sourceChainMagic!: string;
  /**资产名 */
  @Field.d(TransactionAssetChangeModel.INC++, "string")
  assetType!: string;
  /**交易校验完成后账户持有的资产余额 */
  @Field.d(TransactionAssetChangeModel.INC++, "string")
  assetPrealnum!: string;
  toJSON() {
    return {
      accountType: this.accountType,
      sourceChainMagic: this.sourceChainMagic,
      assetType: this.assetType,
      assetPrealnum: this.assetPrealnum,
    };
  }
  @cacheBytesGetter
  getBytes() {
    const props: PropertyDescriptorMap = {};
    const trsWrapper = Object.create(this, props);
    const bytes = this.$type.encode(trsWrapper).finish();
    return bytes;
  }
}

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
  /**交易在区块内的索引 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  index!: number;
  /**交易所属的区块高度 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  height!: number;
  /**交易发起账户的第 i 笔交易 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  numberOfSenderTransactions!: number;
  /**交易验证完成后账户变动 */
  @Field.d(TransactionInBlock.INC++, TransactionAssetChangeModel, "repeated")
  transactionAssetChanges!: TransactionAssetChangeModel[];
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
      index: this.index,
      height: this.height,
      numberOfSenderTransactions: this.numberOfSenderTransactions,
      transactionAssetChanges: this.transactionAssetChanges.map((transactionAssetChange) =>
        transactionAssetChange.toJSON(),
      ),
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
