import type { Block } from "@bfchain/core-model-block";
import {
  AccountBaseHelper,
  BlockHelper,
  ConfigHelper,
  ChainTimeHelper,
  ChainAssetInfoHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
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
  @Inject(ChainAssetInfoHelper)
  protected chainAssetInfoHelper!: ChainAssetInfoHelper;
  @Inject("bfchain-core:BlockCore")
  protected blockCore!: import("@bfchain/core-block").BlockCore;
  @Inject(BlockGeneratorCalculator)
  protected blockGeneratorCalculator!: BlockGeneratorCalculator;
  @Inject("transactionGetterHelper", { dynamics: true })
  protected transactionGetterHelper!: BFChainCore.TransactionGetterHelperInterface;
  @Inject("blockGetterHelper", { dynamics: true })
  protected blockGetterHelper!: BFChainCore.BlockGetterHelperInterface;
  @Inject("accountGetterHelper", { dynamics: true })
  protected accountGetterHelper!: BFChainCore.AccountGetterHelperInterface;

  abstract verify(
    block: T,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
  ): Promise<boolean>;

  abstract verifyBlockAsset(block: T): Promise<void>;

  async verifyBlockBase(
    block: T,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
  ) {
    this.blockHelper.verifyBlockVersion(block, this.configHelper);

    // 除了重建时，应该验证区块是否存在
    if (processBlockType !== PROCESSBLOCK_TYPE.REBUILD) {
      await this.isBlockAlreadyExist(block.signature, block.height);
    }

    // 验证区块时间戳
    this.checkBlockTimestamp(block);

    // 同步时区块和交易是分开获取的，先校验区块本体，在校验区块和交易
    // 校验区块和块内交易基本信息
    // await this.verifyBlockWithTransactions(block, processBlockType);

    // 校验区块前块 signature
    if (block.height !== 1) {
      await this.checkPreviousBlock(block);
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
    const { height, generatorPublicKey, generatorSecondPublicKey, signature, signSignature } =
      block;

    const generatorAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      generatorPublicKey,
    );
    if (!generatorInfo) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: `delegate with address ${generatorAddress}`,
        target: "blockChain",
      });
    }

    if (generatorInfo.secondPublicKey) {
      if (!(generatorSecondPublicKey && signSignature)) {
        throw new ConsensusException(ERROR_LIST.BLOCK_SIGN_SIGNATURE_IS_REQUIRED, {
          signature,
          generatorAddress,
          height,
        });
      }

      if (generatorInfo.secondPublicKey !== generatorSecondPublicKey) {
        throw new ConsensusException(ERROR_LIST.BLOCK_GENERATOR_SECOND_PUBLICKEY_ALREADY_CHANGE, {
          signature,
          generatorAddress,
          height,
        });
      }
    } else {
      if (generatorSecondPublicKey) {
        throw new ConsensusException(ERROR_LIST.BLOCK_SHOULD_NOT_HAVE_GENERATOR_SECOND_PUBLICKEY, {
          signature,
          generatorAddress,
          height,
        });
      }
      if (signSignature) {
        throw new ConsensusException(ERROR_LIST.BLOCK_SHOULD_NOT_HAVE_SIGN_SIGNATURE, {
          signature,
          generatorAddress,
          height,
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
    }
  }

  /**
   * 指定的区块是否已经存在
   *
   * @param signature
   * @param height
   */
  async isBlockAlreadyExist(signature: string, height: number) {
    const blockGetterHelper = this.blockGetterHelper;
    if (typeof blockGetterHelper.getCountBlock !== "function") {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "getCountBlock",
        target: "blockGetterHelper",
      });
    }
    const count = await blockGetterHelper.getCountBlock({ signature });
    if (count > 0) {
      throw new ConsensusException(ERROR_LIST.ALREADY_EXIST, {
        prop: `Block with signature ${signature}`,
        target: "blockChain",
        errorId: `Block already exists: ${signature} height: ${height}`,
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
   */
  async checkPreviousBlock(block: T) {
    const blockGetterHelper = this.blockGetterHelper;
    if (typeof blockGetterHelper.chainBlockFork !== "function") {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "chainBlockFork",
        target: "blockGetterHelper",
      });
    }
    const { height, previousBlockSignature, timestamp } = block;
    const lastBlock = await blockGetterHelper.getBlockByHeight(height - 1);
    if (!lastBlock) {
      throw new ConsensusException(ERROR_LIST.NOT_EXIST, {
        prop: `Block with height ${height - 1}`,
        target: "blockChain",
      });
    }
    const __signature = lastBlock.signature;
    if (previousBlockSignature !== __signature) {
      // 记录分叉区块信息
      await blockGetterHelper.chainBlockFork(block, BLOCK_FORK_CAUSE.DIFFERENT_PRE_BLOCK_SIGNATURE);
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `previousBlockSignature: ${previousBlockSignature}`,
        be_compare_prop: `__signature: ${__signature}`,
        to_target: `block ${height}`,
        be_target: `lastBlock ${lastBlock.height}`,
      });
    }

    // 当前区块的时间戳最小为 上一个区块的时间戳 + 时间间隔
    const { timeHelper } = this;
    const blockSlotNumber = timeHelper.getSlotNumberByTimestamp(timestamp);
    const calcBlockSlotNumber = timeHelper.getNextSlotNumberByTimestamp(lastBlock.timestamp);
    if (blockSlotNumber < calcBlockSlotNumber) {
      throw new ConsensusException(ERROR_LIST.PROP_SHOULD_GT_FIELD, {
        prop: `timestamp ${timestamp}`,
        target: "block",
        field: `lastBlock timestamp ${lastBlock.timestamp}`,
      });
    }
  }

  /**
   * 校验打块账户
   *
   * @param block
   */
  async isValidBlockSlot(block: T) {
    const { timeHelper, blockGeneratorCalculator, blockGetterHelper } = this;

    const generatorAddress = await this.accountBaseHelper.getAddressFromPublicKeyString(
      block.generatorPublicKey,
    );
    const currentSlot = timeHelper.getSlotNumberByTimestamp(block.timestamp);
    const lastBlock = await blockGetterHelper.getLastBlock();
    const calcResult = await blockGeneratorCalculator.calcGenerateBlockGenerator(
      {
        timestamp: lastBlock.timestamp,
        height: lastBlock.height,
      },
      { toTimestamp: block.timestamp, blockGetterHelper },
    );
    if (calcResult.address !== generatorAddress) {
      throw new ConsensusException(ERROR_LIST.INVALID_BLOCK_GENERATOR, {
        reason: `lastBlock.timestamp: ${lastBlock.timestamp} lastBlock.height: ${
          lastBlock.height
        }, block.timestamp: ${block.timestamp} curTime: ${timeHelper.getTimeByTimestamp(
          block.timestamp,
        )} 该区块的打块人校验不通过，区块signature：${block.signature} height: ${
          block.height
        } 当前slot为${currentSlot}，当前应该由委托人${
          calcResult.address
        }打块，实际是由${generatorAddress}打块，校验无法通过`,
      });
    }
  }

  checkMaxBeginBalanceAndMaxTxCount(block: T, tickResult: BFChainCore.TickResultInfo) {
    return true;
  }

  /**
   * 块内资产变动 hash
   *
   * @param height
   * @param hash
   */
  async checkAssetChangeHash(height: number, hash?: string) {
    const assetChanges = await this.accountGetterHelper.getAccountsAssetsChange(height);
    const calcHash = await this.blockHelper.calcAssetChangeHash(assetChanges);
    if (calcHash !== hash) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `assetChangeHash ${hash}`,
        be_compare_prop: `assetChangeHash ${calcHash}`,
        to_target: "block",
        be_target: "calculate",
      });
    }
  }
}
