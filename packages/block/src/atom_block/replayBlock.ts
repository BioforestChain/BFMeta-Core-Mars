import type { Block } from "@bfchain/core-model-block";
import { TransactionInBlock, TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import type {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
  ChainTimeHelper,
  AccountBaseHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  OUT_OF_RANGE,
  PROP_IS_INVALID,
  NOT_MATCH,
  NOT_EXIST,
  TRAN_POW_VERIFY_FAIL,
  PROP_SHOULD_GT_FIELD,
  INVALID_BLOCK_GENERATOR,
} from "@bfchain/core-util-exception";
import {
  Exception,
  QueneEventEmitter,
  EasyMap,
  isFlagInDev,
  ModuleStroge,
  Injectable,
  Inject,
} from "@bfchain/util";
import type { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import type { CommonBlockVerify } from "./commonBlockVerify";
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
export class ReplayBlockCore<T extends Block> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;

  constructor(
    public blockHelper: BlockHelper,
    public accountBaseHelper: AccountBaseHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public milestonesHelper: MilestonesHelper,
    public asymmetricHelper: AsymmetricHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public chainTimeHelper: ChainTimeHelper,
    public blockGeneratorCalculator: BlockGeneratorCalculator,
    public moduleMap: ModuleStroge,
    public commonBlockVerify: CommonBlockVerify<T>,
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
  ) {}

  /**
   * 重放区块
   *
   * @param block
   * @param remark
   * @param transactions
   * @param publicKey
   * @param eventEmitter
   * @param config
   */
  async replayBlock(
    block: T,
    transactions: AsyncIterable<TransactionInBlock>,
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    options: BFChainCore.ReplayBlockOptions = {},
    config = this.config,
  ) {
    isDevGenerateBlock && info("begin replayBlock");
    const Function_Exception_Detail = { function: "replayBlock" };
    const { verifySignature, recordForkBlock } = options;

    if (!transactions) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "transactions",
        ...Function_Exception_Detail,
      });
    }

    isDevGenerateBlock && log("before replayBlock");
    eventEmitter && (await eventEmitter.emit("beforeGenerateBlock", block));

    if (block.height > 1) {
      const realRoundOfflineGeneratersHashMap = block.roundOfflineGeneratersHashMap;
      /// 主动生成掉块信息
      const lastBlock = await this.blockHelper.forceGetBlockByHeight(block.height - 1);
      // 校验区块的前块签名
      if (block.previousBlockSignature !== lastBlock.signature) {
        if (recordForkBlock) {
          let blockGetterHelper = options.blockGetterHelper;
          if (!blockGetterHelper) {
            blockGetterHelper = this.moduleMap.get("blockGetterHelper");
            if (!blockGetterHelper) {
              throw new NoFoundException(NOT_EXIST, {
                prop: "blockGetterHelper",
                target: "moduleStroge",
                ...Function_Exception_Detail,
              });
            }
          }
          await blockGetterHelper.chainBlockFork(block, 1);
        }
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: `previousBlockSignature ${block.previousBlockSignature}`,
          be_compare_prop: `blockSignature ${block.signature}`,
          to_target: "block",
          be_target: "blockChain lastBlock",
          ...Function_Exception_Detail,
        });
      }

      // 校验区块的时间戳
      const chainTimeHelper = this.chainTimeHelper;
      const blockSlotNumber = chainTimeHelper.getSlotNumberByTimestamp(block.timestamp);
      const calcBlockSlotNumber = chainTimeHelper.getNextSlotNumberByTimestamp(lastBlock.timestamp);
      if (blockSlotNumber < calcBlockSlotNumber) {
        throw new ConsensusException(PROP_SHOULD_GT_FIELD, {
          prop: `timestamp ${block.timestamp}`,
          target: "block",
          field: `lastBlock timestamp ${lastBlock.timestamp}`,
          ...Function_Exception_Detail,
        });
      }

      const {
        address: calcGeneratorAddress,
        roundOfflineGeneratersReadonlyMap: calcRoundOfflineGeneratersReadonlyMap,
      } = await await this.blockGeneratorCalculator.calcGenerateBlockDelegate(lastBlock, {
        toTimestamp: block.timestamp,
      });

      // 校验区块打块账户
      const generatorAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
        block.generatorPublicKey,
      );
      if (calcGeneratorAddress !== generatorAddress) {
        const currentSlot = chainTimeHelper.getSlotNumberByTimestamp(block.timestamp);
        throw new ConsensusException(INVALID_BLOCK_GENERATOR, {
          reason: `lastBlock.timestamp: ${lastBlock.timestamp} lastBlock.height: ${
            lastBlock.height
          }, block.timestamp: ${block.timestamp} curTime: ${chainTimeHelper.getTimeByTimestamp(
            block.timestamp,
          )} 该区块的打块人校验不通过，区块signature：${block.signature} height: ${
            block.height
          } 当前slot为 ${currentSlot}，当前应该由委托人 ${calcGeneratorAddress} 打块，实际是由 ${generatorAddress} 打块，校验无法通过`,
          ...Function_Exception_Detail,
        });
      }

      // 校验区块的掉线账户信息
      let mapSize = 0;
      for (const offsetRound in realRoundOfflineGeneratersHashMap) {
        const delegateList = calcRoundOfflineGeneratersReadonlyMap.get(+offsetRound);
        if (
          !delegateList ||
          delegateList.join(",") !== realRoundOfflineGeneratersHashMap[offsetRound]
        ) {
          throw new ArgumentIllegalException(NOT_MATCH, {
            to_compare_prop: "roundOfflineGeneratersHashMap",
            be_compare_prop: "roundOfflineGeneratersHashMap",
            to_target: "block",
            be_target: "calculate",
            ...Function_Exception_Detail,
          });
        }
        mapSize++;
      }
      if (mapSize !== calcRoundOfflineGeneratersReadonlyMap.size) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "roundOfflineGeneratersHashMap",
          be_compare_prop: "roundOfflineGeneratersHashMap",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }
    }

    // 校验区块体
    await this.commonBlockVerify.verifyBlockBody(block, block.remark);

    // 绑定交易相关的信息
    const transactionBufferList = await this.insertTransactionsForReplay(
      block,
      transactions,
      eventEmitter,
      options,
      config,
    );

    // 校验区块奖励数
    this.commonBlockVerify.verifyBlockReward(block);

    isDevGenerateBlock && log("before signatureBlock");
    eventEmitter && (await eventEmitter.emit("beforeSignatureBlock", block));

    // 验证区块大小
    this.commonBlockVerify.verifyBlockSize(block, transactionBufferList);

    // 校验 remark 大小
    this.commonBlockVerify.verifyBlockRemarkSize(block);

    // 校验区块签名
    verifySignature && (await this.commonBlockVerify.verifySignature(block));

    isDevGenerateBlock && log("before generatedBlock");
    eventEmitter && (await eventEmitter.emit("generatedBlock", block));
    isDevGenerateBlock && info("finish replayBlock");
    return block;
  }

  async insertTransactionsForReplay(
    block: T,
    trsGenerator: AsyncIterable<TransactionInBlock>,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter(),
    options: BFChainCore.ReplayBlockOptions,
    config = this.config,
  ) {
    const { verifySignature } = options;
    const {
      height,
      signature,
      generatorPublicKeyBuffer,
      statisticInfo: blockStatisticsInfo,
    } = block;
    const { powOfWorkExemptionBlocks } = config;
    const needTPow = height > powOfWorkExemptionBlocks;
    const abortForbiddenTransaction = this.transactionCore.abortForbiddenTransaction;
    const Function_Exception_Detail = { function: "insertTransactionsForReplay" };
    const MAX_TRANSACTION_SIZE = this.config.genesisBlock.remark.maxTransactionSize;
    /**所有交易的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**所有交易体的总字节长度 */
    let payloadLength = 0;
    /**本块交易所涉及的资产信息 */
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(height, signature);
    const transactionBufferList: Uint8Array[] = [];
    const { transactionCore, asymmetricHelper } = this;

    try {
      /**绑定统计功能到事件触发器上 */
      this.statisticsHelper.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
      /**用于快速地计算发送者的交易量 */
      const tranSenderCountMap = new EasyMap<string, number>((address) => 0);
      isDevGenerateBlock && info("begin insertTransactionsForReplay");
      for await (const tranItem of trsGenerator) {
        isDevGenerateBlock &&
          log("insert transaction: %d / %d", tranItem.index + 1, block.numberOfTransactions);
        try {
          if (tranItem.index >= MAX_TRANSACTION_SIZE) {
            throw new OutOfRangeException(OUT_OF_RANGE, {
              variable: "transactions",
              index: tranItem.index,
              maxLength: MAX_TRANSACTION_SIZE,
              ...Function_Exception_Detail,
            });
          }
          const trs = tranItem.transaction;
          if (!this.commonBlockVerify.canInsertTransaction(trs.type)) {
            const trsName = TRANSACTION_TYPES_MAP.VK.get(
              TRANSACTION_TYPES_MAP.trsTypeToV(trs.type),
            );
            const exp = new ConsensusException("Disabled insert {trsName} Transaction", {
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
              const count = tranSenderCountMap.forceGet(trs.senderId);
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
                throw new NoFoundException(NOT_EXIST, {
                  prop: "verifyTransactionProfOfWork",
                  target: "ApplyTransactionEventEmitter",
                  function: "insertTransactionsForReplay",
                });
              }
              if (!checkResult) {
                throw new ArgumentFormatException(TRAN_POW_VERIFY_FAIL, {
                  function: "insertTransactionsForReplay",
                });
              }
              tranSenderCountMap.set(trs.senderId, count + 1);
            }
            //#endregion
          }
          // 保存交易
          if (transactionBufferList.length !== tranItem.index) {
            throw new ArgumentIllegalException(NOT_MATCH, {
              to_compare_prop: "index",
              be_compare_prop: "index",
              to_target: "transactions",
              be_target: "calculate",
              ...Function_Exception_Detail,
            });
          }
          transactionBufferList.push(tranItem.getBytes());

          /// 交易生效
          const txFactory = transactionCore.getTransactionFactoryFromType(trs.type);
          await txFactory.applyTransaction(trs, eventEmitter);
          // 在apply之后，获取变更记录
          eventEmitter.assetChangesGetter &&
            (tranItem.transactionAssetChanges = await eventEmitter.assetChangesGetter(tranItem));
          // 获取是发送者的第几比交易
          eventEmitter.numberOfSenderTranGetter &&
            (tranItem.numberOfSenderTransactions = await eventEmitter.numberOfSenderTranGetter(
              tranItem,
            ));
          const transactionAssetChanges = tranItem.transactionAssetChanges;
          for (const transactionAssetChange of transactionAssetChanges) {
            if (BigInt(transactionAssetChange.assetBalance) < BigInt(0)) {
              throw new ArgumentIllegalException(PROP_IS_INVALID, {
                prop: "assetBalance",
                target: "transactionAssetChanges",
                function: "insertTransactionsForReplay",
              });
            }
          }
          // 校验TIB签名
          if (
            verifySignature &&
            !(await asymmetricHelper.detachedVeriy(
              tranItem.getBytes(true),
              tranItem.signatureBuffer,
              generatorPublicKeyBuffer,
            ))
          ) {
            throw new ArgumentFormatException(`Invalid transactionInBlock: %O`, tranItem.toJSON());
          }
          Object.freeze(tranItem);
          // 生产交易二进制数据
          const tranItemBinary = tranItem.getBytes();
          // 更新hash
          payloadHash.update(tranItemBinary);
          // 更新总字节长度
          payloadLength += tranItemBinary.length;
          // if (payloadLength > this.config.maxPayloadLength * 0.95) {
          //   await eventEmitter.emit("nearMaxPayloadLength", { payloadLength });
          // }
          eventEmitter.emit("endDealTransaction", { transactionInBlock: tranItem });
        } catch (err) {
          if (err instanceof Error || err instanceof Exception) {
            const res = await eventEmitter.emit("error", {
              err,
              type: "",
              transactionInBlock: tranItem,
            });
            if (res && res.continue) {
              continue;
            }
          }
          throw err;
        }
      }
      isDevGenerateBlock && info("finish insertTransactionsForReplay");

      if (
        !this.baseHelper.isArrayEqual(
          blockStatisticsInfo.getBytes(),
          statisticsInfo.toModel().getBytes(),
        )
      ) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "statisticsInfo",
          be_compare_prop: "statisticsInfo",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      const stotalAmount = statisticsInfo.totalAsset;
      const stotalFee = statisticsInfo.totalFee;
      if (BigInt(block.totalAmount) !== stotalAmount) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "totalAmount",
          be_compare_prop: "totalAmount",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      if (BigInt(block.totalFee) !== stotalFee) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "totalFee",
          be_compare_prop: "totalFee",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      if (block.payloadLength !== payloadLength) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "payloadLength",
          be_compare_prop: "payloadLength",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      const payloadHashHex = await payloadHash.digest("hex");
      if (block.payloadHash !== payloadHashHex) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "payloadHashHex",
          be_compare_prop: "payloadHashHex",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      const numberOfTransactions = transactionBufferList.length;
      if (block.numberOfTransactions !== numberOfTransactions) {
        /// 区块的交易数对不上
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "numberOfTransactions",
          be_compare_prop: "numberOfTransactions",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      const blockParticipation = this.blockHelper.calcBlockParticipation({
        totalAccount: statisticsInfo.totalAccount,
        totalChainAsset: statisticsInfo.totalChainAsset,
        totalFee: statisticsInfo.totalFee,
        numberOfTransactions,
      });
      if (block.remark.blockParticipation !== blockParticipation) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: "blockParticipation",
          be_compare_prop: "blockParticipation",
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      /// 临时恢复的操作，但会曝出警告
      if (eventEmitter.has("finishedDealTransactions")) {
        warn(
          "@deprecated",
          `logic "finishedDealTransactions" 事件已经被遗弃，请及时更新并升级代码`,
        );
        await eventEmitter.emit("finishedDealTransactions", block);
      }
    } finally {
      statisticsInfo.unref(block.signature);
    }

    return transactionBufferList;
  }
}
