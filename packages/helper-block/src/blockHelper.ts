import { BaseHelper } from "@bfchain/core-helper-type";
import { JSBIHelper } from "@bfchain/core-helper-bigint";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { BLOCK_TYPES_BASE, Block } from "@bfchain/core-model-block";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import {
  Injectable,
  Inject,
  getHexFromArrayBuffer,
  decodeBinaryToHex,
  BBuffer as Buffer,
} from "@bfchain/util";
type RoundLastBlock = import("@bfchain/core-model-block").RoundLastBlock;

const {
  ArgumentFormatException,
  NoFoundException,
  ArgumentIllegalException,
  OutOfRangeException,
  IllegalStateException,
  ConsensusException,
} = CoreExceptionGenerator("HELPER", "blockHelper");

@Injectable()
export class BlockHelper {
  constructor(
    public config: ConfigHelper,
    public baseHelper: BaseHelper,
    private accountBaseHelper: AccountBaseHelper,
    private jsbiHelper: JSBIHelper,
    @Inject("cryptoHelper") public cryptoHelper: BFChainCore.CryptoHelperInterface,
    @Inject("keypairHelper") public keypairHelper: BFChainCore.KeypairHelperInterface,
    @Inject("Buffer") public Buffer: BFChainUtil.BufferConstructor,
  ) {}
  @Inject("blockGetterHelper", { optional: true })
  blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;

  /**
   * 获取交易 signature
   *
   * @param block
   */
  async generateSignature(block: BFChainCore.Block) {
    return decodeBinaryToHex(await this.cryptoHelper.sha256(block.getBytes(true, true)));
  }

  /**是否是合法的区块 signature */
  isValidSignature(signature: string) {
    return this.baseHelper.isValidSignature(signature);
  }

  /**
   * 校验区块的签名是否合法
   */
  async verifyBlockSignature(
    block: BFChainCore.Block,
    opts?: {
      taskLabel?: string;
    },
  ) {
    const taskLabel = (opts && opts.taskLabel) || "Block";
    const { Buffer } = this;
    const {
      generatorPublicKeyBuffer,
      signatureBuffer,
      generatorSecondPublicKeyBuffer,
      signSignatureBuffer,
    } = block;
    // 验证 signature 与 publicKey
    const hash = await this.cryptoHelper.sha256(block.getBytes(true, true, true));
    if (
      !(await this.keypairHelper.detached_verify(hash, signatureBuffer, generatorPublicKeyBuffer))
    ) {
      throw new ArgumentFormatException(ERROR_LIST.INVALID_SIGNATURE, { taskLabel });
    }

    // 验证 signSignature 与 secondPublicKey
    if (
      (generatorSecondPublicKeyBuffer && generatorSecondPublicKeyBuffer.length > 0) ||
      (signSignatureBuffer && signSignatureBuffer.length > 0)
    ) {
      if (generatorSecondPublicKeyBuffer && signSignatureBuffer) {
        const shash = await this.cryptoHelper
          .sha256()
          .update(block.getBytes(false, true, true))
          .digest();
        if (
          !this.keypairHelper.detached_verify(
            shash,
            Buffer.from(signSignatureBuffer),
            Buffer.from(generatorSecondPublicKeyBuffer),
          )
        ) {
          throw new ArgumentFormatException(ERROR_LIST.INVALID_SIGNSIGNATURE, { taskLabel });
        }
      } else {
        throw new ArgumentFormatException(
          `Invalid ${taskLabel} miss signSignature or senderSecondPublicKey`,
        );
      }
    }
  }

  /**
   * 校验区块版本信息
   *
   * @param block
   * @param config
   */
  verifyBlockVersion(block: BFChainCore.Block, config = this.config) {
    // FIXME: 区块暂时向下兼容
    if (block.version > config.version) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `block version ${block.version}`,
        be_compare_prop: `blockChain version ${config.version}`,
        to_target: "block",
        be_target: "config",
      });
    }
  }

  /**
   * 根据区块高度获取区块类型
   *
   * @param height
   */
  parseTypeByHeight(height: number) {
    if (height === 1) {
      return BLOCK_TYPES_BASE.GENESIS;
    }
    if (height % this.config.blockPerRound === 0) {
      return BLOCK_TYPES_BASE.ROUNDEND;
    }
    return BLOCK_TYPES_BASE.COMMON;
  }

  /**获取高度对应的轮次 */
  calcRoundByHeight(height: number) {
    return Math.ceil(height / this.config.blockPerRound);
  }
  /**计算离轮末还有多少个区块数
   * `0 ~ blockPerRound-1`
   */
  calcBlockNumberToRoundEnd(cur_height: number) {
    return (
      this.config.blockPerRound -
      (cur_height % this.config.blockPerRound || this.config.blockPerRound)
    );
  }
  /**计算一轮的开始的区块高度 */
  calcRoundStartHeight(round_num: number) {
    return (round_num - 1) * this.config.blockPerRound + 1;
  }
  /**计算一轮的结束的区块高度 */
  calcRoundEndHeight(round_num: number) {
    return round_num * this.config.blockPerRound;
  }
  /**计算高度对应的一轮的起始高度 */
  calcRoundStartHeightByHeight(height: number) {
    const round_num = this.calcRoundByHeight(height);
    return this.calcRoundStartHeight(round_num);
  }
  /**计算高度对应的一轮的结束高度 */
  calcRoundEndHeightByHeight(height: number) {
    const round_num = this.calcRoundByHeight(height);
    return this.calcRoundEndHeight(round_num);
  }
  /**计算当前区块链所在的轮次 */
  calcBlockChainRoundByHeight(height: number) {
    return this.calcRoundByHeight(height + 1);
  }
  //#region block getter

  async forceGetBlockByHeight<B extends BFChainCore.Block = BFChainCore.Block>(
    height: number,
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockByHeight">
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    const block = await blockGetterHelper.getBlockByHeight(height);
    if (!block) {
      throw new ArgumentFormatException(ERROR_LIST.NOT_EXIST, {
        prop: `height:${height}`,
        target: "blocks",
      });
    }
    return block as B;
  }
  async forceGetBlockBySignature<B extends BFChainCore.Block = BFChainCore.Block>(
    signature: string,
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockBySignature">
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    const block = await blockGetterHelper.getBlockBySignature(signature);
    if (!block) {
      throw new ArgumentFormatException(ERROR_LIST.NOT_EXIST, {
        prop: `signature: ${signature}`,
        target: "blockChain",
      });
    }
    return block as B;
  }
  async forceGetBlockListByHeightRange(
    min: number,
    max: number,
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockByHeight">
      | undefined = this.blockGetterHelper,
  ) {
    const result: BFChainCore.Block[] = [];
    if (min > max) {
      throw new OutOfRangeException(ERROR_LIST.OUT_OF_RANGE, {
        variable: "min and max",
        message: `min: ${min} max: ${max}`,
      });
    }
    for (let i = min; i <= max; i++) {
      result[result.length] = await this.forceGetBlockByHeight(i, blockGetterHelper);
    }
    return result;
  }

  async forceGetBlockGeneratorAddressByHeight(
    height: number,
    blockGetterHelper:
      | Pick<
          BFChainCore.BlockGetterHelperSimpleInterface,
          "getBlockGeneratorPublicKeyBufferByHeight" | "getBlockByHeight"
        >
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    const publicKeyBuffer =
      typeof blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight === "function"
        ? await blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight(height)
        : (await this.forceGetBlockByHeight(height, blockGetterHelper)).generatorPublicKeyBuffer;
    if (!publicKeyBuffer) {
      throw new ArgumentFormatException(ERROR_LIST.NOT_EXIST, {
        prop: `height:${height}`,
        target: "generatorPublicKey",
      });
    }
    return this.accountBaseHelper.getAddressFromPublicKey(publicKeyBuffer);
  }
  async forceGetBlockSignatureBufferByHeight(
    height: number,
    blockGetterHelper:
      | Pick<
          BFChainCore.BlockGetterHelperSimpleInterface,
          "getBlockSignatureByHeight" | "getBlockByHeight"
        >
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    const signatureBuffer =
      typeof blockGetterHelper.getBlockSignatureByHeight === "function"
        ? await blockGetterHelper.getBlockSignatureByHeight(height)
        : (await this.forceGetBlockByHeight(height, blockGetterHelper)).signatureBuffer;
    if (!signatureBuffer) {
      throw new ArgumentFormatException(ERROR_LIST.NOT_EXIST, {
        prop: `height:${height}`,
        target: "generatorPublicKey",
      });
    }
    return signatureBuffer;
  }

  async forceGetBlockSignatureByHeight(
    height: number,
    blockGetterHelper:
      | Pick<
          BFChainCore.BlockGetterHelperSimpleInterface,
          "getBlockSignatureByHeight" | "getBlockByHeight"
        >
      | undefined = this.blockGetterHelper,
  ) {
    return getHexFromArrayBuffer(
      await this.forceGetBlockSignatureBufferByHeight(height, blockGetterHelper),
    );
  }

  async getLastBlock(
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getLastBlock">
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    return blockGetterHelper.getLastBlock();
  }

  async getBlocksByRange(
    minHeight: number,
    maxHeight: number,
    blockGetterHelper:
      | Required<Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlocksByRange">>
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockByHeight" | "getBlocksByRange">
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    if (!("getBlockByHeight" in blockGetterHelper) /* && blockGetterHelper.getBlocksByRange */) {
      return blockGetterHelper.getBlocksByRange(minHeight, maxHeight);
    }

    if ("getBlockByHeight" in blockGetterHelper) {
      const res: Block[] = [];
      for (let h = minHeight; h < maxHeight; h++) {
        const b = await blockGetterHelper.getBlockByHeight(h);
        if (!b) {
          break;
        }
        res.push(b);
      }
      return res;
    }
    throw new IllegalStateException(ERROR_LIST.FAILED_TO_GET_BLOCKS_BY_RANGE, {
      minHeight,
      maxHeight,
    });
  }

  async getCurrentGenerateBlock(
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getCurrentGenerateBlock">
      | undefined = this.blockGetterHelper,
  ) {
    if (blockGetterHelper && blockGetterHelper.getCurrentGenerateBlock) {
      return blockGetterHelper.getCurrentGenerateBlock();
    }
  }
  async getCurrentReplayingBlockInfo<
    CC extends BFChainCore.SimpleChainChannel = BFChainCore.SimpleChainChannel,
  >(
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperInterface<CC>, "getCurrentReplayingBlockInfo">
      | undefined = this.blockGetterHelper,
  ) {
    if (blockGetterHelper && blockGetterHelper.getCurrentReplayingBlockInfo) {
      return blockGetterHelper.getCurrentReplayingBlockInfo();
    }
  }

  //#endregion

  /**
   * 当前正在处理中的区块
   * 可以是锻造中的,也可以是同步中的
   */
  async getCurrentProcessingBlockPlotChecker(
    blockGetterHelper:
      | Pick<
          BFChainCore.BlockGetterHelperSimpleInterface,
          "getCurrentGenerateBlock" | "getCurrentReplayingBlockInfo"
        >
      | undefined = this.blockGetterHelper,
  ): Promise<BFChainCore.BlockPlotChecker | undefined> {
    const generatingBlock = await this.getCurrentGenerateBlock();
    if (generatingBlock) {
      return this.parseNewBlockToPlotChecker(generatingBlock);
    }
    const replayingBlock = await this.getCurrentReplayingBlockInfo(blockGetterHelper);
    if (replayingBlock) {
      return this.parseBlockToPlotChecker(
        replayingBlock.replayingBlock || replayingBlock.currentBlock,
      );
    }
  }
  private _BTC_BLOCK_WM = new WeakMap<BFChainCore.BlockPlotChecker, BFChainCore.Block>();
  private _BLOCK_BTC_WM = new WeakMap<BFChainCore.Block, BFChainCore.BlockPlotChecker>();
  parseBlockToPlotChecker(block: BFChainCore.Block) {
    let blockPlotChecker = this._BLOCK_BTC_WM.get(block);
    if (!blockPlotChecker) {
      blockPlotChecker = {
        height: block.height,
        timestamp: block.timestamp,
        /**参与度 */
        get blockParticipation() {
          Object.defineProperty(this, "blockParticipation", {
            value: BigInt(block.blockParticipation),
          });
          return this.blockParticipation;
        },
        /**交易量 */
        numberOfTransactions: block.numberOfTransactions,
        /**手续费 */
        get totalFee() {
          Object.defineProperty(this, "totalFee", {
            value: BigInt(block.totalFee),
          });
          return this.totalFee;
        },
        /**区块signature,如果没有signature,就用`ff*128` */
        signature: block.signature,
        previousBlockSignature: block.previousBlockSignature,
      } as BFChainCore.BlockPlotChecker;
      this._BLOCK_BTC_WM.set(block, blockPlotChecker);
      this._BTC_BLOCK_WM.set(blockPlotChecker, block);
    }
    return blockPlotChecker;
  }

  getBlockFromPlotChecker(blockPlotChecker: BFChainCore.BlockPlotChecker) {
    return this._BTC_BLOCK_WM.get(blockPlotChecker);
  }

  parseNewBlockToPlotChecker(
    newBlock: BFChainCore.NewBlockArgJSON | BFChainCore.CurrentGeneratingBlockInfo,
  ) {
    return {
      height: newBlock.height,
      timestamp: newBlock.timestamp,
      /**参与度 */
      get blockParticipation() {
        Object.defineProperty(this, "blockParticipation", {
          value: BigInt(newBlock.blockParticipation),
        });
        return this.blockParticipation;
      },
      /**交易量 */
      numberOfTransactions: newBlock.numberOfTransactions,
      /**手续费 */
      get totalFee() {
        Object.defineProperty(this, "totalFee", {
          value: BigInt(newBlock.totalFee),
        });
        return this.totalFee;
      },
      /**区块signature,如果没有signature,就用`ff*128` */
      signature: "signature" in newBlock ? newBlock.signature : "ff".repeat(64),
      previousBlockSignature: newBlock.previousBlockSignature,
    } as BFChainCore.BlockPlotChecker;
  }

  parseBlockPlotCheckerListToPlotChecker(list: BFChainCore.BlockPlotChecker[]) {
    const first = list[0];
    const last = list[list.length - 1];
    const blockPlotChecker: BFChainCore.BlockPlotChecker = {
      height: last.height,
      timestamp: last.timestamp,
      /**参与度 */
      get blockParticipation() {
        Object.defineProperty(this, "blockParticipation", {
          value: list.reduce((p, pc1) => p + pc1.blockParticipation, BigInt(0)),
        });
        return this.blockParticipation;
      },
      /**交易量 */
      get numberOfTransactions() {
        Object.defineProperty(this, "numberOfTransactions", {
          value: list.reduce((p, pc1) => p + pc1.numberOfTransactions, 0),
        });
        return this.numberOfTransactions;
      },
      /**手续费 */
      get totalFee() {
        Object.defineProperty(this, "totalFee", {
          value: list.reduce((p, pc1) => p + pc1.totalFee, BigInt(0)),
        });
        return this.totalFee;
      },
      /**区块signature,如果没有signature,就用`ff*128` */
      get signature() {
        Object.defineProperty(this, "signature", {
          value: list.reduce((p, pc1) => p + pc1.signature, ""),
        });
        return this.signature;
      },
      previousBlockSignature: first.previousBlockSignature,
    };
    return blockPlotChecker;
  }

  /**计算 TPOW参与度 */
  calcTpowParticipation(accTxCount: number, accBalance: string) {
    return BigInt(accTxCount + 1) * BigInt(accBalance);
  }

  /**计算账户一轮下来对应的票数 */
  calcAccountRoundEquity(accTxCount: number, accBalance: string, roundLastBlock: RoundLastBlock) {
    const { balanceWeight, numberOfTransactionsWeight } =
      this.config.accountParticipationWeightRatio;
    const tradingEquity = BigInt(accTxCount) * BigInt(numberOfTransactionsWeight);
    const equity = BigInt(accBalance) * BigInt(balanceWeight) + tradingEquity;
    return equity.toString() as string;
  }

  /**计算区块的参与度 */
  calcBlockParticipation(args: { totalChainAsset: bigint; numberOfTransactions: number }) {
    const { totalChainAsset, numberOfTransactions } = args;
    const { balanceWeight, numberOfTransactionsWeight } = this.config.blockParticipationWeightRatio;
    const jsbiX = BigInt(totalChainAsset) * BigInt(balanceWeight);
    const jsbiY = BigInt(numberOfTransactions) * BigInt(numberOfTransactionsWeight);
    return (jsbiX + jsbiY).toString();
  }

  async forceGetBlockGeneratorAddressByRound(
    round: number,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
      });
    }
    const startHeight = (round - 1) * this.config.blockPerRound + 1;
    const endHeight = round * this.config.blockPerRound;
    const resultArr: string[] = [];
    for (let height = startHeight; height <= endHeight; height++) {
      const publicKeyBuffer =
        typeof blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight === "function"
          ? await blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight(height)
          : (await this.forceGetBlockByHeight(height, blockGetterHelper)).generatorPublicKeyBuffer;
      if (!publicKeyBuffer) {
        throw new ArgumentFormatException(ERROR_LIST.NOT_EXIST, {
          prop: `height:${height}`,
          target: "generatorPublicKey",
        });
      }
      const address = await this.accountBaseHelper.getAddressFromPublicKey(publicKeyBuffer);
      if (!resultArr.includes(address)) {
        resultArr.push(address);
      }
    }
    return resultArr;
  }

  /**
   * 计算块内资产变动的hash
   *
   * @param accountsAssetsChange
   * @param encoding
   * @returns
   */
  async calcAssetChangeHash(
    accountsAssetsChange: BFChainCore.AccountsAssetsChange,
    encoding = "utf-8",
  ) {
    const assetsChanges: string[] = [];
    for (const magic in accountsAssetsChange) {
      const magicAssetsChange = accountsAssetsChange[magic];
      for (const address in magicAssetsChange) {
        const accountAssetsChange = magicAssetsChange[address];
        for (const assetType in accountAssetsChange) {
          assetsChanges.push(`${magic}-${address}-${assetType}-${accountAssetsChange[assetType]}`);
        }
      }
    }
    assetsChanges.sort((prev, next) => (prev > next ? 1 : -1));
    if (assetsChanges.length === 0) {
      return undefined;
    }
    const hashCreater = this.cryptoHelper.sha256();
    for (const assetChange of assetsChanges) {
      hashCreater.update(Buffer.from(assetChange, encoding));
    }
    return (await hashCreater.digest()).toString("hex");
    // return (
    //   await this.cryptoHelper
    //     .sha256()
    //     .update(Buffer.from(JSON.stringify(accountsAssetsChange), encoding))
    //     .digest()
    // ).toString("hex");
  }

  /**
   * 计算链上链的 hash
   *
   * @param currentHeight
   * @param blockGetterHelper
   * @returns
   */
  async calcChainOnChainHash(
    currentHeight: number,
    blockGetterHelper?: BFChainUtil.SecondArgument<BlockHelper["forceGetBlockByHeight"]> &
      BFChainUtil.SecondArgument<BlockHelper["forceGetBlockSignatureBufferByHeight"]>,
  ) {
    let lastRoundLastBlockHeight =
      (this.calcRoundByHeight(currentHeight) - 1) * this.config.blockPerRound;
    lastRoundLastBlockHeight = lastRoundLastBlockHeight === 0 ? 1 : lastRoundLastBlockHeight;
    const hashCreater = this.cryptoHelper.sha256();
    if (lastRoundLastBlockHeight !== 1) {
      const block = await this.forceGetBlockByHeight<RoundLastBlock>(
        lastRoundLastBlockHeight,
        blockGetterHelper,
      );
      hashCreater.update(block.asset.roundLastAsset.chainOnChainBuffer);
    }
    for (let height = lastRoundLastBlockHeight; height < currentHeight; height++) {
      const blockSignatureBuffer = await this.forceGetBlockSignatureBufferByHeight(
        height,
        blockGetterHelper,
      );
      hashCreater.update(blockSignatureBuffer);
    }
    return (await hashCreater.digest()).toString("hex");
  }

  /**
   * 对比两个受托人的优先级
   * 可以用于sort函数
   * @param itemA
   * @param itemB
   */
  nextRoundDelegatesCompareFn<T extends BFChainCore.ForSortAccountInfo>(itemA: T, itemB: T) {
    /**
     * 因为要从大到小排序，所以这里使用`b-a`
     */
    if (itemB.vote > itemA.vote) {
      return 1;
    } else if (itemB.vote < itemA.vote) {
      return -1;
    }
    /// (b === a)
    if (itemB.productivity > itemA.productivity) {
      return 1;
    } else if (itemB.productivity < itemA.productivity) {
      return -1;
    }

    /// itemB.productivity === itemA.productivity
    /**
     * 因为pk是等长的字符串，所以这里不需要使用`String.localCompare`
     */
    return itemA.publicKey > itemB.publicKey ? 1 : itemA.publicKey === itemB.publicKey ? 0 : -1;
  }

  /**
   * 对受托人进行排序
   * @param accountInfoList
   */
  sortInRankAccountInfoList<T extends BFChainCore.ForSortAccountInfo>(accountInfoList: T[]) {
    return accountInfoList.sort(this.nextRoundDelegatesCompareFn);
  }

  // #region 区块奖励分配相关
  /**
   * 计算打块账户和投票账户可分配的奖励总额
   *
   * @param block
   * @param generatorVote 打块账户上一轮获得的权益
   * @returns
   */
  calcRewardsForForginAndVoting<T extends Block>(block: T, generatorVote: bigint) {
    // const blockFee = BigInt(block.totalFee);
    // 手续费直接销毁
    const blockFee = BigInt(0);
    const blockReward = BigInt(block.reward);
    const result = {
      blockFee,
      blockReward,
      reward: blockReward + blockFee,
      vrewards: BigInt(0),
      vrewardsRemaining: BigInt(0),
    };
    // 打块账户上一轮获得的权益大于 0 才需要把奖励分配给投票账户
    if (block.height !== 1 && generatorVote > BigInt(0)) {
      const { jsbiHelper, config } = this;
      // 上一轮 给打块账户投票的用户 大于 0
      const votePercent = config.rewardPercent.votePercent;
      const fee = jsbiHelper.multiplyFloorFraction(blockFee, votePercent);
      const reward = jsbiHelper.multiplyFloorFraction(blockReward, votePercent);
      result.blockFee = blockFee - fee;
      result.blockReward = blockReward - reward;
      result.reward = result.blockFee + result.blockReward;
      result.vrewards = fee + reward;
    }
    return result;
  }

  /**
   * 计算打块账户和投票账户可分配的奖励总额
   *
   * @param block
   * @param voters 给打块账户投票的账户
   * @param generatorVote 打块账户上一轮获得的权益
   */
  calcForgingAndVotingReward<T extends Block>(
    block: T,
    voters: BFChainCore.VoterInfo[],
    generatorVote: bigint,
  ) {
    const result = this.calcRewardsForForginAndVoting(block, generatorVote);
    const blockUpdateData = {
      ...result,
      voters,
      totalEquity: generatorVote,
    };
    return blockUpdateData;
  }

  /**
   * 计算投票账户获得的奖励
   *
   * @param voteEquity 账户投出的权益
   * @param generatorVote 打块账户上一轮获得的权益
   * @param voteTotalReward 可分配的投票总奖励
   */
  calcVotingRewards(voteEquity: bigint, generatorVote: bigint, voteTotalReward: bigint) {
    return (voteTotalReward * voteEquity) / generatorVote;
  }

  /**
   * 计算某个区块的所有投票账户获得的奖励
   *
   * @param voters 投票账户
   * @param generatorVote 打块账户上一轮获得的权益
   * @param voteTotalReward 可分配的投票总奖励
   *
   */
  calcBlockVotesRewards(
    voters: BFChainCore.VoterInfo[],
    generatorVote: bigint,
    voteTotalReward: bigint,
  ) {
    // 每个投票账户得到的奖励 voteRewardList[address] = voteReward
    const voteRewardList: BFChainCore.VoterRewardListInfo = {};
    let sumVoteReward = BigInt(0);
    for (const voter of voters) {
      const voteReward = this.calcVotingRewards(voter.equity, generatorVote, voteTotalReward);
      sumVoteReward += voteReward;
      voteRewardList[voter.address] = voteReward;
    }
    // 分配剩余的奖励
    const vrewardsRemaining = voteTotalReward - sumVoteReward;
    return {
      voteRewardList,
      vrewardsRemaining,
    };
  }
  // #endregion
}
