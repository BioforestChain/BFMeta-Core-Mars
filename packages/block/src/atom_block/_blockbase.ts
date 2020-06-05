import type { Block, GetBlockRemarkJSON } from "@bfchain/core-model-block";
import { TransactionInBlock, TRANSACTION_TYPES_MAP } from "@bfchain/core-model-transaction";
import type {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  BlockBaseStatisticsHelper,
  StatisticsInfo,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  OUT_OF_RANGE,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  NOT_EXIST,
  TRAN_POW_VERIFY_FAIL,
} from "@bfchain/core-util-exception";
import { Exception, QueneEventEmitter, EasyMap, isFlagInDev } from "@bfchain/util";
import type { CommonBlockVerify } from "./commonBlockVerify";
import type { VerifyBlockCore } from "./verifyBlock";
import type { ReplayBlockCore } from "./replayBlock";
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
  abstract transactionCore: import("@bfchain/core-transaction").TransactionCore;
  abstract blockHelper: BlockHelper;
  abstract baseHelper: BaseHelper;
  abstract cryptoHelper: BFChainCore.CryptoHelperInterface;
  abstract config: ConfigHelper;
  abstract statisticsHelper: BlockBaseStatisticsHelper;
  abstract asymmetricHelper: AsymmetricHelper;
  abstract blockGeneratorCalculator: import("./blockGeneratorCalculator").BlockGeneratorCalculator;

  abstract commonBlockVerify: CommonBlockVerify<T>;
  abstract verifyBlockCore: VerifyBlockCore<T>;
  abstract replayBlockCore: ReplayBlockCore<T>;

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
    this.commonBlockVerify.verifyBlockRemarkSize(block);
    // 绑定magic
    block.magic = config.magic;
    // // 生产signature
    // block.signature = this.blockHelper.generateSignature(block);
    // 绑定交易相关的信息
    await this.insertTransactions(block, transactions, keypair, eventEmitter);

    isDevGenerateBlock && log("before signatureBlock");
    eventEmitter && (await eventEmitter.emit("beforeSignatureBlock", block));

    /// 计算并赋值区块大小
    block.blockSize = this.commonBlockVerify.calcBlockSize(block);

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
    return await this.replayBlockCore.replayBlock(
      block,
      transactions,
      eventEmitter,
      options,
      config,
    );
  }

  /**生产区块 */
  abstract _generateBlock(body: BFChainCore.BlockBody, remark: GetBlockRemarkJSON<T>): T;

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
    const needTPow = height > powOfWorkExemptionBlocks;
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
          await txFactory.beginDealTransaction(trs, eventEmitter);
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
    this.commonBlockVerify.verifyBlockBody(body, remark);
  }

  /**
   * 完整校验区块
   *
   * @param block
   */
  async verify(block: T, config = this.config) {
    await this.verifyBlockCore.verify(block, config);
  }

  /**生成区块的 signature */
  async generateSignature(block: Block) {
    return await this.blockHelper.generateSignature(block);
  }

  /**
   * 指定的区块是否已经存在
   *
   * @param signature
   * @param height
   * @param blockGetterHelper
   */
  async isBlockAlreadyExist(
    signature: string,
    height: number,
    blockGetterHelper: Pick<BFChainCore.BlockGetterHelperInterface, "getCountBlock">,
  ) {
    await this.commonBlockVerify.isBlockAlreadyExist(signature, height, blockGetterHelper);
  }

  /**
   * 校验交易涉及的账户变动
   *
   * @param trsInBlock
   * @param applyResult
   * @param statisticsInfo
   */
  verifyTransactionAssetChange(
    trsInBlock: BFChainCore.TransactionInBlock,
    applyResult: BFChainCore.AccountChangeResultInfo,
    statisticsInfo: StatisticsInfo,
  ) {
    this.commonBlockVerify.verifyTransactionAssetChange(trsInBlock, applyResult, statisticsInfo);
  }
}
