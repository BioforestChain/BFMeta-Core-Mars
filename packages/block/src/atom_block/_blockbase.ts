import { Block, GetBlockRemarkJSON } from "@bfchain/core-model-block";
import { TransactionInBlock, TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import type {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  MilestonesHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  OUT_OF_RANGE,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  NOT_MATCH,
  DUPLICATE,
  PROP_SHOULD_EQ_FIELD,
  NOT_EXIST,
  TRAN_POW_VERIFY_FAIL,
  PROP_SHOULD_LTE_FIELD,
  TOO_LARGE,
} from "@bfchain/core-util-exception";
import { Exception, QueneEventEmitter, EasyMap, cacheGetter, isFlagInDev } from "@bfchain/util";
import { Writer } from "@bfchain/protobuf";
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

export abstract class BlockFactory<T extends Block> {
  // abstract ERR: ReturnType<typeof ExceptionGenerator>;
  abstract transactionCore: import("@bfchain/core-transaction").TransactionCore;
  abstract blockHelper: BlockHelper;
  abstract baseHelper: BaseHelper;
  abstract cryptoHelper: BFChainCore.CryptoHelperInterface;
  abstract config: ConfigHelper;
  abstract statisticsHelper: BlockBaseStatisticsHelper;
  abstract milestonesHelper: MilestonesHelper;
  abstract asymmetricHelper: AsymmetricHelper;
  abstract chainAssetInfoHelper: ChainAssetInfoHelper;
  abstract blockGeneratorCalculator: import("./blockGeneratorCalculator").BlockGeneratorCalculator;

  abstract fromJSON(blockBody: BFChainCore.BlockJSON<GetBlockRemarkJSON<T>>): Promise<T>;

  /** transactionInBlockFromJSON*/
  transactionInBlockFromJSON<T extends BFChainCore.TransactionJSON>(
    twi: BFChainCore.TransactionInBlockJSON<T>,
  ) {
    const transactionInBlock = TransactionInBlock.fromObject(twi) as TransactionInBlock<
      BFChainCore.Transaction<BFChainCore.GetTransactionJSONAssetJSON<T>>
    >;
    return transactionInBlock;
  }

  /**
   * 锻造区块
   *
   * @param body
   * @param remark
   * @param transactions
   * @param keypair
   * @param eventEmitter
   * @param config
   */
  async generateBlock(
    body: BFChainCore.BlockBody,
    remark: GetBlockRemarkJSON<T>,
    transactions: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey?: Buffer;
    },
    eventEmitter?: BFChainCore.GenerateBlockEventEmitter,
    config = this.config,
  ) {
    isDevGenerateBlock && info("begin generateBlock");
    const Function_Exception_Detail = { function: "generateBlock" };
    if (!body) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "body",
        ...Function_Exception_Detail,
      });
    }
    if (!remark) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "remark",
        ...Function_Exception_Detail,
      });
    }
    if (!transactions) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "transactions",
        ...Function_Exception_Detail,
      });
    }

    isDevGenerateBlock && log("before generateBlock");
    eventEmitter && (await eventEmitter.emit("beforeGenerateBlock", body));

    if (body.height > 1) {
      /// 如果没有自定义的掉块信息，或者没有提供私钥（区块验证模式），那么就主动生成掉块信息
      if (
        /// 如果没有 roundOfflineGeneratersHashMap
        !body.roundOfflineGeneratersHashMap ||
        /// 或者说，有roundOfflineGeneratersHashMap，但是处于不可信的区块验证模式下
        (!keypair.secretKey && !body.isTrustRoundOfflineGeneraters)
      ) {
        /// 主动生成掉块信息
        const lastBlock = await this.blockHelper.forceGetBlockByHeight(body.height - 1);
        body.roundOfflineGeneratersHashMap = await (
          await this.blockGeneratorCalculator.calcGenerateBlockDelegate(lastBlock, {
            toTimestamp: body.timestamp,
          })
        ).roundOfflineGeneratersHashMap;
      } else {
        body.roundOfflineGeneratersHashMap = body.roundOfflineGeneratersHashMap;
      }
    }

    // this.blockGeneratorCalculator.calcGenerateBlockDelegateGenerator()
    const block = this._generateBlock(body, remark);
    // 校验 remark 大小
    this.verifyBlockRemarkSize(block);
    // 绑定magic
    block.magic = config.magic;
    // // 生产signature
    // block.signature = this.blockHelper.generateSignature(block);
    // 绑定交易相关的信息
    await this.insertTransactions(block, transactions, keypair, eventEmitter);

    isDevGenerateBlock && log("before signatureBlock");
    eventEmitter && (await eventEmitter.emit("beforeSignatureBlock", block));

    /// 计算并赋值区块大小
    block.blockSize = this.calcBlockSize(block);

    /// 进行区块签名或者验签
    if (block.signatureBuffer.length > 0) {
      if (
        !(await this.asymmetricHelper.detachedVeriy(
          block.getBytes(true, true),
          block.signatureBuffer,
          keypair.publicKey,
        ))
      ) {
        throw new ArgumentFormatException(`Invalid block signature`);
      }
    } else {
      if (!keypair.secretKey) {
        throw new ArgumentIllegalException("secretKey is null when generateBlock");
      }
      block.signatureBuffer = await this.asymmetricHelper.detachedSign(
        block.getBytes(true, true),
        keypair.secretKey,
      );
    }

    isDevGenerateBlock && log("before generatedBlock");
    eventEmitter && (await eventEmitter.emit("generatedBlock", block));
    isDevGenerateBlock && info("finish generateBlock");
    return block;
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
    const { verifySignature } = options;

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

      if (block.previousBlockSignature !== lastBlock.signature) {
        throw new ArgumentIllegalException(NOT_MATCH, {
          to_compare_prop: `previousBlockSignature ${block.previousBlockSignature}`,
          be_compare_prop: `blockSignature ${block.signature}`,
          to_target: "block",
          be_target: "blockChain lastBlock",
          ...Function_Exception_Detail,
        });
      }

      const calcRoundOfflineGeneratersReadonlyMap = await (
        await this.blockGeneratorCalculator.calcGenerateBlockDelegate(lastBlock, {
          toTimestamp: block.timestamp,
        })
      ).roundOfflineGeneratersReadonlyMap;

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
    await this.verifyBlockBody(block, block.remark, config);

    // 绑定交易相关的信息
    await this.insertTransactionsForReplay(block, transactions, eventEmitter, options, config);

    // 校验区块奖励数
    this.verifyBlockReward(block);

    isDevGenerateBlock && log("before signatureBlock");
    eventEmitter && (await eventEmitter.emit("beforeSignatureBlock", block));

    // 验证区块大小
    this.verifyBlockSize(block);

    // 校验 remark 大小
    this.verifyBlockRemarkSize(block);

    // 校验区块签名
    verifySignature && (await this.verifySignature(block));

    isDevGenerateBlock && log("before generatedBlock");
    eventEmitter && (await eventEmitter.emit("generatedBlock", block));
    isDevGenerateBlock && info("finish replayBlock");
    return block;
  }

  /**生产区块 */
  abstract _generateBlock(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>): T;

  /**
   * 检查交易是否可以被创建
   * @param type
   */
  @cacheGetter
  get canInsertTransaction() {
    return this.transactionCore.canCreateTransaction.bind(this.transactionCore);
  }

  /**
   * 绑定交易相关的信息
   * 包括交易体、统计金额、校验hash、总长度
   *
   * @param body
   * @param commonBlockRemark
   */
  async insertTransactions(
    block: T,
    trsGenerator: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey?: Buffer;
    },
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter(),
  ) {
    const abortForbiddenTransaction = this.transactionCore.abortForbiddenTransaction;
    const Function_Exception_Detail = { function: "insertTransactions" };
    const MAX_TRANSACTION_SIZE = this.config.genesisBlock.remark.maxTransactionSize;
    const { height, signature, statisticInfo: blockStatisticsInfo } = block;
    const { powOfWorkExemptionBlocks, maxPayloadLength } = this.config;
    /**所有交易的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**所有交易体的总字节长度 */
    let payloadLength = 0;
    /**本块交易所涉及的资产信息 */
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(
      height,
      signature,
      blockStatisticsInfo,
    );
    const transactions: TransactionInBlock[] = [];
    try {
      /**绑定统计功能到事件触发器上 */
      this.statisticsHelper.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
      /**用于快速地计算发送者的交易量 */
      const tranSenderCountMap = new EasyMap<string, number>((address) => 0);
      isDevGenerateBlock && info("begin insertTransactions");
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
          if (!this.canInsertTransaction(trs.type)) {
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

          if (height > powOfWorkExemptionBlocks) {
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
                  function: "insertTransactions",
                });
              }
              if (!checkResult) {
                throw new ArgumentFormatException(TRAN_POW_VERIFY_FAIL, {
                  function: "insertTransactions",
                });
              }
              tranSenderCountMap.set(trs.senderId, count + 1);
            }
            //#endregion
          }
          // 保存交易
          tranItem.index = transactions.length;
          transactions.push(tranItem);
          tranItem.height = block.height;
          /// 交易生效
          const txFactory = this.transactionCore.getTransactionFactoryFromType(trs.type);
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
                function: "insertTransactions",
              });
            }
          }
          // 对TIB进行验签或者签名
          if (tranItem.signatureBuffer.length > 0) {
            /// 如果已经有签名信息，那么进行验证
            if (
              !(await this.asymmetricHelper.detachedVeriy(
                tranItem.getBytes(true),
                tranItem.signatureBuffer,
                keypair.publicKey,
              ))
            ) {
              throw new ArgumentFormatException(
                `Invalid transactionInBlock: %O`,
                tranItem.toJSON(),
              );
            }
          } else {
            // 否则尝试手动签名
            if (!keypair.secretKey) {
              throw new ArgumentIllegalException("secretKey is null when insertTransactions");
            }
            tranItem.signatureBuffer = await this.asymmetricHelper.detachedSign(
              tranItem.getBytes(true),
              keypair.secretKey,
            );
          }
          Object.freeze(tranItem);
          // 生产交易二进制数据
          const tranItemBinary = tranItem.getBytes();
          // 更新hash
          payloadHash.update(tranItemBinary);
          // 更新总字节长度
          payloadLength += tranItemBinary.length;
          if (payloadLength > maxPayloadLength * 0.95) {
            await eventEmitter.emit("nearMaxPayloadLength", { payloadLength });
          }
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
      isDevGenerateBlock && info("finish insertTransactions");

      block.statisticInfo = statisticsInfo.toModel();
      block.payloadHashBuffer = await payloadHash.digest();
      block.payloadLength = payloadLength;
      block.transactions = transactions;
      const numberOfTransactions = transactions.length;
      if (block.numberOfTransactions !== 0 && block.numberOfTransactions !== numberOfTransactions) {
        /// 区块的交易数对不上
        throw new ConsensusException(`block should have {num1} Transactions, but only get {num2}`, {
          num1: block.numberOfTransactions,
          num2: numberOfTransactions,
        });
      }
      block.numberOfTransactions = numberOfTransactions;
      block.remark.blockParticipation = this.blockHelper.calcBlockParticipation({
        totalAccount: statisticsInfo.totalAccount,
        totalChainAsset: statisticsInfo.totalChainAsset,
        totalFee: statisticsInfo.totalFee,
        numberOfTransactions,
      });

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
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(
      height,
      signature,
      blockStatisticsInfo,
    );
    const transactions: TransactionInBlock[] = [];
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
          if (!this.canInsertTransaction(trs.type)) {
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
          if (transactions.length !== tranItem.index) {
            throw new ArgumentIllegalException(NOT_MATCH, {
              to_compare_prop: "index",
              be_compare_prop: "index",
              to_target: "transactions",
              be_target: "calculate",
              ...Function_Exception_Detail,
            });
          }

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

      const numberOfTransactions = transactions.length;
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

    return block;
  }

  /**
   * 计算出区块的blockSize的正确值
   * @param block
   */
  calcBlockSize(block: Block) {
    const BLOCK_SIZE_FIELD_ID = Block.$type.fields.blockSize.id;
    const getBlockSizeByteSizeInfo = (blockSize: number) => {
      return {
        value: blockSize,
        size:
          blockSize === 0
            ? 0
            : new Writer().uint32(BLOCK_SIZE_FIELD_ID).uint32(blockSize).finish().length,
      };
    };
    const oldBlockSize = block.blockSize;
    let newBlockSize = oldBlockSize;

    newBlockSize =
      block.getBytes().length +
      (block.signatureBuffer.length ? 0 : 66) /* signature 的前置为 1位 + 32长度的signature */;
    if (oldBlockSize !== newBlockSize) {
      let oldBlockSizeInfo = getBlockSizeByteSizeInfo(oldBlockSize);
      do {
        /**
         * 这里只是算出blockSize这个数字要写入模型中要占用的字节数
         * 而真实的blockSize又要基于这个字节数，加上真实的模型大小的来。
         * 所以在block.blockSize加上blockSize存储所需的字节数后，它会变大
         * blockSize值变大的同时，也就意味着存储这个字所需的字节数也会增加
         * 因此需要有一个循环来让blockSize稳定在一个区间内。
         */
        const newBlockSizeInfo = getBlockSizeByteSizeInfo(newBlockSize);

        if (newBlockSizeInfo.size !== oldBlockSizeInfo.size) {
          newBlockSize += newBlockSizeInfo.size - oldBlockSizeInfo.size;
          oldBlockSizeInfo = newBlockSizeInfo;
        } else {
          break;
        }
      } while (true);
    }
    return newBlockSize;
  }

  /**
   * 验证主密码的密钥对是否合法
   *
   * @param keypair
   */
  verifyKeypair(keypair: BFChainCore.Keypair) {
    const Function_Exception_Detail = {
      function: "verifyKeypair",
    };

    if (!keypair) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "keypair",
        ...Function_Exception_Detail,
      });
    }

    const Keypair_Exception_Detail = {
      target: "keypair",
    } as const;
    const { baseHelper } = this;

    if (!keypair.publicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }
    if (!baseHelper.isValidPublicKey(keypair.publicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "publicKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!keypair.secretKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        param: "secretKey",
        ...Keypair_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSecretKey(keypair.secretKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "secretKey",
        ...Keypair_Exception_Detail,
      });
    }
  }

  /**
   * 校验区块基础信息
   *
   * @param body
   * @param remark
   */
  async verifyBlockBody(
    body: BFChainCore.BlockBody,
    remark: GetBlockRemarkJSON<T>,
    config = this.config,
  ) {
    const { baseHelper } = this;
    const Function_Exception_Detail = { function: "verifyBlockBody" };
    if (!body) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "body",
        ...Function_Exception_Detail,
      });
    }

    if (!remark && baseHelper.getVariableType(remark) !== "[object Object]") {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "remark",
        ...Function_Exception_Detail,
      });
    }

    const BlockBody_Exception_Detail = {
      target: "body",
      ...Function_Exception_Detail,
    };

    if (!baseHelper.isPositiveInteger(body.version)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "version",
        type: "positive integer",
        ...BlockBody_Exception_Detail,
      });
    }

    if (!baseHelper.isPositiveInteger(body.height)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "height",
        type: "positive integer",
        ...BlockBody_Exception_Detail,
      });
    }

    if (body.height > 1 && !body.previousBlockSignature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "previousBlockSignature",
        ...BlockBody_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(body.timestamp)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "timestamp",
        type: "positive integer or 0",
        ...BlockBody_Exception_Detail,
      });
    }
  }

  /**
   * 验证区块交易
   *
   * @FIXME 统计金额
   * @param block 区块
   */
  async verifyBlockTransactions(
    block: T,
    config = this.config,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter(),
  ) {
    const Function_Exception_Detail = { function: "verifyBlockTransactions" };
    if (!block) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "block",
        ...Function_Exception_Detail,
      });
    }

    const Block_Exception_Detail = {
      target: "block",
      ...Function_Exception_Detail,
    } as const;

    const { baseHelper } = this;

    if (!block.transactions) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "transactions",
        ...Block_Exception_Detail,
      });
    }

    const totalTransaction = block.transactions.length;

    if (totalTransaction !== block.numberOfTransactions) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "numberOfTransactions",
        be_compare_prop: "transactions length",
        to_target: "block",
        be_target: "block",
        ...Block_Exception_Detail,
      });
    }

    if (totalTransaction > config.maxTPSPerBlock * config.forgeInterval) {
      throw new ArgumentFormatException(PROP_SHOULD_LTE_FIELD, {
        prop: "transactions length",
        field: `maxTPSPerBlock ${config.maxTPSPerBlock}`,
        ...Block_Exception_Detail,
      });
    }

    const { totalAmount, totalFee } = block;
    if (!totalAmount) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "totalAmount",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(totalAmount)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "totalAmount",
        type: "asset number",
        ...Block_Exception_Detail,
      });
    }

    if (!totalFee) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "totalFee",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isValidAssetNumber(totalFee)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "totalFee",
        type: "asset number",
        ...Block_Exception_Detail,
      });
    }

    const transactions = block.transactions;
    /**重复交易 */
    const appliedTransactions = new Set<string>();
    /**所有交易的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**所有交易体的总字节长度 */
    let payloadLength = 0;
    const sourceStatisticsInfoModel = block.statisticInfo;
    /**
     * 初始化统计器
     */
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(
      block.height,
      block.signature,
      undefined,
      config,
    );
    try {
      /**
       * 这里的`statisticInfoModel`需要进行重新生成，
       * 在校验执行apply的时候重新进行统计
       * 但`assetInfo`对应的`index`需要沿用下来
       */
      for (const [index, assetStatistic] of sourceStatisticsInfoModel.assetStatisticMap) {
        const chainAsset = this.chainAssetInfoHelper.getAssetInfo(
          assetStatistic.magic,
          assetStatistic.assetType,
        );
        statisticsInfo.initAssetStatistic(chainAsset, index);
      }
      /**绑定统计功能到事件触发器上 */
      this.statisticsHelper.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);

      for (const tranItem of transactions) {
        const transaction = tranItem.transaction;
        // 验证区块内每笔交易的基本信息
        await this.transactionCore
          .getTransactionFactoryFromType(transaction.type)
          .verify(transaction, config);
        if (appliedTransactions.has(transaction.signature)) {
          throw new ArgumentIllegalException(DUPLICATE, {
            variable: "transaction signature",
            value: transaction,
            ...Block_Exception_Detail,
          });
        }
        appliedTransactions.add(transaction.signature);

        if (
          !(await this.asymmetricHelper.detachedVeriy(
            tranItem.getBytes(true),
            tranItem.signatureBuffer,
            block.generatorPublicKeyBuffer,
          ))
        ) {
          throw new ArgumentFormatException(`Invalid transactionInBlock signature`);
        }
        for (const transactionAssetChange of tranItem.transactionAssetChanges) {
          if (BigInt(transactionAssetChange.assetBalance) < BigInt(0)) {
            throw new ArgumentIllegalException(PROP_IS_INVALID, {
              prop: "assetBalance",
              type: "transactionAssetChanges",
              ...Block_Exception_Detail,
            });
          }
        }
        // 生产交易二进制数据
        const tranItemBinary = TransactionInBlock.encode(tranItem).finish();
        // 更新hash
        payloadHash.update(tranItemBinary);
        // 更新总字节长度
        payloadLength += tranItemBinary.length;
        const trs = tranItem.transaction;
        /// 交易生效
        const txFactory = this.transactionCore.getTransactionFactoryFromType(trs.type);
        /**
         * eventEmitter 设计是可以绑定同步或者异步的方法,而 bindApplyTransactionEventEmiter 绑定的都是同步的操作,
         * 所以这里没有 await 也可以得到结果
         * */
        await txFactory.applyTransaction(trs, eventEmitter, config);
      }
    } catch (err) {
      throw err;
    } finally {
      statisticsInfo.unref(block.signature);
    }

    if (
      !baseHelper.isArrayEqual(
        statisticsInfo.toModel().getBytes(),
        sourceStatisticsInfoModel.getBytes(),
      )
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "statisticInfo",
        type: "block statisticInfo",
        ...Block_Exception_Detail,
      });
    }

    const stotalAmount = statisticsInfo.totalAsset;
    const stotalFee = statisticsInfo.totalFee;

    if (stotalAmount !== BigInt(totalAmount)) {
      throw new ArgumentIllegalException(PROP_SHOULD_EQ_FIELD, {
        prop: "totalAmount",
        field: stotalAmount.toString(),
        ...Block_Exception_Detail,
      });
    }

    if (stotalFee !== BigInt(totalFee)) {
      throw new ArgumentIllegalException(PROP_SHOULD_EQ_FIELD, {
        prop: "totalFee",
        field: stotalFee,
        ...Block_Exception_Detail,
      });
    }

    if (block.payloadLength !== payloadLength) {
      throw new ArgumentIllegalException(PROP_SHOULD_EQ_FIELD, {
        prop: "payloadLength",
        field: payloadLength,
        ...Block_Exception_Detail,
      });
    }

    if (payloadLength > config.maxPayloadLength) {
      throw new ArgumentIllegalException(TOO_LARGE, {
        prop: "payloadLength",
        reason: `payloadLength: ${payloadLength} max: ${config.maxPayloadLength}`,
        ...Block_Exception_Detail,
      });
    }

    const payloadHashHex = await payloadHash.digest("hex");
    if (block.payloadHash !== payloadHashHex) {
      throw new ArgumentIllegalException(TOO_LARGE, {
        prop: "payloadHash",
        reason: `payloadHash: ${block.payloadHash} not equal: ${payloadHashHex}`,
        ...Block_Exception_Detail,
      });
    }

    const numberOfTransactions = transactions.length;
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
  }

  /**
   * 校验基础信息
   *
   * @param block
   */
  async verifyBlockDerivativeInfo(block: T, config = this.config) {
    const Function_Exception_Detail = { function: "verifyBlockDerivativeInfo" };

    const Block_Exception_Detail = {
      target: "block",
      ...Function_Exception_Detail,
    };

    const { baseHelper } = this;
    if (
      block.height !== 1 &&
      !block.previousBlockSignature &&
      baseHelper.isValidBlockSignature(block.previousBlockSignature)
    ) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "previousBlockSignature",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(block.numberOfTransactions)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "numberOfTransactions",
        type: "natural number",
        ...Block_Exception_Detail,
      });
    }

    if (!block.payloadHash) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "payloadHash",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(block.payloadLength)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "payloadLength",
        type: "natural number",
        ...Block_Exception_Detail,
      });
    }

    if (block.magic !== config.magic) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "block.magic",
        be_compare_prop: "genesisBlock.magic",
        to_target: "block_body",
        be_target: "genesis_block",
        ...Block_Exception_Detail,
      });
    }

    if (!block.generatorPublicKey) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "generatorPublicKey",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isValidPublicKey(block.generatorPublicKey)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "generatorPublicKey",
        type: "account publicKey",
        ...Block_Exception_Detail,
      });
    }

    if (!block.signature) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: "signature",
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isValidSignature(block.signature)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: "signature",
        type: "signature",
        ...Block_Exception_Detail,
      });
    }

    this.verifyBlockReward(block);

    this.verifyBlockSize(block);

    this.verifyBlockRemarkSize(block);
  }

  /**
   * 校验区块奖励数
   *
   * @param block
   */
  verifyBlockReward(block: T) {
    const expectedReward = this.milestonesHelper.calcReward(block.height).toString();
    if (expectedReward !== block.reward) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "blockReward",
        be_compare_prop: "expectedReward",
        to_target: "block",
        be_target: "calculate",
        function: "verifyBlockReward",
      });
    }
  }

  /**
   * 校验区块 remark 大小
   *
   * @param block
   */
  verifyBlockRemarkSize(block: T) {
    this.blockHelper.verifyBlockRemarkSize(block.remark);
  }

  /**
   * 校验区块大小
   *
   */
  verifyBlockSize(block: T) {
    const blockSize = this.calcBlockSize(block);
    if (block.blockSize !== blockSize) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `blockSize ${block.blockSize}`,
        be_compare_prop: `blockSize ${blockSize}`,
        to_target: "body",
        be_target: "calculate",
        function: "verifyBlockSize",
      });
    }
  }

  /**
   * 校验签名
   *
   * @param block
   */
  verifySignature(block: T) {
    return this.blockHelper.verifyBlockSignature(block);
  }

  /**
   * 完整校验区块
   *
   * @param block
   */
  async verify(block: T, config = this.config) {
    await this.verifyBlockBody(block, block.remark, config);
    await this.verifyBlockDerivativeInfo(block, config);
    await this.verifyBlockTransactions(block, config);
    await this.verifySignature(block);
  }

  /**生成区块的 signature */
  generateSignature(block: Block) {
    return this.blockHelper.generateSignature(block);
  }
}
