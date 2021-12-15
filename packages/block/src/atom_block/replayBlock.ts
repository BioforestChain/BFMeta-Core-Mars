import type { Block } from "@bfchain/core-model-block";
import { TransactionInBlock, TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
  ChainTimeHelper,
  AccountBaseHelper,
  TransactionHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  OUT_OF_RANGE,
  NOT_MATCH,
  NOT_EXIST,
  TRAN_POW_VERIFY_FAIL,
  PROP_SHOULD_GT_FIELD,
  INVALID_BLOCK_GENERATOR,
  SHOULD_NOT_INCLUDE,
  PROP_IS_REQUIRE,
  NOT_FOUND,
  SHOULD_NOT_DUPLICATE,
  PROP_SHOULD_LTE_FIELD,
} from "@bfchain/core-util-exception";
import {
  QueneEventEmitter,
  EasyMap,
  isFlagInDev,
  ModuleStroge,
  Injectable,
  Inject,
} from "@bfchain/util";
import { BLOCK_FORK_CAUSE } from "@bfchain/core-model";
import { BlockGeneratorCalculator } from "./blockGeneratorCalculator";
import { CommonBlockVerify } from "./commonBlockVerify";
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
    public transactionHelper: TransactionHelper,
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
        eventEmitter.emit("blockError", {
          type: `replayBlock/${type}`,
          error,
          blockBody,
        });
      }
    }
  }
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
    eventEmitter &&
      (await this._wrapBlockError(
        eventEmitter.emit("beforeGenerateBlock", block),
        eventEmitter,
        "beforeGenerateBlock",
        block,
      ));

    this.blockHelper.verifyBlockVersion(block, config);

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
          await blockGetterHelper.chainBlockFork(
            block,
            BLOCK_FORK_CAUSE.DIFFERENT_PRE_BLOCK_SIGNATURE,
          );
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
      } = await this.blockGeneratorCalculator.calcGenerateBlockDelegate(lastBlock, {
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
          to_compare_prop: `roundOfflineGeneratersHashMap size ${mapSize}`,
          be_compare_prop: `roundOfflineGeneratersHashMap size ${calcRoundOfflineGeneratersReadonlyMap.size}`,
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }
    }

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
    eventEmitter &&
      (await this._wrapBlockError(
        eventEmitter.emit("beforeSignatureBlock", block),
        eventEmitter,
        "beforeSignatureBlock",
        block,
      ));

    // 验证区块大小
    this.commonBlockVerify.verifyBlockSize(block, transactionBufferList);

    // 校验区块签名
    verifySignature && (await this.commonBlockVerify.verifySignature(block));

    isDevGenerateBlock && log("before generatedBlock");
    eventEmitter &&
      (await this._wrapBlockError(
        eventEmitter.emit("generatedBlock", block),
        eventEmitter,
        "generatedBlock",
        block,
      ));
    isDevGenerateBlock && info("finish replayBlock");

    return block;
  }

  private async insertTransactionsForReplay(
    block: T,
    trsGenerator: AsyncIterable<TransactionInBlock>,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter(),
    options: BFChainCore.ReplayBlockOptions,
    config = this.config,
  ) {
    const { verifySignature, skipVerifyStatisticInfo, skipVerifyParticipation } = options;
    const {
      height,
      signature,
      generatorPublicKeyBuffer,
      statisticInfo: blockStatisticsInfo,
    } = block;
    const { tpowOfWorkExemptionBlocks } = config;
    const needTPow = height > tpowOfWorkExemptionBlocks;
    const Function_Exception_Detail = { function: "insertTransactionsForReplay" };
    const MAX_VOTES_PER_BLOCK = this.config.maxVotesPerBlock;
    const MAX_TRANSACTION_SIZE = this.config.maxTransactionSize;
    /**所有交易的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**区块打包的投票交易数 */
    let numberOfVotes = 0;
    /**所有交易体的总字节长度 */
    let payloadLength = 0;
    /**本块交易所涉及的资产信息 */
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(
      eventEmitter.taskname || `core-replay-${height}`,
      signature,
    );
    const transactionBufferList: Uint8Array[] = [];
    const { transactionCore, asymmetricHelper, transactionHelper, baseHelper } = this;
    const { VOTE, GRAB_ASSET, SIGN_FOR_ASSET } = transactionHelper;
    const abortForbiddenTransaction = transactionCore.abortForbiddenTransaction;
    const trsSet = new Set();

    if (!eventEmitter.assetChangesGetter) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "assetChangesGetter",
        target: "eventEmitter",
        ...Function_Exception_Detail,
      });
    }

    if (!eventEmitter.assetPrealnumGetter) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "assetPrealnumGetter",
        target: "eventEmitter",
        ...Function_Exception_Detail,
      });
    }

    if (!eventEmitter.numberOfSenderTranGetter) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "numberOfSenderTranGetter",
        target: "eventEmitter",
        ...Function_Exception_Detail,
      });
    }

    if (!eventEmitter.blockGeneratorEquityGetter) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGeneratorEquityGetter",
        target: "eventEmitter",
        ...Function_Exception_Detail,
      });
    }

    // 获取打块账户获得的权益
    const generatorEquity = await eventEmitter.blockGeneratorEquityGetter(block.generatorPublicKey);
    if (block.generatorEquity !== generatorEquity) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `generatorEquity ${block.generatorEquity}`,
        be_compare_prop: `generatorEquity ${generatorEquity}`,
        to_target: "block",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }

    const trSignWithIndex = new Map<string, BFChainCore.Transaction[]>();
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
          const { type, senderId, storageValue, signature } = trs;
          if (trsSet.has(signature)) {
            throw new ConsensusException(SHOULD_NOT_DUPLICATE, {
              prop: `transaction with signature ${signature}`,
              target: `block with height ${block.height}`,
              ...Function_Exception_Detail,
            });
          }
          trsSet.add(signature);
          if (!this.commonBlockVerify.canInsertTransaction(type)) {
            const trsName = TRANSACTION_TYPES_MAP.VK.get(TRANSACTION_TYPES_MAP.trsTypeToV(type));
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
              tranSenderCountMap.set(senderId, count + 1);
            }
            //#endregion
          }
          // 保存交易
          if (transactionBufferList.length !== tranItem.index) {
            throw new ArgumentIllegalException(NOT_MATCH, {
              to_compare_prop: `index ${transactionBufferList.length}`,
              be_compare_prop: `index ${tranItem.index}`,
              to_target: "transactions",
              be_target: "calculate",
              ...Function_Exception_Detail,
            });
          }
          transactionBufferList.push(tranItem.getBytes());
          // 验证块内是否存在不合法交易
          if (storageValue && (type === GRAB_ASSET || type === SIGN_FOR_ASSET)) {
            const trsArray = trSignWithIndex.get(storageValue);
            if (trsArray) {
              for (const tr of trsArray) {
                if (tr.senderId === senderId) {
                  throw new ConsensusException(SHOULD_NOT_INCLUDE, {
                    prop: `Transactions`,
                    target: `block with height ${height}`,
                    value: `transaction with storageValue ${storageValue}`,
                    ...Function_Exception_Detail,
                  });
                }
              }
              trsArray.push(trs);
            } else {
              trSignWithIndex.set(storageValue, [trs]);
            }
          }
          /// 交易生效
          const txFactory = transactionCore.getTransactionFactoryFromType(type);
          await txFactory.beginDealTransaction(trs, eventEmitter);
          await txFactory.applyTransaction(trs, eventEmitter);
          if (!skipVerifyStatisticInfo) {
            // 在 apply 之后，获取变更记录
            const calcTransactionAssetChanges = await eventEmitter.assetChangesGetter(tranItem);
            // 校验 transactionAssetChanges
            const transactionAssetChanges = tranItem.transactionAssetChanges;
            const calcLength = calcTransactionAssetChanges.length;
            const realLength = transactionAssetChanges.length;
            if (calcLength !== realLength) {
              throw new ArgumentIllegalException(NOT_MATCH, {
                to_compare_prop: `transactionAssetChanges lenght ${realLength}`,
                be_compare_prop: `transactionAssetChanges lenght ${calcLength}`,
                to_target: `transactionInBlock ${senderId} ${signature}`,
                be_target: "calculate",
                ...Function_Exception_Detail,
              });
            }
            for (let i = 0; i < calcLength; i++) {
              if (
                !baseHelper.isArrayEqual(
                  calcTransactionAssetChanges[i].getBytes(),
                  transactionAssetChanges[i].getBytes(),
                )
              ) {
                throw new ArgumentIllegalException(NOT_MATCH, {
                  to_compare_prop: `transactionAssetChanges with index ${i} ${JSON.stringify(
                    transactionAssetChanges[i],
                  )}`,
                  be_compare_prop: `transactionAssetChanges with index ${i} ${JSON.stringify(
                    calcTransactionAssetChanges[i],
                  )}`,
                  to_target: `transactionInBlock ${senderId} ${signature}`,
                  be_target: "calculate",
                  ...Function_Exception_Detail,
                });
              }
            }
            // 在 apply 之后，获取权益资产信息
            const assetPrealnum = tranItem.assetPrealnum;
            if (assetPrealnum) {
              const clalAssetPrealnum = await eventEmitter.assetPrealnumGetter(tranItem);
              if (!clalAssetPrealnum) {
                throw new ArgumentIllegalException(NOT_FOUND, {
                  prop: `transaction assetPrealnum ${signature}`,
                  ...Function_Exception_Detail,
                  target: "blockChain",
                });
              }
              if (clalAssetPrealnum.remainAssetPrealnum !== assetPrealnum.remainAssetPrealnum) {
                throw new ArgumentIllegalException(NOT_MATCH, {
                  to_compare_prop: `assetPrealnum.remainAssetPrealnum ${JSON.stringify(
                    assetPrealnum.remainAssetPrealnum,
                  )}`,
                  be_compare_prop: `assetPrealnum.remainAssetPrealnum ${JSON.stringify(
                    clalAssetPrealnum.remainAssetPrealnum,
                  )}`,
                  to_target: `transactionInBlock ${senderId} ${signature}`,
                  be_target: "calculate",
                  ...Function_Exception_Detail,
                });
              }
              if (
                clalAssetPrealnum.frozenMainAssetPrealnum !== assetPrealnum.frozenMainAssetPrealnum
              ) {
                throw new ArgumentIllegalException(NOT_MATCH, {
                  to_compare_prop: `assetPrealnum.frozenMainAssetPrealnum ${JSON.stringify(
                    assetPrealnum.frozenMainAssetPrealnum,
                  )}`,
                  be_compare_prop: `assetPrealnum.frozenMainAssetPrealnum ${JSON.stringify(
                    clalAssetPrealnum.frozenMainAssetPrealnum,
                  )}`,
                  to_target: `transactionInBlock ${senderId} ${signature}`,
                  be_target: "calculate",
                  ...Function_Exception_Detail,
                });
              }
            }
            // 获取是发送者的第几比交易
            const calcNumberOfSenderTransactions = await eventEmitter.numberOfSenderTranGetter(
              tranItem,
            );
            // 校验 numberOfSenderTransactions
            if (calcNumberOfSenderTransactions !== tranItem.numberOfSenderTransactions) {
              throw new ArgumentIllegalException(NOT_MATCH, {
                to_compare_prop: `numberOfSenderTransactions ${tranItem.numberOfSenderTransactions}`,
                be_compare_prop: `numberOfSenderTransactions ${calcNumberOfSenderTransactions}`,
                to_target: `transactionInBlock ${senderId} ${signature}`,
                be_target: "calculate",
                ...Function_Exception_Detail,
              });
            }
          }
          // 校验 TIB 签名 和 安全签名
          if (verifySignature) {
            if (
              !(await asymmetricHelper.detachedVeriy(
                tranItem.getBytes(true, true),
                tranItem.signatureBuffer,
                generatorPublicKeyBuffer,
              ))
            ) {
              throw new ArgumentFormatException(
                `Invalid transactionInBlock signature: %O`,
                tranItem.toJSON(),
              );
            }
            if (block.generatorSecondPublicKeyBuffer) {
              if (!tranItem.signSignatureBuffer) {
                throw new ArgumentFormatException(PROP_IS_REQUIRE, {
                  prop: "signSignature",
                  target: "transactionInBlock",
                  ...Function_Exception_Detail,
                });
              }
              if (
                !(await asymmetricHelper.detachedVeriy(
                  tranItem.getBytes(false, true),
                  tranItem.signSignatureBuffer,
                  block.generatorSecondPublicKeyBuffer,
                ))
              ) {
                throw new ArgumentFormatException(
                  `Invalid transactionInBlock signSignature: %O`,
                  tranItem.toJSON(),
                );
              }
            }
          }
          Object.freeze(tranItem);
          // 生产交易二进制数据
          const tranItemBinary = tranItem.getBytes();
          // 更新hash
          payloadHash.update(tranItemBinary);
          // 更新总字节长度
          payloadLength += tranItemBinary.length;
          await txFactory.endDealTransaction(tranItem, eventEmitter);
          if (type === VOTE) {
            numberOfVotes++;
          }
        } catch (error) {
          const res = await eventEmitter.emit("error", {
            error,
            type: "replayBlock",
            transactionInBlock: tranItem,
          });
          if (res && res.continue) {
            continue;
          }
          throw error;
        }
      }
      isDevGenerateBlock && info("finish insertTransactionsForReplay");

      if (numberOfVotes > MAX_VOTES_PER_BLOCK) {
        throw new ConsensusException(PROP_SHOULD_LTE_FIELD, {
          prop: `numberOfVotes ${numberOfVotes}`,
          target: "block",
          field: `maxVotesPerBlock ${MAX_VOTES_PER_BLOCK}`,
          ...Function_Exception_Detail,
        });
      }

      const numberOfTransactions = transactionBufferList.length;
      if (block.numberOfTransactions !== numberOfTransactions) {
        /// 区块的交易数对不上
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: `numberOfTransactions ${block.numberOfTransactions}`,
          be_compare_prop: `numberOfTransactions ${numberOfTransactions}`,
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      if (block.payloadLength !== payloadLength) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: `payloadLength ${block.payloadLength}`,
          be_compare_prop: `payloadLength ${payloadLength}`,
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      const payloadHashHex = await payloadHash.digest("hex");
      if (block.payloadHash !== payloadHashHex) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: `payloadHashHex ${block.payloadHash}`,
          be_compare_prop: `payloadHashHex ${payloadHashHex}`,
          to_target: "block",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }

      if (!skipVerifyParticipation) {
        const blockParticipation = this.blockHelper.calcBlockParticipation({
          totalChainAsset: statisticsInfo.totalChainAsset,
          numberOfTransactions,
        });
        if (block.blockParticipation !== blockParticipation) {
          throw new ArgumentIllegalException(NOT_MATCH, {
            to_compare_prop: `blockParticipation ${block.blockParticipation}`,
            be_compare_prop: `blockParticipation ${blockParticipation}`,
            to_target: "block",
            be_target: "calculate",
            ...Function_Exception_Detail,
          });
        }
      }

      if (!skipVerifyStatisticInfo) {
        if (
          !this.baseHelper.isArrayEqual(
            blockStatisticsInfo.getBytes(),
            statisticsInfo.toModel().getBytes(),
          )
        ) {
          throw new ArgumentIllegalException(NOT_MATCH, {
            to_compare_prop: `statisticsInfo ${JSON.stringify(blockStatisticsInfo.toJSON())}`,
            be_compare_prop: `statisticsInfo ${JSON.stringify(statisticsInfo.toModel().toJSON())}`,
            to_target: "block",
            be_target: "calculate",
            ...Function_Exception_Detail,
          });
        }

        const stotalAmount = statisticsInfo.totalAsset;
        const stotalFee = statisticsInfo.totalFee;
        if (BigInt(block.totalAmount) !== stotalAmount) {
          throw new ArgumentIllegalException(NOT_MATCH, {
            to_compare_prop: `totalAmount ${block.totalAmount}`,
            be_compare_prop: `totalAmount ${stotalAmount.toString()}`,
            to_target: "block",
            be_target: "calculate",
            ...Function_Exception_Detail,
          });
        }

        if (BigInt(block.totalFee) !== stotalFee) {
          throw new ArgumentIllegalException(NOT_MATCH, {
            to_compare_prop: `totalFee ${block.totalFee}`,
            be_compare_prop: `totalFee ${stotalFee.toString()}`,
            to_target: "block",
            be_target: "calculate",
            ...Function_Exception_Detail,
          });
        }
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
