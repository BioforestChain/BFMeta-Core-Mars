import { Message, Field, Type } from "@bfchain/protobuf";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { GIFT_DISTRIBUTION_RULE, PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";
import { TaxInformationModel } from "@bfchain/core-model-common";
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], string[]>();

/**
 * giftAny 交易 asset 模型
 *
 */
@Type.d("GiftAnyModel")
export class GiftAnyModel
  extends Message<GiftAnyModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAnyJSON>
{
  static INC = 1;
  /**密钥交换 */
  @Field.d(GiftAnyModel.INC++, "bytes", "repeated")
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
  @Field.d(GiftAnyModel.INC++, "string")
  sourceChainMagic!: string;
  /**用于赠送的资产来源链的链名 */
  @Field.d(GiftAnyModel.INC++, "string")
  sourceChainName!: string;
  /**赠送的资产所属大类 */
  @Field.d(GiftAnyModel.INC++, PARENT_ASSET_TYPE)
  parentAssetType!: PARENT_ASSET_TYPE;
  /**用于赠送的资产 */
  @Field.d(GiftAnyModel.INC++, "string")
  assetType!: string;
  /**用于赠送的资产数量 */
  @Field.d(GiftAnyModel.INC++, "string")
  amount!: string;
  /**接受赠送的次数 */
  @Field.d(GiftAnyModel.INC++, "uint32")
  totalGrabableTimes!: number;
  /**可以开始进行交易的区块高度 */
  @Field.d(GiftAnyModel.INC++, "uint32", "optional")
  beginUnfrozenBlockHeight?: number;
  /**资产的分配规则 */
  @Field.d(GiftAnyModel.INC++, "uint32", "optional")
  giftDistributionRule?: GIFT_DISTRIBUTION_RULE;
  /**收税信息 */
  @Field.d(GiftAnyModel.INC++, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;
  toJSON() {
    const res: BFChainCore.GiftAnyJSON = {
      cipherPublicKeys: this.cipherPublicKeys,
      sourceChainMagic: this.sourceChainMagic,
      sourceChainName: this.sourceChainName,
      parentAssetType: this.parentAssetType,
      assetType: this.assetType,
      amount: this.amount,
      totalGrabableTimes: this.totalGrabableTimes,
    };

    this.giftDistributionRule !== undefined &&
      (res.giftDistributionRule = this.giftDistributionRule);
    this.beginUnfrozenBlockHeight && (res.beginUnfrozenBlockHeight = this.beginUnfrozenBlockHeight);
    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<GiftAnyModel>,
  ) {
    const res = super.fromObject(object) as GiftAnyModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return res as unknown as T;
  }
}

/**
 * giftAny 交易 asset 外层模型
 *
 */
@Type.d("GiftAnyAssetModel")
export class GiftAnyAssetModel
  extends Message<GiftAnyAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.GiftAnyAssetJSON>
{
  @Field.d(1, GiftAnyModel)
  giftAny!: GiftAnyModel;
  toJSON() {
    return {
      giftAny: this.giftAny.toJSON(),
    };
  }
}
