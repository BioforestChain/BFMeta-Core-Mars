import { Message, Field, Type } from "@bfchain/protobuf";
import { cacheGetter } from "@bfchain/util-decorator";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";

/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], string[]>();

/**
 * 比例模型
 */
@Type.d("AssetExchangeWeightRatioModel")
export class AssetExchangeWeightRatioModel
  extends Message<AssetExchangeWeightRatioModel>
  implements BFChainUtil.JSONAble<BFChainCore.AssetExchangeWeightRatioJSON>
{
  /**账户持有权益量权重 */
  @Field.d(1, "string")
  toExchangeAssetWeight!: string;
  /**账户事件量权重 */
  @Field.d(2, "string")
  beExchangeAssetWeight!: string;
  toJSON() {
    return {
      toExchangeAssetWeight: this.toExchangeAssetWeight,
      beExchangeAssetWeight: this.beExchangeAssetWeight,
    };
  }
}

/**
 * toExchangeAny 交易 asset 模型
 *
 */
@Type.d("ToExchangeAnyModel")
export class ToExchangeAnyModel
  extends Message<ToExchangeAnyModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAnyJSON>
{
  static INC = 1;
  /**密钥交换 */
  @Field.d(ToExchangeAnyModel.INC++, "bytes", "repeated")
  cipherPublicKeysBuffer!: Uint8Array[];
  get cipherPublicKeys(): string[] {
    const { cipherPublicKeysBuffer: cipherTextsBuffer } = this;
    let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherTextsBuffer);
    if (!cipherTexts) {
      cipherTexts = this.cipherPublicKeysBuffer.map((chiperPublicKeyBuffer) =>
        getHexFromArrayBuffer(chiperPublicKeyBuffer),
      );
    }
    return cipherTexts;
  }
  set cipherPublicKeys(cipherTextList: string[]) {
    const bufList = cipherTextList.map((cipherText) => parseHexToArrayBuffer(cipherText));
    BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherTextList);
    this.cipherPublicKeysBuffer = bufList;
  }
  /**用于交换的域名来源链的网络标识符 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  toExchangeSource!: string;
  /**被交换的资产来源链的网络标识符 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  beExchangeSource!: string;
  /**用于交换的域名来源链的链名 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  toExchangeChainName!: string;
  /**被交换的资产来源链的链名 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  beExchangeChainName!: string;
  /**用于交换的资产类型 */
  @Field.d(ToExchangeAnyModel.INC++, PARENT_ASSET_TYPE)
  toExchangeParentAssetType!: PARENT_ASSET_TYPE;
  /**被交换的资产类型 */
  @Field.d(ToExchangeAnyModel.INC++, PARENT_ASSET_TYPE)
  beExchangeParentAssetType!: PARENT_ASSET_TYPE;
  /**用于交换的资产名 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  toExchangeAssetType!: string;
  /**被交换的资产名 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  beExchangeAssetType!: string;
  /**用于交换的资产数量 */
  @Field.d(ToExchangeAnyModel.INC++, "string")
  toExchangeAssetPrealnum!: string;
  /**被交换的资产数量 */
  @Field.d(ToExchangeAnyModel.INC++, "string", "optional")
  beExchangeAssetPrealnum?: string;
  /**交换的比例 */
  @Field.d(ToExchangeAnyModel.INC++, AssetExchangeWeightRatioModel, "optional")
  assetExchangeWeightRatio?: AssetExchangeWeightRatioModel;

  @cacheGetter
  get to() {
    return {
      magic: this.toExchangeSource,
      chainName: this.toExchangeChainName,
      toExchangeAssetType: this.toExchangeAssetType,
      toExchangeParentAssetType: this.toExchangeParentAssetType,
      toExchangeAssetPrealnum: this.toExchangeAssetPrealnum,
    };
  }
  get be() {
    return {
      magic: this.beExchangeSource,
      chainName: this.beExchangeChainName,
      beExchangeAssetType: this.beExchangeAssetType,
      beExchangeParentAssetType: this.beExchangeParentAssetType,
      beExchangeAssetPrealnum: this.beExchangeAssetPrealnum || "1",
    };
  }
  toJSON() {
    const res: BFChainCore.ToExchangeAnyJSON = {
      cipherPublicKeys: this.cipherPublicKeys,
      toExchangeSource: this.toExchangeSource,
      beExchangeSource: this.beExchangeSource,
      toExchangeChainName: this.toExchangeChainName,
      beExchangeChainName: this.beExchangeChainName,
      toExchangeAssetType: this.toExchangeAssetType,
      beExchangeAssetType: this.beExchangeAssetType,
      toExchangeParentAssetType: this.toExchangeParentAssetType,
      beExchangeParentAssetType: this.beExchangeParentAssetType,
      toExchangeAssetPrealnum: this.toExchangeAssetPrealnum,
    };

    this.beExchangeAssetPrealnum && (res.beExchangeAssetPrealnum = this.beExchangeAssetPrealnum);
    this.assetExchangeWeightRatio &&
      (res.assetExchangeWeightRatio = this.assetExchangeWeightRatio.toJSON());

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ToExchangeAnyModel>,
  ) {
    const res = super.fromObject(object) as ToExchangeAnyModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return res as unknown as T;
  }
}

/**
 * toExchangeAsset 交易 asset 外层模型
 *
 */
@Type.d("ToExchangeAnyAssetModel")
export class ToExchangeAnyAssetModel
  extends Message<ToExchangeAnyAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAnyAssetJSON>
{
  @Field.d(1, ToExchangeAnyModel)
  toExchangeAny!: ToExchangeAnyModel;
  toJSON() {
    return {
      toExchangeAny: this.toExchangeAny.toJSON(),
    };
  }
}
