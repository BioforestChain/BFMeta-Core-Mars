import { Block, GetBlockRemarkJSON } from "@bfchain/core-model-block";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import {
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
import { Exception, QueneEventEmitter, EasyMap, Resolve, ModuleStroge } from "@bfchain/util";
const {
  ArgumentIllegalException,
  OutOfRangeException,
  ArgumentFormatException,
  NoFoundException,
  warn,
} = CoreExceptionGenerator("CONTROLLER", "_blockbase");

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

  abstract fromJSON(blockBody: BFChainCore.BlockJSON<GetBlockRemarkJSON<T>>): T;

  /** transactionInBlockFromJSON*/
  transactionInBlockFromJSON(twi: BFChainCore.TransactionInBlockJSON<any>) {
    const transactionInBlock = TransactionInBlock.fromObject(twi);
    return transactionInBlock;
  }

  /**
   * 初始化并生产完整的区块
   * @TODO 绑定区块奖励
   *
   * @param body
   * @param remark
   * @param transactions
   */
  async generateBlock(
    body: BFChainCore.BlockBody,
    remark: GetBlockRemarkJSON<T>,
    transactions: AsyncIterable<TransactionInBlock>,
    keypair: {
      publicKey: Buffer;
      secretKey?: Buffer;
    },
    eventEmitter?: BFChainCore.ApplyTransactionEventEmitter,
    config = this.config,
  ) {
    const Function_Exception_Detail = { function: "init" };
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
    eventEmitter && (await eventEmitter.emit("beforeGenerateBlock", body));
    const block = this._generateBlock(body, remark);
    // 绑定magic
    block.magic = config.magic;
    // // 生产signature
    // block.signature = this.blockHelper.generateSignature(block);
    // 绑定交易相关的信息
    await this.insertTransactions(block, transactions, keypair, eventEmitter);
    eventEmitter && (await eventEmitter.emit("generatedBlock", block));
    return block;
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
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter<any>(),
  ) {
    const Function_Exception_Detail = { function: "insertTransactions" };
    const MAX_TRANSACTION_SIZE = this.config.genesisBlock.remark.maxTransactionSize;
    const { transactions } = block;
    /**所有交易的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**所有交易体的总字节长度 */
    let payloadLength = 0;
    /**本块交易所涉及的资产信息 */
    const statisticsInfo = this.statisticsHelper.forceGetStatisticsInfoByBlock(
      block.height,
      block.signature,
      block.statisticInfo,
    );
    try {
      /**绑定统计功能到事件触发器上 */
      this.statisticsHelper.bindApplyTransactionEventEmiter(eventEmitter, statisticsInfo);
      /**用于快速地计算发送者的交易量 */
      const tranSenderCountMap = new EasyMap<string, number>(address => 0);
      for await (const tranItem of trsGenerator) {
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
          if (block.height > this.config.powOfWorkExemptionBlocks) {
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
          tranItem.height = block.height;
          for (const transactionAssetChange of tranItem.transactionAssetChanges) {
            if (BigInt(transactionAssetChange.assetBalance) < BigInt(0)) {
              throw new ArgumentIllegalException(PROP_IS_INVALID, {
                prop: "assetBalance",
                target: "transactionAssetChanges",
                function: "insertTransactions",
              });
            }
          }
          transactions.push(tranItem);
          /// 交易生效
          const txFactory = this.transactionCore.getTransactionFactoryFromType(trs.type);
          await txFactory.applyTransaction(trs, eventEmitter);
          // 在apply之后，获取变更记录
          eventEmitter.assetChangesGetter &&
            (tranItem.transactionAssetChanges = eventEmitter.assetChangesGetter(tranItem));
          // 对TIB进行签名
          if (keypair.secretKey) {
            tranItem.signatureBuffer = this.asymmetricHelper.detachedSign(
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
          if (payloadLength > this.config.maxPayloadLength * 0.95) {
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

      block.statisticInfo = statisticsInfo.toModel();
      block.payloadHashBuffer = payloadHash.digest();
      block.payloadLength = payloadLength;
      block.transactions = transactions;
      const numberOfTransactions = transactions.length;
      block.numberOfTransactions = numberOfTransactions;
      block.remark.blockParticipation = this.blockHelper.calcBlockParticipation({
        totalAccount: statisticsInfo.totalAccount,
        totalChainAsset: statisticsInfo.totalChainAsset,
        totalFee: statisticsInfo.totalFee,
        numberOfTransactions,
      });
      block.blockSize =
        block.getBytes().length +
        (block.signatureBuffer.length ? 0 : 66) /* signature 的前置为 1位 + 32长度的signature */;

      /// 临时恢复的操作，但会曝出警告
      if (eventEmitter.has("finishedDealTransactions")) {
        warn(
          "@deprecated",
          `logic "finishedDealTransactions" 事件已经被遗弃，请及时更新并升级代码`,
        );
        await eventEmitter.emit("finishedDealTransactions", block);
      }
    } catch (err) {
      throw err;
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
  verifyBlockBody(
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
  verifyBlockTransactions(
    block: T,
    config = this.config,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter<any>(),
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

    if (totalTransaction > config.maxTPSPerBlock) {
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
        this.transactionCore
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
          !this.asymmetricHelper.detachedVeriy(
            tranItem.getBytes(true),
            tranItem.signatureBuffer,
            block.generatorPublicKeyBuffer,
          )
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
        txFactory.applyTransaction(trs, eventEmitter, config);
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
  }

  /**
   * 校验基础信息
   *
   * @param block
   */
  verifyBaseInfo(block: T, config = this.config) {
    const Function_Exception_Detail = { function: "verify" };
    if (!block) {
      throw new ArgumentIllegalException(PARAM_LOST, {
        param: "block",
        ...Function_Exception_Detail,
      });
    }

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

    // 校验区块奖励数
    const expectedReward = this.milestonesHelper.calcReward(block.height).toString();
    if (block.height !== 1 && expectedReward !== block.reward) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "blockReward",
        be_compare_prop: "expectedReward",
        to_target: "block",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }

    // 校验区块参与度
    const { numberOfTransactions, statisticInfo } = block;
    const { totalAccount, totalChainAsset, totalFee } = statisticInfo;
    const blockParticipation = block.remark.blockParticipation;
    const calBlockParticipation = this.blockHelper.calcBlockParticipation({
      totalAccount,
      totalChainAsset: BigInt(totalChainAsset),
      totalFee: BigInt(totalFee),
      numberOfTransactions,
    });
    if (blockParticipation !== calBlockParticipation) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: "blockParticipation",
        be_compare_prop: "blockParticipation",
        to_target: "block",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }

    this.verifyBlockBody(block, block.remark, config);
    this.verifyBlockTransactions(block, config);
  }

  /**
   * 校验签名
   *
   * @param block
   */
  verifySignature(block: T) {
    this.blockHelper.verifyBlockSignature(block);
  }

  /**
   * 校验区块 remark 大小
   *
   * @param block
   */
  verifyRemarkSize(block: T) {
    this.blockHelper.verifyBlockRemarkSize(block);
  }

  /**
   * 完整校验区块
   *
   * @param block
   */
  verify(block: T, config = this.config) {
    this.verifyBaseInfo(block, config);
    this.verifyRemarkSize(block);
    this.verifySignature(block);
  }

  /**生成区块的 signature */
  generateSignature(block: Block) {
    return this.blockHelper.generateSignature(block);
  }
}
