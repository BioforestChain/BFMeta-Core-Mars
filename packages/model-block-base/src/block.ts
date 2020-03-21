import { Message, Type, MapField, Field } from "@bfchain/protobuf";
import { parseHexToArrayBuffer, getHexFromArrayBuffer } from "@bfchain/util-encoding-hex";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import { StatisticInfoModel } from "./statistic_info";
import { cacheBytesGetter } from "@bfchain/core-model-cacher";

export type GetBlockRemarkModel<T extends Block> = T["REMARK_MODEL_TYPE"];
export type GetBlockRemarkJSON<T extends Block> = T["REMARK_JSON_TYPE"];

/**缓存trasList解析结果 */
const BUFFER_LIST_TRANSACTION_LIST_WM = new WeakMap<Uint8Array[], TransactionInBlock[]>();
const TRANSACTION_BUFFER_WM = new WeakMap<TransactionInBlock, Uint8Array>();

@Type.d("Block")
export class Block<RJ extends BFChainCore.CommonBlockRemarkJSON = BFChainCore.CommonBlockRemarkJSON>
  extends Message<Block<RJ>>
  implements BFChainCore.BlockJSON<RJ> {
  REMARK_MODEL_TYPE!: BFChainCore.RemarkJSONToModelType<RJ>;
  REMARK_JSON_TYPE!: RJ;
  remark!: BFChainCore.RemarkJSONToModelType<RJ>;
  @Field.d(1, "uint32")
  version!: number;
  /**
   * 1. 区块高度
   * 这里高度必须放在第一位，这样一个二进制数据才能快速读取出其高度，才知道对应的解析Model
   */
  @Field.d(2, "uint32")
  height!: number;
  /**
   * 2. 交易的发起者签名
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
   * 3. 锻造时间戳
   */
  @Field.d(4, "uint32")
  timestamp!: number;
  /**
   * 4. 锻造公钥
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
   * 5. 前块 signature
   */
  @Field.d(6, "string")
  previousBlockSignature!: string;
  /**
   * 6. 区块交易量
   */
  @Field.d(7, "uint32")
  numberOfTransactions!: number;
  /**
   * 7. 区块所属的链网络标识符
   */
  @Field.d(8, "string")
  magic!: string;

  /// 往后开始自由组合
  static INC = 9;

  /**区块大小 */
  @Field.d(Block.INC++, "uint32")
  blockSize!: number;
  /**交易 hash */
  @Field.d(Block.INC++, "bytes")
  payloadHashBuffer!: Uint8Array; // 交易还在传输，这个hash代表所有的交易
  get payloadHash(): string {
    return getHexFromArrayBuffer(this.payloadHashBuffer);
  }
  set payloadHash(value: string) {
    this.payloadHashBuffer = parseHexToArrayBuffer(value);
  }
  /**交易 hash 长度 */
  @Field.d(Block.INC++, "uint32")
  payloadLength!: number; // 交易还在传输，这个length代表所有的交易
  /**区块统计信息 */
  @Field.d(Block.INC++, StatisticInfoModel)
  statisticInfo!: StatisticInfoModel;
  /**区块总资产数量 */
  get totalAmount() {
    return this.statisticInfo.totalAsset || "0";
  }
  /**区块总手续费 */
  get totalFee() {
    return this.statisticInfo.totalFee || "0";
  }
  /**区块奖励 */
  @Field.d(Block.INC++, "string", "required", "0")
  reward!: string;
  /**区块交易 */
  @Field.d(Block.INC++, "bytes", "repeated")
  transactionBufferList!: Uint8Array[];
  get transactions() {
    const { transactionBufferList } = this;
    let trsList = BUFFER_LIST_TRANSACTION_LIST_WM.get(transactionBufferList);
    if (!trsList) {
      trsList = this.transactionBufferList.map(buf => {
        const trs = TransactionInBlock.decode(buf);
        TRANSACTION_BUFFER_WM.set(trs, buf);
        return trs;
      });
    }
    return trsList;
  }
  set transactions(trsList: TransactionInBlock[]) {
    const bufList = trsList.map(trs => {
      let buf = TRANSACTION_BUFFER_WM.get(trs);
      if (!buf) {
        buf = TransactionInBlock.encode(trs).finish();
        TRANSACTION_BUFFER_WM.set(trs, buf);
      }
      return buf;
    });
    BUFFER_LIST_TRANSACTION_LIST_WM.set(bufList, trsList);
    this.transactionBufferList = bufList;
  }
  @cacheBytesGetter
  getBytes(skipSignature?: boolean, skipTransactions?: boolean) {
    const props: PropertyDescriptorMap = {};
    if (skipSignature) {
      props.signatureBuffer = { value: null };
    }
    if (skipTransactions) {
      props.transactionBufferList = { value: [] };
    }
    const blockWrapper = Object.create(this, props);
    return this.$type.encode(blockWrapper).finish();
  }
  @MapField.d(Block.INC++, "uint32", "bytes")
  roundOfflineGeneratersHashMap!: BFChainCore.RoundOfflineGeneratersHashMap;
  _roundOfflineGeneratersReadonlyMap?: BFChainCore.RoundOfflineGeneratersReadonlyMap;
  get roundOfflineGeneratersReadonlyMap(): BFChainCore.RoundOfflineGeneratersReadonlyMap {
    const map = new Map<number, readonly string[]>();
    for (const rIndex in this.roundOfflineGeneratersHashMap) {
      const offlineGeneraters = this.roundOfflineGeneratersHashMap[rIndex];
      const offlineGeneraterList: string[] = offlineGeneraters.split(",");

      map.set(parseInt(rIndex), offlineGeneraterList);
    }
    return map;
  }

  toJSON() {
    const readonlyMap = this.roundOfflineGeneratersReadonlyMap;
    const roundOfflineGeneratersMap: BFChainCore.RoundOfflineGeneratersHashMap = {};
    for (const [roundOffset, offlineGeneraterList] of readonlyMap.entries()) {
      roundOfflineGeneratersMap[roundOffset] = offlineGeneraterList.join(",");
    }
    return {
      version: this.version,
      height: this.height,
      blockSize: this.blockSize,
      timestamp: this.timestamp,
      signature: this.signature,
      generatorPublicKey: this.generatorPublicKey,
      numberOfTransactions: this.numberOfTransactions,
      payloadHash: this.payloadHash,
      payloadLength: this.payloadLength,
      previousBlockSignature: this.previousBlockSignature,
      totalAmount: this.totalAmount,
      totalFee: this.totalFee,
      reward: this.reward,
      magic: this.magic,
      transactions: this.transactions.map(transaction => transaction.toJSON()),
      remark: this.remark.toJSON() as RJ,
      statisticInfo: this.statisticInfo.toJSON(),
      roundOfflineGeneratersMap,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<BFChainCore.BlockJSON<BFChainCore.GetRemarkModel<T>>>,
  ) {
    const res = super.fromObject(object as any) as Block;
    object.generatorPublicKey && (res.generatorPublicKey = object.generatorPublicKey);
    if (res !== (object as unknown)) {
      object.payloadHash && (res.payloadHash = object.payloadHash);
      const trsInBlock: TransactionInBlock[] = [];
      if (object.transactions) {
        const transactions = object.transactions;
        for (const transaction of transactions) {
          trsInBlock[trsInBlock.length] = TransactionInBlock.fromObject(transaction);
        }
      }
      res.transactions = trsInBlock;
      object.signature && (res.signature = object.signature);
    }
    const roundOfflineGeneratersHashMap = object.roundOfflineGeneratersHashMap;
    if (roundOfflineGeneratersHashMap) {
      const roundOfflineGeneratersHashMap: BFChainCore.RoundOfflineGeneratersHashMap = {};
      for (const roundOffset in roundOfflineGeneratersHashMap) {
        const offlineGeneraters = roundOfflineGeneratersHashMap[roundOffset];
        if (offlineGeneraters) {
          roundOfflineGeneratersHashMap[roundOffset] = offlineGeneraters;
        }
      }
      res.roundOfflineGeneratersHashMap = roundOfflineGeneratersHashMap;
    }
    return (res as unknown) as T;
  }
}

// type BlockObjectFromType<T> = T extends Block<infer U> ?BFChainProtobuf.ObjectFromType<Block<U>>:BFChainProtobuf.ObjectFromType<T>
