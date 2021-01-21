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
  BLOCK_SIGN_SIGNATURE_IS_REQUIRED,
  BLOCK_GENERATOR_SECOND_PUBLICKEY_ALREADY_CHANGE,
  BLOCK_SHOULD_NOT_HAVE_GENERATOR_SECOND_PUBLICKEY,
  BLOCK_SHOULD_NOT_HAVE_SIGN_SIGNATURE,
} from "@bfchain/core-util-exception";
import type { Block } from "@bfchain/core-model-block";
import { TRANSACTION_ASSET_CHANGE_ACCOUNT_TYPE } from "@bfchain/core-model-transaction";
import { Inject } from "@bfchain/util";
import { BlockGeneratorCalculator } from "@bfchain/core-block";
import { BLOCK_FORK_CAUSE } from "@bfchain/core-model";

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
  @Inject("transactionGetterHelper", { optional: true, dynamics: true })
  protected transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface;
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;

  abstract verify(
    block: T,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
  ): Promise<boolean>;

  abstract verifyBlockAsset(
    block: T,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
    blockGetterHelper?: BFChainCore.BlockGetterHelperInterface,
  ): Promise<void>;

  abstract checkMaxBeginBalanceAndMaxTxCount(
    block: T,
    tickResult: BFChainCore.TickResultInfo,
  ): void;

  async verifyBlockBase(
    block: T,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
    transactionGetterHelper = this.transactionGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "logicVerify",
    } as const;
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    // 除了重建时，应该验证区块是否存在
    if (processBlockType !== PROCESSBLOCK_TYPE.REBUILD) {
      await this.isBlockAlreadyExist(block.signature, block.height, blockGetterHelper);
    }

    // 验证区块时间戳
    this.checkBlockTimestamp(block);

    // 同步时区块和交易是分开获取的，先校验区块本体，在校验区块和交易
    // 校验区块和块内交易基本信息
    // await this.verifyBlockWithTransactions(block, processBlockType);

    // 校验区块前块 signature
    if (block.height !== 1) {
      await this.checkPreviousBlock(block, blockGetterHelper);
    }

    // 校验区块的二次签名
    await this.checkSecondPublicKey(block, generatorInfo);
  }

  /**
   * 校验区块的二次签名
   *
   * @param block
   * @param generatorInfo
   */
  async checkSecondPublicKey(block: T, generatorInfo: BFChainCore.AccountInfo) {
    const Function_Exception_Detail = {
      function: "checkSecondPublicKey",
    } as const;

    const {
      height,
      generatorPublicKey,
      generatorSecondPublicKey,
      signature,
      signSignature,
    } = block;

    const generatorAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      generatorPublicKey,
    );
    if (!generatorInfo) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `delegate with address ${generatorAddress}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (generatorInfo.secondPublicKey) {
      if (!(generatorSecondPublicKey && signSignature)) {
        throw new ConsensusException(BLOCK_SIGN_SIGNATURE_IS_REQUIRED, {
          signature,
          generatorAddress,
          height,
          ...Function_Exception_Detail,
        });
      }

      if (generatorInfo.secondPublicKey !== generatorSecondPublicKey) {
        throw new ConsensusException(BLOCK_GENERATOR_SECOND_PUBLICKEY_ALREADY_CHANGE, {
          signature,
          generatorAddress,
          height,
          ...Function_Exception_Detail,
        });
      }
    } else {
      if (generatorSecondPublicKey) {
        throw new ConsensusException(BLOCK_SHOULD_NOT_HAVE_GENERATOR_SECOND_PUBLICKEY, {
          signature,
          generatorAddress,
          height,
          ...Function_Exception_Detail,
        });
      }
      if (signSignature) {
        throw new ConsensusException(BLOCK_SHOULD_NOT_HAVE_SIGN_SIGNATURE, {
          signature,
          generatorAddress,
          height,
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验区块的时间戳
   *
   * @param block
   */
  checkBlockTimestamp(block: T) {
    const { timeHelper } = this;
    const nowTimestamp = timeHelper.getTimestamp();
    const trsSlot = timeHelper.getSlotNumberByTimestamp(block.timestamp);
    const nowSlot = timeHelper.getSlotNumberByTimestamp(nowTimestamp);
    if (trsSlot > nowSlot) {
      console.debug(
        `Block timestamp in future. Block time is ahead of the time on the server, block timestamp ${block.timestamp}, block timestamp slot ${trsSlot}, blockChain now timestamp ${nowTimestamp}, blockChain now timestamp slot ${nowSlot}`,
      );
      // throw new ConsensusException(INVALID_BLOCK_TIMESTAMP, {
      //   reason: `Block timestamp in future. Block time is ahead of the time on the server, block timestamp ${block.timestamp}, block timestamp slot ${trsSlot}, blockChain now timestamp ${nowTimestamp}, blockChain now timestamp slot ${nowSlot}`,
      //   signature: block.signature,
      //   height: block.height,
      //   generatorPublicKey: block.generatorPublicKey,
      //   function: "checkBlockTimestamp",
      // });
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
      await blockGetterHelper.chainBlockFork(block, BLOCK_FORK_CAUSE.DIFFERENT_PRE_BLOCK_SIGNATURE);
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `previousBlockSignature: ${previousBlockSignature}`,
        be_compare_prop: `__signature: ${__signature}`,
        to_target: `block ${height}`,
        be_target: `lastBlock ${lastBlock.height}`,
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
    const calcResult = await blockGeneratorCalculator.calcGenerateBlockDelegate(
      {
        timestamp: lastBlock.timestamp,
        height: lastBlock.height,
      },
      { toTimestamp: block.timestamp, blockGetterHelper },
    );
    if (calcResult.address !== generatorAddress) {
      throw new ConsensusException(INVALID_BLOCK_GENERATOR, {
        reason: `lastBlock.timestamp: ${lastBlock.timestamp} lastBlock.height: ${
          lastBlock.height
        }, block.timestamp: ${block.timestamp} curTime: ${timeHelper.getTimeByTimestamp(
          block.timestamp,
        )} 该区块的打块人校验不通过，区块signature：${block.signature} height: ${
          block.height
        } 当前slot为${currentSlot}，当前应该由委托人${
          calcResult.address
        }打块，实际是由${generatorAddress}打块，校验无法通过`,
        ...Function_Exception_Detail,
      });
    }

    const blockRoundOfflineGeneratersHashMap = block.roundOfflineGeneratersHashMap;
    for (const [
      roundOffset,
      calcRoundOfflineGeneraters,
    ] of calcResult.roundOfflineGeneratersReadonlyMap) {
      if (!blockRoundOfflineGeneratersHashMap[roundOffset]) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "roundOfflineGeneratersHashMap",
          be_compare_prop: "roundOfflineGeneratersHashMap",
          to_target: "calcGenerateBlockDelegate",
          be_target: `block with height ${block.height}, signature ${block.signature}`,
          ...Function_Exception_Detail,
        });
      }
      if (
        calcRoundOfflineGeneraters.join(",") !== blockRoundOfflineGeneratersHashMap[roundOffset]
      ) {
        const blockRoundOfflineGeneraters = blockRoundOfflineGeneratersHashMap[roundOffset].split(
          ",",
        );
        if (calcRoundOfflineGeneraters.length !== blockRoundOfflineGeneraters.length) {
          throw new ConsensusException(NOT_MATCH, {
            to_compare_prop: `calcRoundOfflineGeneraters.length: ${calcRoundOfflineGeneraters.length}`,
            be_compare_prop: `blockRoundOfflineGeneraters.length: ${blockRoundOfflineGeneraters.length}`,
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
  }

  /**
   * 校验新生成的受托人
   *
   * @param height
   * @param transactionGetterHelper
   */
  async checkNewDelegates(
    height: number,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
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
}
