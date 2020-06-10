import type { Block } from "@bfchain/core-model-block";
import { TransactionInBlock } from "@bfchain/core-model-transaction";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  NOT_MATCH,
  DUPLICATE,
  PROP_SHOULD_EQ_FIELD,
  PROP_SHOULD_LTE_FIELD,
  TOO_LARGE,
} from "@bfchain/core-util-exception";
import { QueneEventEmitter, Injectable, Inject } from "@bfchain/util";
import { CommonBlockVerify } from "./commonBlockVerify";
const { ArgumentIllegalException, ArgumentFormatException } = CoreExceptionGenerator(
  "CONTROLLER",
  "_blockbase",
);

@Injectable()
export class VerifyBlockCore<T extends Block> {
  @Inject("bfchain-core:TransactionCore")
  public transactionCore!: import("@bfchain/core-transaction").TransactionCore;
  constructor(
    public blockHelper: BlockHelper,
    public baseHelper: BaseHelper,
    public config: ConfigHelper,
    public statisticsHelper: BlockBaseStatisticsHelper,
    public asymmetricHelper: AsymmetricHelper,
    public chainAssetInfoHelper: ChainAssetInfoHelper,
    public commonBlockVerify: CommonBlockVerify<T>,
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
  ) {}

  async verify(block: T, config = this.config) {
    await this.commonBlockVerify.verifyBlockBody(block, block.remark);
    await this.verifyBlockDerivativeInfo(block, config);
    await this.verifyBlockTransactions(block, config);
    await this.commonBlockVerify.verifySignature(block);
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
      eventEmitter.taskname || `core-verify-${block.height}`,
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

    this.commonBlockVerify.verifyBlockReward(block);

    this.commonBlockVerify.verifyBlockSize(block);

    this.commonBlockVerify.verifyBlockRemarkSize(block);
  }
}
