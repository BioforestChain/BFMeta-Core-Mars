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
}

@Type.d("TransactionAssetChangeModel")
export class TransactionAssetChangeModel extends Message
  implements BFChainUtil.JSONAble<BFChainCore.TransactionAssetChangeJSON> {
  static INC = 1;
  /**账户类型 */
  @Field.d(TransactionAssetChangeModel.INC++, "uint32")
  accountType!: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE;
  /**资产编号 */
  @Field.d(TransactionAssetChangeModel.INC++, "uint32")
  assetTypes!: number;
  /**交易校验完成后账户持有的资产余额 */
  @Field.d(TransactionAssetChangeModel.INC++, "string")
  assetBalance!: string;
  toJSON() {
    return {
      accountType: this.accountType,
      assetTypes: this.assetTypes,
      assetBalance: this.assetBalance,
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

/**交易与其在区块中的下标 */
@Type.d("TransactionInBlock")
export class TransactionInBlock<T extends Transaction = Transaction> extends SomeTransactionModel<
  T
> {
  /**交易在区块内的索引 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  index!: number;
  /**交易所属的区块高度 */
  @Field.d(TransactionInBlock.INC++, "uint32")
  height!: number;
  /**交易验证完成后账户变动 */
  @Field.d(TransactionInBlock.INC++, TransactionAssetChangeModel, "repeated")
  transactionAssetChanges!: TransactionAssetChangeModel[];
  /**区块锻造者的签名 */
  @Field.d(TransactionInBlock.INC++, "bytes")
  signatureBuffer!: Uint8Array;
  get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }
  @cacheBytesGetter
  getBytes(skipSignature?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      props.signatureBuffer = { value: null };
    }
    const trsWrapper = Object.create(this, props);
    const bytes = this.$type.encode(trsWrapper).finish();
    return bytes;
  }
  toJSON() {
    return Object.assign(
      {
        index: this.index,
        height: this.height,
        transactionAssetChanges: this.transactionAssetChanges.map(transactionAssetChange =>
          transactionAssetChange.toJSON(),
        ),
        signature: this.signature,
      },
      super.toJSON(),
    );
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<TransactionInBlock>,
  ) {
    const res = super.fromObject(object) as TransactionInBlock;
    if (object !== res) {
      object.signature && (res.signature = object.signature);
    }
    return (res as unknown) as T;
  }
}
