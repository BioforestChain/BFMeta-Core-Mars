import { Injectable, Inject, getHexFromArrayBuffer } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
import { PROP_SHOULD_LTE_FIELD, OUT_OF_RANGE } from "@bfchain/core-util-exception-errorcode";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";
import { BLOCK_TYPES_BASE, Block } from "@bfchain/core-model-block";
import { AccountBaseHelper } from "@bfchain/core-helper-account-base";
type RoundLastBlock = import("@bfchain/core-model-block").RoundLastBlock;

const {
  ArgumentFormatException,
  NoFoundException,
  ArgumentIllegalException,
  OutOfRangeException,
  IllegalStateException,
} = CoreExceptionGenerator("HELPER", "blockHelper");

@Injectable()
export class BlockHelper {
  constructor(
    public config: ConfigHelper,
    public baseHelper: BaseHelper,
    private accountBaseHelper: AccountBaseHelper,
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
    return this.Buffer.from(await this.cryptoHelper.sha256(block.getBytes(true, true))).toString(
      "hex",
    );
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
    const { generatorPublicKeyBuffer, signatureBuffer } = block;
    // 验证 signature 与 publicKey
    const hash = await this.cryptoHelper.sha256(block.getBytes(true, true));
    if (
      !this.keypairHelper.detached_verify(
        Buffer.from(hash),
        Buffer.from(signatureBuffer),
        Buffer.from(generatorPublicKeyBuffer),
      )
    ) {
      throw new ArgumentFormatException(`Invalid ${taskLabel} signature`);
    }
  }

  /**
   * 校验区块的 remark 大小
   *
   * @param block
   */
  verifyBlockRemarkSize<RJ extends BFChainCore.CommonBlockRemarkJSON>(
    blockRemark: BFChainCore.RemarkJSONToModelType<RJ>,
  ) {
    const remarkSize = blockRemark.getBytes().byteLength;
    const { maxBlockRemarkSize } = this.config;
    if (remarkSize > maxBlockRemarkSize) {
      throw new ArgumentIllegalException(PROP_SHOULD_LTE_FIELD, {
        prop: "remark",
        target: "block",
        field: maxBlockRemarkSize,
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
  //#region block getter

  async forceGetBlockByHeight<B extends BFChainCore.Block = BFChainCore.Block>(
    height: number,
    blockGetterHelper:
      | Pick<BFChainCore.BlockGetterHelperSimpleInterface, "getBlockByHeight">
      | undefined = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "BlockGetterHelper.forceGetBlockByHeight",
      });
    }
    const block = await blockGetterHelper.getBlockByHeight(height);
    if (!block) {
      throw new ArgumentFormatException(NOT_EXIST, {
        prop: `height:${height}`,
        target: "blocks",
        function: "BlockGetterHelper.forceGetBlockByHeight",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "forceGetBlockBySignature",
      });
    }
    const block = await blockGetterHelper.getBlockBySignature(signature);
    if (!block) {
      throw new ArgumentFormatException(NOT_EXIST, {
        prop: `signature: ${signature}`,
        target: "blockChain",
        function: "forceGetBlockBySignature",
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
      throw new OutOfRangeException(OUT_OF_RANGE, {
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
      });
    }
    const publicKeyBuffer =
      typeof blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight === "function"
        ? await blockGetterHelper.getBlockGeneratorPublicKeyBufferByHeight(height)
        : (await this.forceGetBlockByHeight(height, blockGetterHelper)).generatorPublicKeyBuffer;
    if (!publicKeyBuffer) {
      throw new ArgumentFormatException(NOT_EXIST, {
        prop: `height:${height}`,
        target: "generatorPublicKey",
        function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "forceGetBlockSignatureByHeight",
      });
    }
    const signatureBuffer =
      typeof blockGetterHelper.getBlockSignatureByHeight === "function"
        ? await blockGetterHelper.getBlockSignatureByHeight(height)
        : (await this.forceGetBlockByHeight(height, blockGetterHelper)).signatureBuffer;
    if (!signatureBuffer) {
      throw new ArgumentFormatException(NOT_EXIST, {
        prop: `height:${height}`,
        target: "generatorPublicKey",
        function: "forceGetBlockSignatureByHeight",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "BlockGetterHelper.getLastBlock",
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
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "BlockGetterHelper.getBlocksByRange",
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
    throw new IllegalStateException("Could not getBlocksByRange({minHeight}~{maxHeight})", {
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
    CC extends BFChainCore.ChainChannel = BFChainCore.ChainChannel
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
            value: BigInt(block.remark.blockParticipation),
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
  /**计算账户一轮下来对应的权益 */
  calcAccountRoundEquity(accTxCount: number, accBalance: string, roundLastBlock: RoundLastBlock) {
    const {
      numberOfTransactionRewardWeight,
      chainAssetRewardWeight,
    } = this.config.genesisBlock.remark;
    const tradingEquity =
      BigInt(accTxCount) *
      BigInt(numberOfTransactionRewardWeight) *
      BigInt(roundLastBlock.remark.rate);
    const equity = BigInt(accBalance) * BigInt(chainAssetRewardWeight) + tradingEquity;

    return equity.toString() as string;
  }
  /**计算区块的参与度 */
  calcBlockParticipation(args: {
    totalAccount: number;
    totalFee: bigint;
    totalChainAsset: bigint;
    numberOfTransactions: number;
  }) {
    const { totalAccount, totalFee, totalChainAsset, numberOfTransactions } = args;
    const {
      participationTotalChainAsset,
      participationNumberOfTransaction,
      participationNumberOfAccount,
      participationTotalFee,
    } = this.config.blockParticipationWeight;
    const jsbiX =
      BigInt(totalChainAsset) * BigInt(participationTotalChainAsset) +
      BigInt(totalAccount) * BigInt(participationNumberOfAccount);

    const jsbiY =
      BigInt(totalFee) * BigInt(participationTotalFee) +
      BigInt(numberOfTransactions) * BigInt(participationNumberOfTransaction);

    return (jsbiX + jsbiY).toString();
  }

  async forceGetBlockGeneratorAddressByRound(
    round: number,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
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
        throw new ArgumentFormatException(NOT_EXIST, {
          prop: `height:${height}`,
          target: "generatorPublicKey",
          function: "BlockGetterHelper.forceGetBlockGeneratorAddressByHeight",
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
   * 计算链上链的hash
   * @param currentHeight
   * @param blockGetterHelper
   */
  async calcRoundLastBlockRemarkHash(
    currentHeight: number,
    blockGetterHelper?: BFChainUtil.SecondArgument<BlockHelper["forceGetBlockByHeight"]> &
      BFChainUtil.SecondArgument<BlockHelper["forceGetBlockSignatureBufferByHeight"]>,
  ) {
    let lastRoundLastBlockHeight =
      (this.calcRoundByHeight(currentHeight) - 1) * this.config.blockPerRound;
    lastRoundLastBlockHeight = lastRoundLastBlockHeight === 0 ? 1 : lastRoundLastBlockHeight;

    const payloadHash = await this.cryptoHelper.sha256();
    if (lastRoundLastBlockHeight !== 1) {
      const block = await this.forceGetBlockByHeight<RoundLastBlock>(
        lastRoundLastBlockHeight,
        blockGetterHelper,
      );
      payloadHash.update(block.remark.hashBuffer);
    }
    for (let height = lastRoundLastBlockHeight; height < currentHeight; height++) {
      const blockSignatureBuffer = await this.forceGetBlockSignatureBufferByHeight(
        height,
        blockGetterHelper,
      );
      payloadHash.update(blockSignatureBuffer);
    }

    const hashString = (await payloadHash.digest()).toString("hex");

    return hashString;
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
}
