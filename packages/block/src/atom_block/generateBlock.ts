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
import { QueneEventEmitter, EasyMap, isFlagInDev, Injectable, Inject } from "@bfchain/util";
const {
  ArgumentIllegalException,
  OutOfRangeException,
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
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
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

    if (body.height > 1) {
      /// 如果没有自定义的掉块信息，或者没有提供私钥（区块验证模式），那么就主动生成掉块信息
      if (
        /// 如果没有 roundOfflineGeneratersHashMap
        !body.roundOfflineGeneratersHashMap ||
        /// 或者说，有roundOfflineGeneratersHashMap，但是处于不可信的区块验证模式下
        !body.isTrustRoundOfflineGeneraters
      ) {
        /// 主动生成掉块信息
        const lastBlock = await this.blockHelper.forceGetBlockByHeight(body.height - 1);
        body.roundOfflineGeneratersHashMap = (
          await this.blockGeneratorCalculator.calcGenerateBlockDelegate(lastBlock, {
            toTimestamp: body.timestamp,
          })
        ).roundOfflineGeneratersHashMap;
      } else {
        body.roundOfflineGeneratersHashMap = body.roundOfflineGeneratersHashMap;
      }
    }
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
    config = this.config,
  ) {
    // 绑定magic
    block.magic = config.magic;
    // 绑定交易相关的信息
    await this.insertTransactions(block, transactions, keypair, secondKeypair, eventEmitter);

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
  ) {
    const transactionCore = this.transactionCore;
    const abortForbiddenTransaction = transactionCore.abortForbiddenTransaction;
    const VOTE = transactionCore.transactionHelper.VOTE;
    const MAX_VOTES_PER_BLOCK = this.config.maxVotesPerBlock;
    const { height, generatorPublicKey, statisticInfo: blockStatisticsInfo } = block;
    const { tpowOfWorkExemptionBlocks, maxBlockSize } = this.config;
    /**所有事件的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**区块打包的投票交易数 */
    let numberOfVotes = 0;
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
    const needTPow = height > tpowOfWorkExemptionBlocks;
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

          if (needTPow) {
            //#region 校验交易pow
            {
              const count = tranSenderCountMap.forceGet(senderId);
              /**
               * 再共识里头强制触发校验
               * 但这里的校验的实现是由外部来自定义实现的
               * 校验函数为：`transactionHelper.verifyTransactionProfOfWork`
               *
               * ## 在现有架构中，如果是`nodejs`
               * 1. 在处理交易进程中，各个进程需要各自计算当前处于第N笔交易，这个数据可以跟账户信息一同带过来，如果校验不通过，那么直接跳过这笔交易，返回到未处理交易列表中
               * 2. 在锻造区块的线程中，将`verifyTransactionProfOfWork`的事件监听并始终返回`true`即可
               *
               * ## 在`browser`平台中
               * 单线程打块，那么直接在线程中实现`verifyTransactionProfOfWork`
               */
              const checkResult = await eventEmitter.emit("verifyTransactionProfOfWork", {
                transaction: trs,
                count,
              });
              if (checkResult === undefined) {
                throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
                  prop: `verifyTransactionProfOfWork count ${count} signature ${signature} senderId ${senderId} nonce ${trs.nonce}`,
                  target: "ApplyTransactionEventEmitter",
                });
              }
              if (!checkResult) {
                throw new ArgumentFormatException(ERROR_LIST.TRAN_POW_VERIFY_FAIL);
              }
              tranSenderCountMap.set(senderId, count + 1);
            }
            //#endregion
          }
          // 保存交易
          transactions.push(tranItem);
          tranItem.height = block.height;
          /// 交易生效
          const txFactory = transactionCore.getTransactionFactoryFromType(type);
          await txFactory.beginDealTransaction(trs, eventEmitter);
          await txFactory.applyTransaction(trs, eventEmitter);
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
          blobSize += tranItem.transaction.blobSize;
          await txFactory.endDealTransaction(tranItem, eventEmitter);
          if (type === VOTE) {
            numberOfVotes++;
          }
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

      if (numberOfVotes > MAX_VOTES_PER_BLOCK) {
        throw new ConsensusException(ERROR_LIST.PROP_SHOULD_LTE_FIELD, {
          prop: `numberOfVotes ${numberOfVotes}`,
          target: "block",
          field: `maxVotesPerBlock ${MAX_VOTES_PER_BLOCK}`,
        });
      }

      const numberOfTransactions = transactions.length;
      // if (block.numberOfTransactions !== 0 && block.numberOfTransactions !== numberOfTransactions) {
      //   /// 区块的交易数对不上
      //   throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
      //     to_compare_prop: `numberOfTransactions ${block.numberOfTransactions}`,
      //     be_compare_prop: "block",
      //     to_target: `numberOfTransactions ${numberOfTransactions}`,
      //     be_target: "calculate",
      //   });
      // }
      block.transactionInfo.numberOfTransactions = numberOfTransactions;
      if (numberOfTransactions > 0) {
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
      block.blockParticipation = this.blockHelper.calcBlockParticipation({
        totalChainAsset: statisticsInfo.totalChainAsset,
        numberOfTransactions,
      });
      // 获取打块账户获得的权益
      eventEmitter.blockGeneratorEquityGetter &&
        (block.generatorEquity = await eventEmitter.blockGeneratorEquityGetter(
          block.generatorPublicKey,
        ));

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
