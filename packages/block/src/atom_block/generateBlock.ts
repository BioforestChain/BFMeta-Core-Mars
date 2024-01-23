import type { Block } from "@bfchain/core-model-block";
import { CommonBlockVerify } from "./commonBlockVerify";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import { TransactionInBlock, TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  QueneEventEmitter,
  EasyMap,
  isFlagInDev,
  Injectable,
  Inject,
  ModuleStroge,
} from "@bfchain/util";
import { BlockUtils } from "./blockUtils";
const {
  ArgumentIllegalException,
  ArgumentFormatException,
  NoFoundException,
  log,
  info,
  warn,
  ConsensusException,
} = CoreExceptionGenerator("CONTROLLER", "_blockbase");
const isDevGenerateBlock = isFlagInDev("generateBlock");

@Injectable()
export class GenerateBlockCore<T extends Block> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;

  constructor(
    public blockHelper: BlockHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public asymmetricHelper: AsymmetricHelper,
    public blockGeneratorCalculator: BlockGeneratorCalculator,
    public commonBlockVerify: CommonBlockVerify<T>,
    public blockUtils: BlockUtils,
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
    public moduleMap: ModuleStroge,
  ) {}

  /**
   * 锻造区块前半部分
   *
   * @param body
   * @param asset
   * @param transactions
   * @param eventEmitter
   */
  async generateBlockBefore(
    body: BFChainCore.BlockBody,
    asset: BFChainCore.GetBlockAssetJSON<T>,
    transactions: AsyncIterable<TransactionInBlock>,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
  ) {
    if (!body) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "body",
      });
    }
    if (!asset) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "asset",
      });
    }
    if (!transactions) {
      throw new ArgumentIllegalException(ERROR_LIST.PARAM_LOST, {
        param: "transactions",
      });
    }

    isDevGenerateBlock && log("before generateBlock");
    eventEmitter &&
      (await this._wrapBlockError(
        eventEmitter.emit("beforeGenerateBlock", body),
        eventEmitter,
        "beforeGenerateBlock",
        body,
      ));
  }

  private async _wrapBlockError<R>(
    task: Promise<R> | undefined | void,
    eventEmitter: BFChainCore.GenerateBlockEventEmitter,
    type: string,
    blockBody: BFChainCore.Block | BFChainCore.BlockBody,
  ) {
    if (task) {
      try {
        return await task;
      } catch (error) {
        await eventEmitter.emit("blockError", {
          type: `generateBlock/${type}`,
          error,
          blockBody,
        });
      }
    }
  }
  /**
   * 锻造区块后半部分
   *
   * @param block
   * @param transactions
   * @param keypair
   * @param eventEmitter
   * @param config
   */
  async generateBlockAfter(
    block: T,
    transactions: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey: Buffer;
    },
    secondKeypair?: {
      publicKey: Buffer;
      secretKey: Buffer;
    },
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
    config = this.config,
  ) {
    // 绑定magic
    block.magic = config.magic;
    // 绑定交易相关的信息
    await this.insertTransactions(
      block,
      transactions,
      keypair,
      secondKeypair,
      eventEmitter,
      transactionGetterHelper,
    );

    isDevGenerateBlock && log("before signatureBlock");
    eventEmitter &&
      (await this._wrapBlockError(
        eventEmitter.emit("beforeSignatureBlock", block),
        eventEmitter,
        "beforeSignatureBlock",
        block,
      ));

    // 计算并赋值区块大小
    block.blockSize = this.commonBlockVerify.calcBlockSize(block);

    // 进行区块签名，因为已经有 payloadHash，所以这里可以跳过交易
    block.signatureBuffer = await this.asymmetricHelper.detachedSign(
      block.getBytes(true, true, true),
      keypair.secretKey,
    );

    // 进行区块二次签名，因为已经有 payloadHash，所以这里可以跳过交易
    if (secondKeypair) {
      block.signSignatureBuffer = await this.asymmetricHelper.detachedSign(
        block.getBytes(false, true, true),
        secondKeypair.secretKey,
      );
    }

    isDevGenerateBlock && log("before generatedBlock");
    eventEmitter &&
      (await this._wrapBlockError(
        eventEmitter.emit("generatedBlock", block),
        eventEmitter,
        "generatedBlock",
        block,
      ));

    return block;
  }

  /**
   * 绑定交易相关的信息
   * 包括交易体、统计金额、校验hash、总长度
   *
   * @param body
   * @param commonBlockRemark
   */
  private async insertTransactions(
    block: T,
    trsGenerator: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey: Buffer;
    },
    secondKeypair?: {
      publicKey: Buffer;
      secretKey: Buffer;
    },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter(),
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    if (!transactionGetterHelper) {
      transactionGetterHelper = this.moduleMap.get("transactionGetterHelper");
      if (!transactionGetterHelper) {
        throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
          prop: "transactionGetterHelper",
          target: "moduleStroge",
        });
      }
    }
    const { transactionCore, blockUtils } = this;
    const abortForbiddenTransaction = transactionCore.abortForbiddenTransaction;
    const { height, generatorPublicKey, statisticInfo: blockStatisticsInfo } = block;
    const { maxBlockSize } = this.config;
    let maxBlockBlobSize = this.config.maxBlockBlobSize;
    if (eventEmitter.customMaxBlobSizeGetter) {
      const customMaxBlobSize = eventEmitter.customMaxBlobSizeGetter();
      maxBlockBlobSize =
        customMaxBlobSize < maxBlockBlobSize ? customMaxBlobSize : maxBlockBlobSize;
    }
    /**所有事件的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**区块打包的事件的总字节长度 */
    let payloadLength = 0;
    /**区块打包的事件携带的 blob 长度 */
    let blobSize = 0;
    /**本块事件所涉及的资产信息 */
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(
      eventEmitter.taskname || `core-generate-${height}`,
      generatorPublicKey,
      blockStatisticsInfo,
    );
    const transactions: TransactionInBlock[] = [];
    const trsSet = new Set<string>();
    try {
      /**绑定统计功能到事件触发器上 */
      this.statisticsHelper.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
      /**用于快速地计算发送者的交易量 */
      const tranSenderCountMap = new EasyMap<string, number>((address) => 0);
      isDevGenerateBlock && info("begin insertTransactions");
      for await (const tranItem of trsGenerator) {
        // 获取交易在链上的索引
        eventEmitter.tIndexGetter && (tranItem.tIndex = await eventEmitter.tIndexGetter(tranItem));
        isDevGenerateBlock &&
          log("insert transaction: %d / %d", tranItem.tIndex, block.numberOfTransactions);
        try {
          const trs = tranItem.transaction;
          const { type, senderId, signature } = trs;
          if (trsSet.has(signature)) {
            throw new ConsensusException(ERROR_LIST.SHOULD_NOT_DUPLICATE, {
              prop: `transaction with signature ${signature}`,
              target: `block with height ${block.height}`,
            });
          }
          trsSet.add(signature);
          if (!this.commonBlockVerify.canInsertTransaction(type)) {
            const trsName = TRANSACTION_TYPES_MAP.VK.get(TRANSACTION_TYPES_MAP.trsTypeToV(type));
            const exp = new ConsensusException(ERROR_LIST.DISABLED_INSERT_TRANSACTION, {
              trsName,
            });
            if (abortForbiddenTransaction) {
              throw exp;
            }
            warn(exp);
          }
          // 保存交易
          transactions.push(tranItem);
          tranItem.height = block.height;
          /// 交易生效
          const txFactory = transactionCore.getTransactionFactoryFromType(type);
          await txFactory.beginDealTransaction(trs, eventEmitter);
          await blockUtils.applyTransaction(eventEmitter, transactionGetterHelper, trs);
          // 在 apply 之后，获取权益资产信息
          eventEmitter.assetPrealnumGetter &&
            (tranItem.assetPrealnum = await eventEmitter.assetPrealnumGetter(tranItem));
          const assetPrealnum = tranItem.assetPrealnum;
          if (assetPrealnum) {
            const trsInfo = `height ${tranItem.height} tIndex ${
              tranItem.tIndex
            } type ${type} senderId ${senderId} ${
              trs.recipientId ? " recipientId " + trs.recipientId : " "
            } signature ${tranItem.transaction.signature}`;
            const { remainAssetPrealnum, frozenMainAssetPrealnum } = assetPrealnum;
            if (BigInt(remainAssetPrealnum) < BigInt(0)) {
              throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
                prop: `remainAssetPrealnum ${remainAssetPrealnum}`,
                target: "assetPrealnum",
                detail: trsInfo,
              });
            }
            if (BigInt(frozenMainAssetPrealnum) < BigInt(0)) {
              throw new ArgumentIllegalException(ERROR_LIST.PROP_IS_INVALID, {
                prop: `frozenMainAssetPrealnum ${frozenMainAssetPrealnum}`,
                target: "assetPrealnum",
                detail: trsInfo,
              });
            }
          }

          // 对 TIB 进行签名
          tranItem.signatureBuffer = await this.asymmetricHelper.detachedSign(
            tranItem.getBytes(true, true),
            keypair.secretKey,
          );
          // 对 TIB 进行安全签名
          if (secondKeypair) {
            tranItem.signSignatureBuffer = await this.asymmetricHelper.detachedSign(
              tranItem.getBytes(false, true),
              secondKeypair.secretKey,
            );
          }
          Object.freeze(tranItem);
          // 生产交易二进制数据
          const tranItemBinary = tranItem.getBytes();
          // 更新hash
          payloadHash.update(tranItemBinary);
          // 更新总字节长度
          payloadLength += tranItemBinary.length;
          if (payloadLength > maxBlockSize * 0.95) {
            await eventEmitter.emit("nearMaxPayloadLength", { payloadLength });
          }
          // 更新 blob 长度
          blobSize += tranItem.transaction.getBlobSize();
          if (blobSize > maxBlockBlobSize * 0.95) {
            await eventEmitter.emit("nearMaxBlobSize", { blobSize });
          }
          await txFactory.endDealTransaction(tranItem, eventEmitter);
        } catch (error) {
          const res = await eventEmitter.emit("error", {
            error,
            type: "genesisBlock",
            transactionInBlock: tranItem,
          });
          if (res && res.continue) {
            continue;
          }
          throw error;
        }
      }
      isDevGenerateBlock && info("finish insertTransactions");

      const offset = transactions.length;
      block.transactionInfo.offset = offset;
      if (offset > 0) {
        block.transactionInfo.startTindex = transactions[0].tIndex;
      } else {
        if (!eventEmitter.startTindexGetter) {
          throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
            prop: "startTindexGetter",
            target: "eventEmitter",
          });
        }
        block.transactionInfo.startTindex = await eventEmitter.startTindexGetter();
      }
      block.transactionInfo.statisticInfo = statisticsInfo.toModel();
      block.transactionInfo.payloadHashBuffer = await payloadHash.digest();
      block.transactionInfo.payloadLength = payloadLength;
      block.transactionInfo.blobSize = blobSize;
      block.transactionInfo.transactionInBlocks = transactions;
      const numberOfTransactions = block.transactionInfo.statisticInfo.numberOfTransactions;
      block.transactionInfo.numberOfTransactions = numberOfTransactions;

      /// 临时恢复的操作，但会曝出警告
      if (eventEmitter.has("finishedDealTransactions")) {
        warn(
          "@deprecated",
          `logic "finishedDealTransactions" 事件已经被遗弃，请及时更新并升级代码`,
        );
        await eventEmitter.emit("finishedDealTransactions", block);
      }
    } finally {
      statisticsInfo.unref(generatorPublicKey);
    }

    return block;
  }
}
