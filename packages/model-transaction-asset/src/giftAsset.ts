import { Message, Field, Type } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import type { GIFT_DISTRIBUTION_RULE } from "@bfchain/core-model-constants";
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], string[]>();

/**
 * giftAsset 交易 asset 模型
 *
 */
@Type.d("GiftAssetModel")
export class GiftAssetModel
  extends Message<GiftAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAssetJSON>
{
  static INC = 1;
  /**密钥交换 */
  @Field.d(GiftAssetModel.INC++, "bytes", "repeated")
  cipherPublicKeysBuffer!: Uint8Array[];
  get cipherPublicKeys(): string[] {
    const { cipherPublicKeysBuffer } = this;
    let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherPublicKeysBuffer);
    if (!cipherTexts) {
      cipherTexts = this.cipherPublicKeysBuffer.map((chiperPublicKeyBuffer) =>
        getHexFromArrayBuffer(chiperPublicKeyBuffer),
      );
    }
    return cipherTexts;
  }
  set cipherPublicKeys(cipherPublicKeyList: string[]) {
    const bufList = cipherPublicKeyList.map((cipherText) => parseHexToArrayBuffer(cipherText));
    BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherPublicKeyList);
    this.cipherPublicKeysBuffer = bufList;
  }
  /**用于赠送的资产来源链的网络标识符 */
  @Field.d(GiftAssetModel.INC++, "string")
  sourceChainMagic!: string;
  /**用于赠送的资产来源链的链名 */
  @Field.d(GiftAssetModel.INC++, "string")
  sourceChainName!: string;
  /**用于赠送的资产 */
  @Field.d(GiftAssetModel.INC++, "string")
  assetType!: string;
  /**用于赠送的资产数量 */
  @Field.d(GiftAssetModel.INC++, "string")
  amount!: string;
  /**接受赠送的次数 */
  @Field.d(GiftAssetModel.INC++, "uint32")
  totalGrabableTimes!: number;
  /**为每一笔红包预留的手续费数量
   * 这里将冻结`totalGrabableTimes * unitReserveFee`的手续费
   */
  // @Field.d(GiftAssetModel.INC++, "string")
  // unitReserveFee!: string;
  /**可以开始进行交易的区块高度 */
  @Field.d(GiftAssetModel.INC++, "uint32", "optional")
  beginUnfrozenBlockHeight?: number;
  /**资产的分配规则 */
  @Field.d(GiftAssetModel.INC++, "uint32")
  giftDistributionRule!: GIFT_DISTRIBUTION_RULE;
  toJSON() {
    const res: BFChainCore.GiftAssetJSON = {
      cipherPublicKeys: this.cipherPublicKeys,
      sourceChainMagic: this.sourceChainMagic,
      sourceChainName: this.sourceChainName,
      assetType: this.assetType,
      amount: this.amount,
      totalGrabableTimes: this.totalGrabableTimes,
      // unitReserveFee: this.unitReserveFee,
      giftDistributionRule: this.giftDistributionRule,
    };

    this.beginUnfrozenBlockHeight && (res.beginUnfrozenBlockHeight = this.beginUnfrozenBlockHeight);

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<GiftAssetModel>,
  ) {
    const res = super.fromObject(object) as GiftAssetModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return res as unknown as T;
  }
}

/**
 * giftAsset 交易 asset 外层模型
 *
 */
@Type.d("GiftAssetAssetModel")
export class GiftAssetAssetModel
  extends Message<GiftAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAssetAssetJSON>
{
  @Field.d(1, GiftAssetModel)
  giftAsset!: GiftAssetModel;
  toJSON() {
    return {
      giftAsset: this.giftAsset.toJSON(),
    };
  }
}
