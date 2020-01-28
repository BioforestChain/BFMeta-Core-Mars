import { Message, Field, Type } from "@bfchain/protobuf";
import { cacheGetter } from "@bfchain/util-decorator";
import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "@bfchain/util-encoding-hex";
import { SPECIAL_ASSET_TYPE, EXCHANGE_DIRECTION } from "@bfchain/core-model-constants";
/**缓存cipherTexts解析结果 */
const BUFFER_LIST_PUBLICKEY_LIST_WM = new WeakMap<Uint8Array[], string[]>();

/**
 * toExchangeSpecialAsset 交易 asset 模型
 *
 */
@Type.d("ToExchangeSpecialAssetModel")
export class ToExchangeSpecialAssetModel extends Message<ToExchangeSpecialAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeSpecialAssetJSON> {
  static INC = 1;
  /**密钥交换 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "bytes", "repeated")
  cipherPublicKeysBuffer!: Uint8Array[];
  get cipherPublicKeys(): string[] {
    const { cipherPublicKeysBuffer: cipherTextsBuffer } = this;
    let cipherTexts = BUFFER_LIST_PUBLICKEY_LIST_WM.get(cipherTextsBuffer);
    if (!cipherTexts) {
      cipherTexts = this.cipherPublicKeysBuffer.map(chiperPublicKeyBuffer =>
        getHexFromArrayBuffer(chiperPublicKeyBuffer),
      );
    }
    return cipherTexts;
  }
  set cipherPublicKeys(cipherTextList: string[]) {
    const bufList = cipherTextList.map(cipherText => parseHexToArrayBuffer(cipherText));
    BUFFER_LIST_PUBLICKEY_LIST_WM.set(bufList, cipherTextList);
    this.cipherPublicKeysBuffer = bufList;
  }
  /**用于交换的域名来源链的网络标识符 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  toExchangeSource!: string;
  /**被交换的资产来源链的网络标识符 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  beExchangeSource!: string;
  /**用于交换的域名来源链的链名 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  toExchangeChainName!: string;
  /**被交换的资产来源链的链名 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  beExchangeChainName!: string;
  /**用于交换的资产名 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  toExchangeAsset!: string;
  /**被交换的资产名 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  beExchangeAsset!: string;
  /**交换的资产数量 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, "string")
  exchangeNumber!: string;
  @Field.d(ToExchangeSpecialAssetModel.INC++, SPECIAL_ASSET_TYPE)
  exchangeAssetType!: SPECIAL_ASSET_TYPE;
  /**交换方向 */
  @Field.d(ToExchangeSpecialAssetModel.INC++, EXCHANGE_DIRECTION)
  exchangeDirection!: EXCHANGE_DIRECTION;
  // /**可以开始进行交换的区块高度 */
  // @Field.d(ToExchangeSpecialAssetModel.INC++, "uint32", "optional")
  // numberOfBeginUnfrozenBlocks?: number;

  @cacheGetter
  get to() {
    return {
      magic: this.toExchangeSource,
      chainName: this.toExchangeChainName,
      toExchangeAsset: this.toExchangeAsset,
      amount:
        this.exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT
          ? this.exchangeNumber
          : undefined,
    };
  }
  get be() {
    return {
      magic: this.beExchangeSource,
      chainName: this.beExchangeChainName,
      assetType: this.beExchangeAsset,
      amount:
        this.exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER
          ? this.exchangeNumber
          : undefined,
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
      exchangeNumber: this.exchangeNumber,
      exchangeAssetType: this.exchangeAssetType,
      exchangeDirection: this.exchangeDirection,
      // numberOfBeginUnfrozenBlocks: this.numberOfBeginUnfrozenBlocks,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ToExchangeSpecialAssetModel>,
  ) {
    const res = super.fromObject(object) as ToExchangeSpecialAssetModel;
    if (res !== object) {
      object.cipherPublicKeys && (res.cipherPublicKeys = object.cipherPublicKeys);
    }
    return (res as unknown) as T;
  }
}

/**
 * toExchangeSpecialAsset 交易 asset 外层模型
 *
 */
@Type.d("ToExchangeSpecialAssetAssetModel")
export class ToExchangeSpecialAssetAssetModel extends Message<ToExchangeSpecialAssetAssetModel>
  implements BFChainCore.AssetJSONToModelType<BFChainCore.ToExchangeSpecialAssetAssetJSON> {
  @Field.d(1, ToExchangeSpecialAssetModel)
  toExchangeSpecialAsset!: ToExchangeSpecialAssetModel;
  toJSON() {
    return {
      toExchangeSpecialAsset: this.toExchangeSpecialAsset.toJSON(),
    };
  }
}
