import { Message, Field, Type } from "@bfchain/protobuf";
import { RateModel } from "@bfchain/core-model-common";
import { cacheGetter } from "@bfchain/util-decorator";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], Readonly<string[]>>();

/**
 * exchangeAsset 交易 asset 模型
 *
 */
@Type.d("ToExchangeAssetModel")
export class ToExchangeAssetModel
  extends Message<ToExchangeAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAssetJSON>
{
  static INC = 1;
  /**密钥交换 */
  @Field.d(ToExchangeAssetModel.INC++, "bytes", "repeated")
  cipherPublicKeysBuffer!: Uint8Array[];
  public get cipherPublicKeys() {
    const { cipherPublicKeysBuffer } = this;
    let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherPublicKeysBuffer);
    if (!cipherTexts) {
      cipherTexts = Object.freeze(
        cipherPublicKeysBuffer.map((chiperTextBuffer) => getHexFromArrayBuffer(chiperTextBuffer)),
      );
      BUFFER_LIST_PUBLICKEY_LIST_WM.set(cipherPublicKeysBuffer, cipherTexts);
    }
    return cipherTexts as string[];
  }
  public set cipherPublicKeys(cipherTextList: string[]) {
    const bufList: Uint8Array[] = [];
    for (const cipherText of cipherTextList) {
      bufList.push(parseHexToArrayBuffer(cipherText));
    }
    if (Object.isFrozen(cipherTextList)) {
      BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherTextList);
    }
    this.cipherPublicKeysBuffer = bufList;
  }
  /**用于交换的资产来源链的网络标识符 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  toExchangeSource!: string;
  /**被交换的资产来源链的网络标识符 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  beExchangeSource!: string;
  /**用于交换的资产来源链的链名 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  toExchangeChainName!: string;
  /**被交换的资产来源链的链名 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  beExchangeChainName!: string;
  /**用于交换的资产名 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  toExchangeAsset!: string;
  /**被交换的资产名 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  beExchangeAsset!: string;
  /**用于交换的资产数量 */
  @Field.d(ToExchangeAssetModel.INC++, "string")
  toExchangeNumber!: string;
  /**交换的资产比例 */
  @Field.d(ToExchangeAssetModel.INC++, RateModel)
  exchangeRate!: RateModel;
  @cacheGetter
  get to() {
    return {
      magic: this.toExchangeSource,
      chainName: this.toExchangeChainName,
      assetType: this.toExchangeAsset,
      amount: this.toExchangeNumber,
    };
  }
  @cacheGetter
  get be() {
    return {
      magic: this.beExchangeSource,
      chainName: this.beExchangeChainName,
      assetType: this.beExchangeAsset,
    };
  }
  toJSON() {
    return {
      cipherPublicKeys: this.cipherPublicKeys,
      toExchangeSource: this.toExchangeSource,
      beExchangeSource: this.beExchangeSource,
      toExchangeChainName: this.toExchangeChainName,
      beExchangeChainName: this.beExchangeChainName,
      toExchangeAsset: this.toExchangeAsset,
      beExchangeAsset: this.beExchangeAsset,
      toExchangeNumber: this.toExchangeNumber,
      exchangeRate: this.exchangeRate.toJSON(),
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ToExchangeAssetModel>,
  ) {
    const res = super.fromObject(object) as ToExchangeAssetModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return res as unknown as T;
  }
}

/**
 * exchangeAsset 交易 asset 外层模型
 *
 */
@Type.d("ToExchangeAssetAssetModel")
export class ToExchangeAssetAssetModel
  extends Message<ToExchangeAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeAssetAssetJSON>
{
  @Field.d(1, ToExchangeAssetModel)
  toExchangeAsset!: ToExchangeAssetModel;
  toJSON() {
    return {
      toExchangeAsset: this.toExchangeAsset.toJSON(),
    };
  }
}
