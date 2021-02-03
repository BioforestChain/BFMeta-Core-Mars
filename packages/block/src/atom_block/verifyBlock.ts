import type { Block } from "@bfchain/core-model-block";
import {
  TransactionInBlock,
  TRANSACTION_TYPES_BASE,
  TransferAssetTransaction,
  TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE,
  TransactionAssetChangeModel,
} from "@bfchain/core-model-transaction";
import {
  BlockHelper,
  BaseHelper,
  ConfigHelper,
  AsymmetricHelper,
  ChainAssetInfoHelper,
  BlockBaseStatisticsHelper,
  AccountBaseHelper,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  PARAM_LOST,
  PROP_IS_INVALID,
  PROP_IS_REQUIRE,
  NOT_MATCH,
  PROP_SHOULD_EQ_FIELD,
  PROP_SHOULD_LTE_FIELD,
  TOO_LARGE,
  SHOULD_NOT_DUPLICATE,
} from "@bfchain/core-util-exception";
import { QueneEventEmitter, Injectable, Inject } from "@bfchain/util";
import { CommonBlockVerify } from "./commonBlockVerify";
const {
  ArgumentIllegalException,
  ArgumentFormatException,
  ConsensusException,
} = CoreExceptionGenerator("CONTROLLER", "_blockbase");

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
    public accountBaseHelper: AccountBaseHelper,
    @Inject("cryptoHelper")
    public cryptoHelper: BFChainCore.CryptoHelperInterface,
  ) {}

  async verify(block: T, config = this.config) {
    await this.commonBlockVerify.verifyBlockBody(block, block.remark);
    await this.verifyBlockDerivativeInfo(block, config);
    // 只有创世块才能验证块内事件，其他区块只能通过 replayBlock 验证
    if (block.height === 1) {
      await this.verifyBlockTransactions(block, config);
    }
    await this.commonBlockVerify.verifySignature(block);
  }

  /**
   * 验证区块内交易
   *
   * @param block
   * @param config
   */
  async verifyBlockTransactions(block: T, config = this.config) {
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
        to_compare_prop: `numberOfTransactions ${block.numberOfTransactions}`,
        be_compare_prop: `transactions length ${totalTransaction}`,
        to_target: "block",
        be_target: "block",
        ...Block_Exception_Detail,
      });
    }

    if (totalTransaction > config.maxTPSPerBlock * config.forgeInterval) {
      throw new ArgumentFormatException(PROP_SHOULD_LTE_FIELD, {
        prop: `transactions length ${totalTransaction}`,
        field: `maxTrsPerBlock ${config.maxTPSPerBlock * config.forgeInterval}`,
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
        prop: `totalAmount ${totalAmount}`,
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
        prop: `totalFee ${totalFee}`,
        type: "asset number",
        ...Block_Exception_Detail,
      });
    }

    //#region 模拟账户表的变更
    const accountAssetMap = new Map<string, bigint>();
    const genesisAddress = await this.accountBaseHelper.getAddressFromPublicKey(
      block.generatorPublicKeyBuffer,
    );
    accountAssetMap.set(
      `${genesisAddress}_${config.magic}_${config.assetType}`,
      BigInt(config.genesisAmount),
    );

    function getAccountAssetKey(address: string, magic: string, assetType: string) {
      return `${address}_${magic}_${assetType}`;
    }

    function setAccountAsset(key: string, assetNumber: bigint) {
      const remainAsset = accountAssetMap.get(key);
      if (remainAsset) {
        accountAssetMap.set(key, remainAsset + assetNumber);
      } else {
        accountAssetMap.set(key, assetNumber);
      }
    }

    function getAccountAsset(key: string): string {
      const assetNumber = accountAssetMap.get(key);
      return assetNumber ? assetNumber.toString() : "0";
    }
    //#endregion

    const transactions = block.transactions;
    /**重复交易 */
    const trsSet = new Set<string>();
    /**所有交易的sha256hash */
    const payloadHash = this.cryptoHelper.sha256();
    /**所有交易体的总字节长度 */
    let payloadLength = 0;
    const sourceStatisticsInfoModel = block.statisticInfo;
    const eventEmitter: BFChainCore.ApplyTransactionEventEmitter = new QueneEventEmitter();
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
      // FIXME: 这里只验证创世块，一般不会涉及到主权益外的权益，所以就暂时这么做，有需要再改
      const { magic: chainMaigc, assetType: chainAssetType } = config;
      const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(chainMaigc, chainAssetType);
      const asset = statisticsInfo.getAssetStatistic(chainAssetInfo);
      if (!asset) {
        throw new Error("Statistic asset lose");
      }
      const assetIndex = asset.index;
      for (const tranItem of transactions) {
        const transaction = tranItem.transaction;
        // 验证区块内每笔交易的基本信息
        await this.transactionCore
          .getTransactionFactoryFromType(transaction.type)
          .verify(transaction, config);
        if (trsSet.has(transaction.signature)) {
          throw new ConsensusException(SHOULD_NOT_DUPLICATE, {
            prop: `transaction with signature ${transaction.signature}`,
            target: `block with height ${block.height}`,
            ...Function_Exception_Detail,
          });
        }
        trsSet.add(transaction.signature);

        // 校验 TIB 签名
        if (
          !(await this.asymmetricHelper.detachedVeriy(
            tranItem.getBytes(true, true),
            tranItem.signatureBuffer,
            block.generatorPublicKeyBuffer,
          ))
        ) {
          throw new ArgumentFormatException(`Invalid transactionInBlock signature`);
        }
        // 校验 TIB 安全签名
        if (block.generatorSecondPublicKeyBuffer) {
          if (!tranItem.signSignatureBuffer) {
            throw new ArgumentFormatException(PROP_IS_REQUIRE, {
              prop: "signSignature",
              target: "transactionInBlock",
              ...Function_Exception_Detail,
            });
          }
          if (
            !(await this.asymmetricHelper.detachedVeriy(
              tranItem.getBytes(false, true),
              tranItem.signSignatureBuffer,
              block.generatorSecondPublicKeyBuffer,
            ))
          ) {
            throw new ArgumentFormatException(`Invalid transactionInBlock signSignature`);
          }
        }
        // 计算权益变动
        const trs = tranItem.transaction;
        const { type, senderId, recipientId, fromMagic, fee } = trs;
        let calcTransactionAssetChanges: TransactionAssetChangeModel[] = [];
        const key = getAccountAssetKey(senderId, fromMagic, chainAssetType);
        let amount = "0";
        if (type.includes(TRANSACTION_TYPES_BASE.TRANSFER_ASSET)) {
          amount = (trs as TransferAssetTransaction).asset.transferAsset.amount;
        }
        const totalSpend = BigInt("-" + amount) + BigInt("-" + fee);
        setAccountAsset(key, totalSpend);
        calcTransactionAssetChanges[
          calcTransactionAssetChanges.length
        ] = TransactionAssetChangeModel.fromObject<TransactionAssetChangeModel>({
          accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER,
          assetTypes: assetIndex,
          assetBalance: getAccountAsset(key),
        });
        if (recipientId) {
          const rkey = getAccountAssetKey(recipientId, fromMagic, chainAssetType);
          setAccountAsset(rkey, BigInt(amount));
          calcTransactionAssetChanges[
            calcTransactionAssetChanges.length
          ] = TransactionAssetChangeModel.fromObject<TransactionAssetChangeModel>({
            accountType: TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.RECIPIENT,
            assetTypes: assetIndex,
            assetBalance: getAccountAsset(rkey),
          });
        }
        calcTransactionAssetChanges = this.transactionCore.transactionHelper.sortTransactionAssetChanges(
          calcTransactionAssetChanges,
        );
        const transactionAssetChanges = tranItem.transactionAssetChanges;
        const calcLength = calcTransactionAssetChanges.length;
        const realLength = transactionAssetChanges.length;
        if (calcLength !== realLength) {
          throw new ArgumentIllegalException(NOT_MATCH, {
            to_compare_prop: `transactionAssetChanges lenght ${realLength}`,
            be_compare_prop: `transactionAssetChanges lenght ${calcLength}`,
            to_target: `transactionInBlock ${trs.senderId} ${trs.signature}`,
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
              to_target: `transactionInBlock ${trs.senderId} ${trs.signature}`,
              be_target: "calculate",
              ...Function_Exception_Detail,
            });
          }
        }
        // 生产交易二进制数据
        const tranItemBinary = TransactionInBlock.encode(tranItem).finish();
        // 更新hash
        payloadHash.update(tranItemBinary);
        // 更新总字节长度
        payloadLength += tranItemBinary.length;
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
        prop: `totalAmount ${totalAmount}`,
        field: stotalAmount.toString(),
        ...Block_Exception_Detail,
      });
    }

    if (stotalFee !== BigInt(totalFee)) {
      throw new ArgumentIllegalException(PROP_SHOULD_EQ_FIELD, {
        prop: `totalFee ${totalFee}`,
        field: stotalFee,
        ...Block_Exception_Detail,
      });
    }

    if (block.payloadLength !== payloadLength) {
      throw new ArgumentIllegalException(PROP_SHOULD_EQ_FIELD, {
        prop: `payloadLength ${block.payloadLength}`,
        field: payloadLength,
        ...Block_Exception_Detail,
      });
    }

    if (payloadLength > config.maxBlockSize) {
      throw new ArgumentIllegalException(TOO_LARGE, {
        prop: "payloadLength",
        reason: `payloadLength: ${payloadLength} max: ${config.maxBlockSize}`,
        ...Block_Exception_Detail,
      });
    }

    const payloadHashHex = await payloadHash.digest("hex");
    if (block.payloadHash !== payloadHashHex) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `payloadHash ${payloadHashHex}`,
        be_compare_prop: `payloadHash ${block.payloadHash}`,
        to_target: `calculate`,
        be_target: `block`,
        ...Block_Exception_Detail,
      });
    }

    const numberOfTransactions = transactions.length;
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

    const blockParticipation = this.blockHelper.calcBlockParticipation({
      totalChainAsset: statisticsInfo.totalChainAsset,
      numberOfTransactions,
    });
    if (block.blockParticipation !== blockParticipation) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `blockParticipation ${block.remark.blockParticipation}`,
        be_compare_prop: `blockParticipation ${blockParticipation}`,
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
        prop: `previousBlockSignature ${block.previousBlockSignature}`,
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(block.numberOfTransactions)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `numberOfTransactions ${block.numberOfTransactions}`,
        type: "natural number",
        ...Block_Exception_Detail,
      });
    }

    if (!block.payloadHash) {
      throw new ArgumentIllegalException(PROP_IS_REQUIRE, {
        prop: `payloadHash ${block.payloadHash}`,
        ...Block_Exception_Detail,
      });
    }

    if (!baseHelper.isNaturalNumber(block.payloadLength)) {
      throw new ArgumentIllegalException(PROP_IS_INVALID, {
        prop: `payloadLength ${block.payloadLength}`,
        type: "natural number",
        ...Block_Exception_Detail,
      });
    }

    if (block.magic !== config.magic) {
      throw new ArgumentIllegalException(NOT_MATCH, {
        to_compare_prop: `block.magic ${block.magic}`,
        be_compare_prop: `genesisBlock.magic ${config.magic}`,
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
        prop: `generatorPublicKey ${block.generatorPublicKey}`,
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
        prop: `signature ${block.signature}`,
        type: "signature",
        ...Block_Exception_Detail,
      });
    }

    this.commonBlockVerify.verifyBlockReward(block);

    this.commonBlockVerify.verifyBlockSize(block);
  }
}
