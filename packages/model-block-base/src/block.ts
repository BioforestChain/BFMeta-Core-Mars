import { Message, Type, MapField, Field, Long } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import { StatisticInfoModel } from "./statistic_info";
import { EasyWeakMap } from "@bfchain/util-extends-map";
import { StringKeyMap } from "@bfchain/core-model-common";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";
const TrsRemarkMapWM = new EasyWeakMap((block: Block) => new StringKeyMap(block.remark));

/**缓存trasList解析结果 */
const BUFFER_LIST_TRANSACTION_LIST_WM = new WeakMap<Uint8Array[], TransactionInBlock[]>();
const TRANSACTION_BUFFER_WM = new WeakMap<TransactionInBlock, Uint8Array>();

@Type.d("BlockVersionReader")
export class BlockVersionReader extends Message<BlockVersionReader> {
  @Field.d(1, "uint32")
  version!: number;
}

@Type.d("BlockTransactionInfo")
export class BlockTransactionInfoModel
  extends Message<BlockTransactionInfoModel>
  implements BFChainCore.BlockTransactionInfoJSON
{
  static INC = 1;

  /**交易起始索引 */
  @Field.d(BlockTransactionInfoModel.INC++, "uint32")
  startTindex!: number;
  /**偏移量 */
  @Field.d(BlockTransactionInfoModel.INC++, "uint32")
  offset!: number;
  /**区块块交易量 */
  @Field.d(BlockTransactionInfoModel.INC++, "uint32")
  numberOfTransactions!: number;
  /**交易 hash */
  @Field.d(BlockTransactionInfoModel.INC++, "bytes")
  payloadHashBuffer!: Uint8Array; // 交易还在传输，这个hash代表所有的交易
  get payloadHash(): string {
    return getHexFromArrayBuffer(this.payloadHashBuffer);
  }
  set payloadHash(value: string) {
    this.payloadHashBuffer = parseHexToArrayBuffer(value);
  }
  /**交易 hash 长度 */
  @Field.d(BlockTransactionInfoModel.INC++, "uint32")
  payloadLength!: number;
  /**交易携带的 blob 长度 */
  @Field.d(BlockTransactionInfoModel.INC++, "uint64")
  blobSizeLong!: Long;
  get blobSize() {
    return this.blobSizeLong.toNumber();
  }
  set blobSize(v) {
    this.blobSizeLong = Long.fromNumber(v, true);
  }
  /**区块统计信息 */
  @Field.d(BlockTransactionInfoModel.INC++, StatisticInfoModel)
  statisticInfo!: StatisticInfoModel;
  /**区块总资产数量 */
  get totalAmount() {
    return this.statisticInfo.totalAsset || "0";
  }
  /**区块总手续费 */
  get totalFee() {
    return this.statisticInfo.totalFee || "0";
  }
  /**区块交易 */
  @Field.d(BlockTransactionInfoModel.INC++, "bytes", "repeated")
  transactionInBlockBufferList!: Uint8Array[];
  get transactionInBlocks() {
    const { transactionInBlockBufferList } = this;
    let trsInBLockList = BUFFER_LIST_TRANSACTION_LIST_WM.get(transactionInBlockBufferList);
    if (!trsInBLockList) {
      trsInBLockList = this.transactionInBlockBufferList.map((buf) => {
        const trs = TransactionInBlock.decode(buf);
        TRANSACTION_BUFFER_WM.set(trs, buf);
        return trs;
      });
    }
    return trsInBLockList;
  }
  set transactionInBlocks(trsInBLockList: TransactionInBlock[]) {
    const bufList = trsInBLockList.map((trs) => {
      let buf = TRANSACTION_BUFFER_WM.get(trs);
      if (!buf) {
        buf = TransactionInBlock.encode(trs).finish();
        TRANSACTION_BUFFER_WM.set(trs, buf);
      }
      return buf;
    });
    BUFFER_LIST_TRANSACTION_LIST_WM.set(bufList, trsInBLockList);
    this.transactionInBlockBufferList = bufList;
  }
  toJSON() {
    const res: BFChainCore.BlockTransactionInfoJSON = {
      startTindex: this.startTindex,
      offset: this.offset,
      numberOfTransactions: this.numberOfTransactions,
      payloadHash: this.payloadHash,
      payloadLength: this.payloadLength,
      blobSize: this.blobSize,
      totalAmount: this.totalAmount,
      totalFee: this.totalFee,
      transactionInBlocks: this.transactionInBlocks.map((trsInBlock) => trsInBlock.toJSON()),
      statisticInfo: this.statisticInfo.toJSON(),
    };

    return res;
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BlockTransactionInfoModel>,
  ) {
    const res = super.fromObject(object as any) as BlockTransactionInfoModel;
    if (res !== (object as unknown)) {
      object.blobSize !== undefined && (res.blobSize = object.blobSize);
      object.payloadHash && (res.payloadHash = object.payloadHash);
      const trsInBlocks: TransactionInBlock[] = [];
      if (object.transactionInBlocks) {
        const transactionInBlocks = object.transactionInBlocks;
        for (const transaction of transactionInBlocks) {
          trsInBlocks[trsInBlocks.length] = TransactionInBlock.fromObject(transaction);
        }
      }
      res.transactionInBlocks = trsInBlocks;
    }
    return res as unknown as T;
  }
}

@Type.d("Block")
export class Block<AJ extends object = object>
  extends Message<Block<AJ>>
  implements BFChainCore.BlockJSON<AJ>
{
  ASSET_MODEL_TYPE!: BFChainCore.AssetJSONToModelType<AJ>;
  ASSET_JSON_TYPE!: AJ;
  asset!: BFChainCore.AssetJSONToModelType<AJ>;
  @Field.d(1, "uint32")
  version!: number;
  /**
   * 2. 区块高度
   * 这里高度必须放在第一位，这样一个二进制数据才能快速读取出其高度，才知道对应的解析Model
   */
  @Field.d(2, "uint32")
  height!: number;
  /**
   * 3. 交易的发起者签名
   */
  @Field.d(3, "bytes")
  signatureBuffer!: Uint8Array;
  get signature(): string {
    return getHexFromArrayBuffer(this.signatureBuffer);
  }
  set signature(value: string) {
    this.signatureBuffer = parseHexToArrayBuffer(value);
  }

  /**
   * 4. 锻造时间戳
   */
  @Field.d(4, "uint32")
  timestamp!: number;
  /**
   * 5. 锻造公钥
   */
  @Field.d(5, "bytes")
  generatorPublicKeyBuffer!: Uint8Array;
  get generatorPublicKey(): string {
    return getHexFromArrayBuffer(this.generatorPublicKeyBuffer);
  }
  set generatorPublicKey(value: string) {
    this.generatorPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  /**
   * 6. 前块 signature
   */
  @Field.d(6, "string")
  previousBlockSignature!: string;
  /**
   * 7. 区块所属的链网络标识符
   */
  @Field.d(7, "string")
  magic!: string;
  /**
   * 8. 锻造二次公钥
   */
  @Field.d(8, "bytes", "optional")
  /**交易的发起账户公钥 */
  generatorSecondPublicKeyBuffer?: Uint8Array;
  public get generatorSecondPublicKey() {
    return (
      (this.generatorSecondPublicKeyBuffer &&
        getHexFromArrayBuffer(this.generatorSecondPublicKeyBuffer)) ||
      undefined
    );
  }
  public set generatorSecondPublicKey(value: string | undefined) {
    /// 空字符串也当成undefined处理
    this.generatorSecondPublicKeyBuffer = parseHexToArrayBuffer(value);
  }
  /**
   * 9. 交易的发起者二次签名
   */
  @Field.d(9, "bytes", "optional")
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
  /// 往后开始自由组合
  static INC = 10;
  /**区块大小 */
  @Field.d(Block.INC++, "uint32")
  blockSize!: number;
  /**交易的备注信息 */
  @MapField.d(Block.INC++, "string", "string")
  remark!: { [key: string]: string };
  get remarkMap() {
    // 直接 return TrsRemarkMapWM.forceGet(this) 类型识别错误
    const remarkMap = TrsRemarkMapWM.forceGet(this);
    return remarkMap;
  }
  /**区块奖励 */
  @Field.d(Block.INC++, "string", "required", "0")
  reward!: string;

  /**区块事件信息 */
  @Field.d(Block.INC++, BlockTransactionInfoModel)
  transactionInfo!: BlockTransactionInfoModel;
  /**区块事件起始索引 */
  get startTindex() {
    return this.transactionInfo.startTindex;
  }
  /**区块事件结束索引 */
  get offset() {
    return this.transactionInfo.offset;
  }
  /**区块事件量 */
  get numberOfTransactions() {
    return this.transactionInfo.numberOfTransactions;
  }
  /**区块事件 hash */
  get payloadHash() {
    return this.transactionInfo.payloadHash;
  }
  /**区块事件 hash 长度 */
  get payloadLength() {
    return this.transactionInfo.payloadLength;
  }
  /**区块事件携带的 blob 长度 */
  get blobSize() {
    return this.transactionInfo.blobSize;
  }
  /**区块事件总权益量 */
  get totalAmount() {
    return this.transactionInfo.totalAmount;
  }
  /**区块事件总手续费 */
  get totalFee() {
    return this.transactionInfo.totalFee;
  }
  /**区块事件统计信息 */
  get statisticInfo() {
    return this.transactionInfo.statisticInfo;
  }
  /**区块事件 */
  get transactionBufferList() {
    return this.transactionInfo.transactionInBlockBufferList;
  }
  get transactions() {
    return this.transactionInfo.transactionInBlocks;
  }

  @cacheBytesGetter
  getBytes(
    skipSignature?: boolean,
    skipSignSignature?: boolean,
    skipOrCustomTransactions?: boolean | Uint8Array[],
  ) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      props.signatureBuffer = { value: null };
    }
    if (skipSignSignature) {
      props.signSignatureBuffer = { value: null };
    }
    if (skipOrCustomTransactions) {
      const transactionInfo = this.transactionInfo;
      if (skipOrCustomTransactions === true) {
        props.transactionInfo = {
          value: {
            startTindex: transactionInfo.startTindex,
            offset: transactionInfo.offset,
            numberOfTransactions: transactionInfo.numberOfTransactions,
            payloadHashBuffer: transactionInfo.payloadHashBuffer,
            payloadLength: transactionInfo.payloadLength,
            /// 这 protobuf 秀的我头皮发麻 🌾
            blobSizeLong: transactionInfo.blobSizeLong,
            statisticInfo: transactionInfo.statisticInfo,
            transactionInBlockBufferList: [],
            totalAmount: transactionInfo.totalAmount,
            totalFee: transactionInfo.totalFee,
          },
        };
      } else {
        props.transactionInfo = {
          value: {
            startTindex: transactionInfo.startTindex,
            offset: transactionInfo.offset,
            numberOfTransactions: transactionInfo.numberOfTransactions,
            payloadHashBuffer: transactionInfo.payloadHashBuffer,
            payloadLength: transactionInfo.payloadLength,
            /// 这 protobuf 秀的我头皮发麻 🌾
            blobSizeLong: transactionInfo.blobSizeLong,
            statisticInfo: transactionInfo.statisticInfo,
            transactionInBlockBufferList: skipOrCustomTransactions,
            totalAmount: transactionInfo.totalAmount,
            totalFee: transactionInfo.totalFee,
          },
        };
      }
    }
    const blockWrapper = Object.create(this, props);
    return this.$type.encode(blockWrapper).finish();
  }

  toJSON() {
    const res: BFChainCore.BlockJSON<AJ> = {
      version: this.version,
      height: this.height,
      blockSize: this.blockSize,
      timestamp: this.timestamp,
      signature: this.signature,
      generatorPublicKey: this.generatorPublicKey,
      previousBlockSignature: this.previousBlockSignature,
      reward: this.reward,
      magic: this.magic,
      remark: this.remark,
      asset: this.asset.toJSON(),
      transactionInfo: this.transactionInfo.toJSON(),
    };

    this.generatorSecondPublicKey && (res.generatorSecondPublicKey = this.generatorSecondPublicKey);
    this.signSignature && (res.signSignature = this.signSignature);

    return res;
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<
      BFChainCore.BlockJSON<BFChainCore.GetBlockMessageAssetModel<T>>
    >,
  ) {
    const res = super.fromObject(object as any) as Block;
    object.generatorPublicKey && (res.generatorPublicKey = object.generatorPublicKey);
    object.generatorSecondPublicKey &&
      (res.generatorSecondPublicKey = object.generatorSecondPublicKey);
    object.signature && (res.signature = object.signature);
    object.signSignature && (res.signSignature = object.signSignature);
    return res as unknown as T;
  }
}

// type BlockObjectFromType<T> = T extends Block<infer U> ?BFChainProtobuf.ObjectFromType<Block<U>>:BFChainProtobuf.ObjectFromType<T>
