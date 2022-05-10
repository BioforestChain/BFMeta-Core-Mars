import { Message, Field, Type } from "@bfchain/protobuf";
import { cacheGetter } from "@bfchain/util-decorator";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";
import { TaxInformationModel } from "@bfchain/core-model-common";
import { AssetExchangeWeightRatioModel } from "./toExchangeAny";

/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], string[]>();

/**
 * 用于交换的资产
 */
@Type.d("ToExchangeAssetV1Model")
export class ToExchangeAssetV1Model
  extends Message<ToExchangeAssetV1Model>
  implements BFChainUtil.JSONAble<BFChainCore.ToExchangeAssetV1JSON>
{
  static INC = 1;
  /**用于交换的域名来源链的网络标识符 */
  @Field.d(ToExchangeAssetV1Model.INC++, "string")
  toExchangeSource!: string;
  /**用于交换的域名来源链的链名 */
  @Field.d(ToExchangeAssetV1Model.INC++, "string")
  toExchangeChainName!: string;
  /**用于交换的资产类型 */
  @Field.d(ToExchangeAssetV1Model.INC++, PARENT_ASSET_TYPE)
  toExchangeParentAssetType!: PARENT_ASSET_TYPE;
  /**用于交换的资产名 */
  @Field.d(ToExchangeAssetV1Model.INC++, "string")
  toExchangeAssetType!: string;
  /**用于交换的资产数量 */
  @Field.d(ToExchangeAssetV1Model.INC++, "string")
  toExchangeAssetPrealnum!: string;
  /**交换的比例 */
  @Field.d(ToExchangeAssetV1Model.INC++, AssetExchangeWeightRatioModel, "optional")
  assetExchangeWeightRatio?: AssetExchangeWeightRatioModel;
  /**收税信息 */
  @Field.d(ToExchangeAssetV1Model.INC++, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;
  toJSON() {
    const res: BFChainCore.ToExchangeAssetV1JSON = {
      toExchangeSource: this.toExchangeSource,
      toExchangeChainName: this.toExchangeChainName,
      toExchangeParentAssetType: this.toExchangeParentAssetType,
      toExchangeAssetType: this.toExchangeAssetType,
      toExchangeAssetPrealnum: this.toExchangeAssetPrealnum,
    };
    this.assetExchangeWeightRatio &&
      (res.assetExchangeWeightRatio = this.assetExchangeWeightRatio.toJSON());
    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());
    return res;
  }
}
/**
 * 被交换的资产
 */
@Type.d("BeExchangeAssetV1Model")
export class BeExchangeAssetV1Model
  extends Message<BeExchangeAssetV1Model>
  implements BFChainUtil.JSONAble<BFChainCore.BeExchangeAssetV1JSON>
{
  static INC = 1;
  /**被交换的资产来源链的网络标识符 */
  @Field.d(BeExchangeAssetV1Model.INC++, "string")
  beExchangeSource!: string;
  /**被交换的资产来源链的链名 */
  @Field.d(BeExchangeAssetV1Model.INC++, "string")
  beExchangeChainName!: string;
  /**被交换的资产类型 */
  @Field.d(BeExchangeAssetV1Model.INC++, PARENT_ASSET_TYPE)
  beExchangeParentAssetType!: PARENT_ASSET_TYPE;
  /**被交换的资产名 */
  @Field.d(BeExchangeAssetV1Model.INC++, "string")
  beExchangeAssetType!: string;
  /**被交换的资产数量 */
  @Field.d(BeExchangeAssetV1Model.INC++, "string", "optional")
  beExchangeAssetPrealnum?: string;
  /**收税信息 */
  @Field.d(ToExchangeAssetV1Model.INC++, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;
  toJSON() {
    const res: BFChainCore.BeExchangeAssetV1JSON = {
      beExchangeSource: this.beExchangeSource,
      beExchangeChainName: this.beExchangeChainName,
      beExchangeParentAssetType: this.beExchangeParentAssetType,
      beExchangeAssetType: this.beExchangeAssetType,
    };
    this.beExchangeAssetPrealnum && (res.beExchangeAssetPrealnum = this.beExchangeAssetPrealnum);
    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());
    return res;
  }
}

/**
 * toExchangeAnyMulti 交易 asset 模型
 *
 */
@Type.d("ToExchangeAnyMultiModel")
export class ToExchangeAnyMultiModel
  extends Message<ToExchangeAnyMultiModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAnyMultiJSON>
{
  static INC = 1;
  /**密钥交换 */
  @Field.d(ToExchangeAnyMultiModel.INC++, "bytes", "repeated")
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
  /**交换的比例 */
  @Field.d(ToExchangeAnyMultiModel.INC++, ToExchangeAssetV1Model, "repeated")
  toExchangeAssets!: ToExchangeAssetV1Model[];
  /**收税信息 */
  @Field.d(ToExchangeAnyMultiModel.INC++, BeExchangeAssetV1Model)
  beExchangeAsset!: BeExchangeAssetV1Model;

  @cacheGetter
  get to() {
    return this.toExchangeAssets.map((item) => item.toJSON());
  }
  get be() {
    return this.beExchangeAsset.toJSON();
  }
  toJSON() {
    const res: BFChainCore.ToExchangeAnyMultiJSON = {
      cipherPublicKeys: this.cipherPublicKeys,
      toExchangeAssets: this.toExchangeAssets.map((item) => item.toJSON()),
      beExchangeAsset: this.beExchangeAsset.toJSON(),
    };

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ToExchangeAnyMultiModel>,
  ) {
    const res = super.fromObject(object) as ToExchangeAnyMultiModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return res as unknown as T;
  }
}

/**
 * toExchangeAnyMulti 交易 asset 外层模型
 *
 */
@Type.d("ToExchangeAnyMultiAssetModel")
export class ToExchangeAnyMultiAssetModel
  extends Message<ToExchangeAnyMultiAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAnyMultiAssetJSON>
{
  @Field.d(1, ToExchangeAnyMultiModel)
  toExchangeAnyMulti!: ToExchangeAnyMultiModel;
  toJSON() {
    return {
      toExchangeAnyMulti: this.toExchangeAnyMulti.toJSON(),
    };
  }
}
