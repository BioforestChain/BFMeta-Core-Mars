import {
  AccountBaseHelper,
  BlockHelper,
  ConfigHelper,
  ChainTimeHelper,
  MilestonesHelper,
  ChainAssetInfoHelper,
  StatisticsInfo,
} from "@bfchain/core-helper";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  ALREADY_EXIST,
  NOT_MATCH,
  PROP_SHOULD_GT_FIELD,
  PROP_SHOULD_LTE_FIELD,
  INVALID_BLOCK_GENERATOR,
  PROP_IS_INVALID,
} from "@bfchain/core-util-exception";
import type { Block } from "@bfchain/core-model-block";
import { TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE } from "@bfchain/core-model-transaction";
import { Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "@bfchain/core-block";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BlockLogicVerifier",
);

/**processBlock时的类型 */
export enum PROCESSBLOCK_TYPE {
  /**同步 */
  SYNC = 1,
  /**重建 */
  REBUILD = 2,
  /**生成区块 */
  GENERATEBLOCK = 3,
}

export abstract class BlockLogicVerifier<T extends Block<any> = Block<any>> {
  @Inject(BlockHelper)
  blockHelper!: BlockHelper;
  @Inject(AccountBaseHelper)
  protected accountBaseHelper!: AccountBaseHelper;
  @Inject(ConfigHelper)
  protected configHelper!: ConfigHelper;
  @Inject(ChainTimeHelper)
  protected timeHelper!: ChainTimeHelper;
  @Inject(MilestonesHelper)
  protected milestonesHelper!: MilestonesHelper;
  @Inject(ChainAssetInfoHelper)
  protected chainAssetInfoHelper!: ChainAssetInfoHelper;
  @Inject("bfchain-core:BlockCore")
  protected blockCore!: import("@bfchain/core-block").BlockCore;
  @Inject(BlockGeneratorCalculator)
  protected blockGeneratorCalculator!: BlockGeneratorCalculator;
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
  @Inject("transactionGetterHelper", { optional: true, dynamics: true })
  protected transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface;

  abstract verify(
    block: T,
    processBlockType: PROCESSBLOCK_TYPE,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ): Promise<boolean>;

  abstract verifyBlockRemark(
    block: T,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ): Promise<void>;

  abstract checkMaxBeginBalanceAndMaxTxCount(
    block: T,
    tickResult: BFChainCore.TickResultInfo,
  ): void;

  async verifyBlockBase(
    block: T,
    processBlockType: PROCESSBLOCK_TYPE,
    blockGetterHelper = this.blockGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "logicVerify",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    // 除了重建时，应该验证区块是否存在
    if (processBlockType !== PROCESSBLOCK_TYPE.REBUILD) {
      await this.isBlockAlreadyExist(block.signature, block.height, blockGetterHelper);
    }

    // 同步时区块和交易是分开获取的，先校验区块本体，在校验区块和交易
    // 校验区块和块内交易基本信息
    // await this.verifyBlockWithTransactions(block, processBlockType);

    // 校验区块前块 signature
    if (block.height !== 1) {
      await this.checkPreviousBlock(block, blockGetterHelper);
    }
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
    blockGetterHelper = this.blockGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isBlockAlreadyExist",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (typeof blockGetterHelper.getCountBlock !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "getCountBlock",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const count = await blockGetterHelper.getCountBlock({ signature });
    if (count > 0) {
      throw new ConsensusException(ALREADY_EXIST, {
        prop: `Block with signature ${signature}`,
        target: "blockChain",
        errorId: `Block already exists: ${signature} height: ${height}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验区块和块内交易
   *
   * @param block
   * @param processBlockType
   */
  async verifyBlockWithTransactions(block: T, processBlockType: PROCESSBLOCK_TYPE) {
    /**自己打块不再次验证 */
    if (processBlockType !== PROCESSBLOCK_TYPE.GENERATEBLOCK) {
      // 检验区块基本信息和签名（包括 remark size）
      await this.blockCore.getBlockFactoryFromHeight<T>(block.height).verify(block);
    }
  }

  /**
   * 校验前块信息
   *
   * @param block
   * @param blockGetterHelper
   */
  async checkPreviousBlock(block: T, blockGetterHelper = this.blockGetterHelper) {
    const Function_Exception_Detail = {
      function: "checkPreviousBlock",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (typeof blockGetterHelper.chainBlockFork !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "chainBlockFork",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const { height, previousBlockSignature, timestamp } = block;
    const lastBlock = await blockGetterHelper.getBlockByHeight(height - 1);
    if (!lastBlock) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Block with height ${height - 1}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
    const __signature = lastBlock.signature;
    if (previousBlockSignature !== __signature) {
      // 记录分叉区块信息
      await blockGetterHelper.chainBlockFork(block, 1);
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "previousBlock",
        be_compare_prop: "chainpreviousBlock",
        to_target: "block",
        be_target: "lastBlock",
        ...Function_Exception_Detail,
      });
    }

    // 当前区块的时间戳最小为 上一个区块的时间戳 + 时间间隔
    const { timeHelper } = this;
    const blockSlotNumber = timeHelper.getSlotNumberByTimestamp(timestamp);
    const calcBlockSlotNumber = timeHelper.getNextSlotNumberByTimestamp(lastBlock.timestamp);
    if (blockSlotNumber < calcBlockSlotNumber) {
      throw new ConsensusException(PROP_SHOULD_GT_FIELD, {
        prop: `timestamp ${timestamp}`,
        target: "block",
        field: `lastBlock timestamp ${lastBlock.timestamp}`,
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 校验打块账户
   *
   * @param block
   * @param blockGetterHelper
   */
  async isValidBlockSlot(block: T, blockGetterHelper = this.blockGetterHelper) {
    const Function_Exception_Detail = {
      function: "isValidBlockSlot",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const { timeHelper, blockGeneratorCalculator } = this;

    const generatorAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      block.generatorPublicKey,
    );
    const currentSlot = timeHelper.getSlotNumberByTimestamp(block.timestamp);
    const lastBlock = await blockGetterHelper.getLastBlock();
    const calcGenerateBlockDelegateGenerator = blockGeneratorCalculator.calcGenerateBlockDelegateGenerator(
      {
        timestamp: lastBlock.timestamp,
        height: lastBlock.height,
      },
    );
    let _roundOfflineGeneratersHashMap!: BFChainCore.RoundOfflineGeneratersHashMap;
    for await (const result of calcGenerateBlockDelegateGenerator) {
      // 这里不要去解构 roundOfflineGeneratersHashMap 会消耗非常多的性能
      const { address, timestamp } = result;
      if (timestamp > block.timestamp) {
        // 时间戳在推进的过程中不该出现大于新区块的时间戳，必须是forgeInterval的倍数
        throw new ConsensusException();
      }
      if (timestamp === block.timestamp) {
        _roundOfflineGeneratersHashMap = result.roundOfflineGeneratersHashMap;
        if (address !== generatorAddress) {
          throw new ConsensusException(INVALID_BLOCK_GENERATOR, {
            reason: `lastBlock.timestamp: ${lastBlock.timestamp} lastBlock.height: ${
              lastBlock.height
            }, block.timestamp: ${block.timestamp} curTime: ${timeHelper.getTimeByTimestamp(
              block.timestamp,
            )} 该区块的打块人校验不通过，区块signature：${block.signature} height: ${
              block.height
            } 当前slot为${currentSlot}，当前应该由委托人${address}打块，实际是由${generatorAddress}打块，校验无法通过`,
            ...Function_Exception_Detail,
          });
        }
        break;
      }
    }

    const blockRoundOfflineGeneratersHashMap = block.roundOfflineGeneratersHashMap;
    for (const roundOffset in _roundOfflineGeneratersHashMap) {
      if (!blockRoundOfflineGeneratersHashMap[roundOffset]) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "roundOfflineGeneratersHashMap",
          be_compare_prop: "roundOfflineGeneratersHashMap",
          to_target: "calcGenerateBlockDelegate",
          be_target: `block with height ${block.height}, signature ${block.signature}`,
          ...Function_Exception_Detail,
        });
      }
      const calcRoundOfflineGeneraters = _roundOfflineGeneratersHashMap[roundOffset].split(",");
      const blockRoundOfflineGeneraters = blockRoundOfflineGeneratersHashMap[roundOffset].split(
        ",",
      );
      if (calcRoundOfflineGeneraters.length !== blockRoundOfflineGeneraters.length) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "roundOfflineGeneratersHashMap",
          be_compare_prop: "roundOfflineGeneratersHashMap",
          to_target: "calcGenerateBlockDelegate",
          be_target: `block with height ${block.height}, signature ${block.signature}`,
          ...Function_Exception_Detail,
        });
      }
      for (const generator of calcRoundOfflineGeneraters) {
        // 正常来说如果掉线顺序不一致也是错误的
        if (!blockRoundOfflineGeneraters.includes(generator)) {
          throw new ConsensusException(NOT_EXIST, {
            prop: `offlineGenerater ${generator}`,
            target: `block.roundOfflineGeneratersHashMap with height ${block.height}, signature ${block.signature}`,
            ...Function_Exception_Detail,
          });
        }
      }
    }
  }

  /**
   * 校验新生成的受托人
   *
   * @param height
   * @param transactionGetterHelper
   */
  async checkNewDelegates(height: number, transactionGetterHelper = this.transactionGetterHelper) {
    const Function_Exception_Detail = {
      function: "checkNewDelegates",
    } as const;
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const round = this.blockHelper.calcRoundByHeight(height);
    const newDelegates = await transactionGetterHelper.getNewDelegates(height);
    const { delegates, maxDelegateTxsPerRound } = this.configHelper;
    const delegateCount = newDelegates.length;
    if (round === 1) {
      if (delegateCount > maxDelegateTxsPerRound + delegates) {
        throw new ConsensusException(PROP_SHOULD_LTE_FIELD, {
          prop: `delegateCount ${delegateCount}`,
          target: "block",
          field: `maxDelegateTxsPerRound ${maxDelegateTxsPerRound + delegates}`,
          ...Function_Exception_Detail,
        });
      }
    } else {
      if (delegateCount > maxDelegateTxsPerRound) {
        throw new ConsensusException(PROP_SHOULD_LTE_FIELD, {
          prop: `delegateCount ${delegateCount}`,
          target: "block",
          field: `maxDelegateTxsPerRound ${maxDelegateTxsPerRound}`,
          ...Function_Exception_Detail,
        });
      }
    }
    return newDelegates;
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
    const Function_Exception_Detail = {
      function: "verifyTransactionAssetChange",
    } as const;
    const { transactionAssetChanges, transaction } = trsInBlock;
    const calTransactionAssetChanges: {
      [assetTypeAndAccountType: string]: string;
    } = {};
    for (const address in applyResult) {
      const addressApplyResult = applyResult[address];
      for (const magicAndAssetType in addressApplyResult) {
        const asset = addressApplyResult[magicAndAssetType];
        const keyArray = magicAndAssetType.split("_");
        if (keyArray.length !== 2) {
          throw new ConsensusException(PROP_IS_INVALID, {
            prop: `key ${magicAndAssetType}`,
            target: "applyResult",
            ...Function_Exception_Detail,
          });
        }
        const chainAssetInfo = this.chainAssetInfoHelper.getAssetInfo(keyArray[0], keyArray[1]);
        const assetStatistic = statisticsInfo.getAssetStatistic(chainAssetInfo);
        if (!assetStatistic) {
          throw new ConsensusException(NOT_EXIST, {
            prop: "assetStatistic",
            target: "statisticsInfo",
            ...Function_Exception_Detail,
          });
        }
        const index = assetStatistic.index;
        if (transaction.senderId === address) {
          calTransactionAssetChanges[
            `${index}_${TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.SENDER}`
          ] = asset;
        } else {
          calTransactionAssetChanges[
            `${index}_${TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE.RECIPIENT}`
          ] = asset;
        }
      }
    }
    for (const assetChange of transactionAssetChanges) {
      const { assetTypes, accountType, assetBalance } = assetChange;
      const key = `${assetTypes}_${accountType}`;
      if (!calTransactionAssetChanges[key]) {
        throw new ConsensusException(NOT_EXIST, {
          prop: `${assetTypes}_${accountType}`,
          target: "calTransactionAssetChanges",
          ...Function_Exception_Detail,
        });
      }
      if (assetBalance !== calTransactionAssetChanges[key]) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `assetBalance${assetBalance}`,
          be_compare_prop: `assetBalance${calTransactionAssetChanges[key]}`,
          to_target: "transactionAssetChanges",
          be_target: "calTransactionAssetChanges",
          ...Function_Exception_Detail,
        });
      }
    }
  }
}
