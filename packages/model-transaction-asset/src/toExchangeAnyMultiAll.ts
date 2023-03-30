import { Message, Field, Type } from "@bfchain/protobuf";
import { cacheGetter } from "@bfchain/util-decorator";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { PARENT_ASSET_TYPE } from "@bfchain/core-model-constants";
import { TaxInformationModel } from "@bfchain/core-model-common";

/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], string[]>();

/**
 * 用于交换的资产
 */
@Type.d("ToExchangeAssetV2Model")
export class ToExchangeAssetV2Model
  extends Message<ToExchangeAssetV2Model>
  implements BFChainUtil.JSONAble<BFChainCore.ToExchangeAssetV2JSON>
{
  static INC = 1;
  /**用于交换的域名来源链的网络标识符 */
  @Field.d(ToExchangeAssetV2Model.INC++, "string")
  toExchangeSource!: string;
  /**用于交换的域名来源链的链名 */
  @Field.d(ToExchangeAssetV2Model.INC++, "string")
  toExchangeChainName!: string;
  /**用于交换的资产类型 */
  @Field.d(ToExchangeAssetV2Model.INC++, PARENT_ASSET_TYPE)
  toExchangeParentAssetType!: PARENT_ASSET_TYPE;
  /**用于交换的资产名 */
  @Field.d(ToExchangeAssetV2Model.INC++, "string")
  toExchangeAssetType!: string;
  /**用于交换的资产数量 */
  @Field.d(ToExchangeAssetV2Model.INC++, "string")
  toExchangeAssetPrealnum!: string;
  /**收税信息 */
  @Field.d(ToExchangeAssetV2Model.INC++, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;
  toJSON() {
    const res: BFChainCore.ToExchangeAssetV2JSON = {
      toExchangeSource: this.toExchangeSource,
      toExchangeChainName: this.toExchangeChainName,
      toExchangeParentAssetType: this.toExchangeParentAssetType,
      toExchangeAssetType: this.toExchangeAssetType,
      toExchangeAssetPrealnum: this.toExchangeAssetPrealnum,
    };
    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());
    return res;
  }
}
/**
 * 被交换的资产
 */
@Type.d("BeExchangeAssetV2Model")
export class BeExchangeAssetV2Model
  extends Message<BeExchangeAssetV2Model>
  implements BFChainUtil.JSONAble<BFChainCore.BeExchangeAssetV2JSON>
{
  static INC = 1;
  /**被交换的资产来源链的网络标识符 */
  @Field.d(BeExchangeAssetV2Model.INC++, "string")
  beExchangeSource!: string;
  /**被交换的资产来源链的链名 */
  @Field.d(BeExchangeAssetV2Model.INC++, "string")
  beExchangeChainName!: string;
  /**被交换的资产类型 */
  @Field.d(BeExchangeAssetV2Model.INC++, PARENT_ASSET_TYPE)
  beExchangeParentAssetType!: PARENT_ASSET_TYPE;
  /**被交换的资产名 */
  @Field.d(BeExchangeAssetV2Model.INC++, "string")
  beExchangeAssetType!: string;
  /**被交换的资产数量 */
  @Field.d(BeExchangeAssetV2Model.INC++, "string")
  beExchangeAssetPrealnum!: string;
  /**收税信息 */
  @Field.d(ToExchangeAssetV2Model.INC++, TaxInformationModel, "optional")
  taxInformation?: TaxInformationModel;
  toJSON() {
    const res: BFChainCore.BeExchangeAssetV2JSON = {
      beExchangeSource: this.beExchangeSource,
      beExchangeChainName: this.beExchangeChainName,
      beExchangeParentAssetType: this.beExchangeParentAssetType,
      beExchangeAssetType: this.beExchangeAssetType,
      beExchangeAssetPrealnum: this.beExchangeAssetPrealnum,
    };
    this.taxInformation && (res.taxInformation = this.taxInformation.toJSON());
    return res;
  }
}

/**
 * toExchangeAnyMultiAll 交易 asset 模型
 *
 */
@Type.d("ToExchangeAnyMultiAllModel")
export class ToExchangeAnyMultiAllModel
  extends Message<ToExchangeAnyMultiAllModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAnyMultiAllJSON>
{
  static INC = 1;
  /**密钥交换 */
  @Field.d(ToExchangeAnyMultiAllModel.INC++, "bytes", "repeated")
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
  @Field.d(ToExchangeAnyMultiAllModel.INC++, ToExchangeAssetV2Model, "repeated")
  toExchangeAssets!: ToExchangeAssetV2Model[];
  /**收税信息 */
  @Field.d(ToExchangeAnyMultiAllModel.INC++, BeExchangeAssetV2Model, "repeated")
  beExchangeAssets!: BeExchangeAssetV2Model[];

  @cacheGetter
  get to() {
    return this.toExchangeAssets.map((item) => item.toJSON());
  }
  get be() {
    return this.beExchangeAssets.map((item) => item.toJSON());
  }
  toJSON() {
    const res: BFChainCore.ToExchangeAnyMultiAllJSON = {
      cipherPublicKeys: this.cipherPublicKeys,
      toExchangeAssets: this.toExchangeAssets.map((item) => item.toJSON()),
      beExchangeAssets: this.beExchangeAssets.map((item) => item.toJSON()),
    };

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ToExchangeAnyMultiAllModel>,
  ) {
    const res = super.fromObject(object) as ToExchangeAnyMultiAllModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return res as unknown as T;
  }
}

/**
 * toExchangeAnyMultiAll 交易 asset 外层模型
 *
 */
@Type.d("ToExchangeAnyMultiAllAssetModel")
export class ToExchangeAnyMultiAllAssetModel
  extends Message<ToExchangeAnyMultiAllAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAnyMultiAllAssetJSON>
{
  @Field.d(1, ToExchangeAnyMultiAllModel)
  toExchangeAnyMultiAll!: ToExchangeAnyMultiAllModel;
  toJSON() {
    return {
      toExchangeAnyMultiAll: this.toExchangeAnyMultiAll.toJSON(),
    };
  }
}
