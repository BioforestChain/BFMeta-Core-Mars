import { Block, RoundLastBlock } from "@bfchain/core-model-block";
import { Injectable } from "@bfchain/util";
import { BlockHelper, ChainTimeHelper, ConfigHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { ChainChannel, ChainChannelGroup } from "@bfchain/core-channel";
const { warn, ConsensusException } = CoreExceptionGenerator("Core", "blockForkCheck");

/**
 * 两条区块链的对比策略
 */
export enum BLOCK_CHAIN_PLOT {
  /**
   * 信任自己，抛弃新区块
   */
  KEEP = 1,
  /**
   * 信任自己，信任广播者
   */
  MERGE = 2,
  /**
   * 质疑自己，与新链进行同步
   */
  FORK = 3,
}
enum BLOCK_CHAIN_CUSTOM_PLOT {
  /**
   * 困惑，
   */
  PUZZLED = 11,
}
// const BLOCK_CHAIN_MIX_PLOT = {
//   ...BLOCK_CHAIN_CUSTOM_PLOT,
//   ...BLOCK_CHAIN_PLOT,
// } as const;

/**
 * 混合检查结果
 */
type MixBlockCheckResult =
  | {
      plot: BLOCK_CHAIN_PLOT.MERGE;
      height: number;
      blockPlotChecker: BFChainCore.BlockPlotChecker;
    }
  | {
      plot: BLOCK_CHAIN_PLOT.KEEP;
      height: number;
      blockPlotChecker: BFChainCore.BlockPlotChecker;
    }
  | {
      plot: BLOCK_CHAIN_PLOT.FORK;
      height?: number;
    }
  | {
      plot: BLOCK_CHAIN_CUSTOM_PLOT.PUZZLED;
    };

/**
 * 区块分叉检查器
 */
@Injectable()
export class BlockForkChecker {
  constructor(
    private blockHelper: BlockHelper,
    private timeHelper: ChainTimeHelper,
    private config: ConfigHelper,
  ) {}
  /**
   * 检查一条新链与其对应的新区块 的共识
   * @param pc2_or_lastestBlock2
   * @param chainChannel_or_Group
   * @param blockGetterHelper1
   */
  async checkNewBlockFromChainChannel<CC extends ChainChannel>(
    /**
     * 收到的新区块
     */
    pc2_or_lastestBlock2: BFChainCore.BlockPlotChecker | BFChainCore.Block,
    chainChannel_or_Group: ChainChannelGroup<CC> | CC,
    blockGetterHelper1 = this.blockHelper
      .blockGetterHelper as BFChainCore.BlockGetterHelperInterface<CC>,
  ) {
    const res = await this.checkNewBlock(
      pc2_or_lastestBlock2,
      chainChannel_or_Group.toBlockGetterHelper({
        maxHeight: pc2_or_lastestBlock2.height,
      }),

      blockGetterHelper1,
    );
    if (res.plot === BLOCK_CHAIN_PLOT.MERGE) {
      /**
       * 正在同步中区块与channel
       */
      const currentSyncBlockInfo = await this.blockHelper.getCurrentSyncBlockInfo(
        blockGetterHelper1,
      );
      const currentSyncChainChannelGroup =
        currentSyncBlockInfo && currentSyncBlockInfo.chainChannelGroup;
      if (currentSyncChainChannelGroup) {
        /// 可以直接合并两条链
        if (chainChannel_or_Group instanceof ChainChannelGroup) {
          chainChannel_or_Group.forEach(chainChannel => {
            currentSyncChainChannelGroup.addChainChannel(chainChannel);
          });
        } else {
          currentSyncChainChannelGroup.addChainChannel(chainChannel_or_Group);
        }
      }
    }
    return res;
  }
  /**
   * 对比两个区块,得出一个选择策略
   * @param p1
   * @param p2
   */
  private checkSameHeightBlockPlot_(
    pc1: BFChainCore.BlockPlotChecker,
    pc2: BFChainCore.BlockPlotChecker,
  ) {
    /**
     * ```ts
     * myLastestBlockPlotChecker.timestamp > newBlockPlotChecker.timestamp
     * ```
     * 我的链区块延迟更严重, 所以进入分叉判断试图寻找更加准确的链
     * @TODO 时间戳是否要进入判定？
     */
    if (pc1.timestamp > pc2.timestamp) {
      /**
       * 我的链区块延迟更严重, 所以进入分叉判断试图寻找更加准确的链
       */
      return BLOCK_CHAIN_PLOT.FORK;
    } else if (pc1.timestamp < pc2.timestamp) {
      /**
       * 我的时间是更加靠前的,所以我自己的区块更加可信
       */
      return BLOCK_CHAIN_PLOT.KEEP;
    } else {
      /**
       * @情况2
       * 我们之前都是一样,时间戳也是一样的,说明打块人是同一个
       * 这时候就依次选择参与度更高 交易量更多 手续费更多 id更骚 的区块
       */
      if (pc1.previousBlockId === pc2.previousBlockId && pc1.timestamp === pc2.timestamp) {
        if (pc1.blockParticipation > pc2.blockParticipation) {
          return BLOCK_CHAIN_PLOT.KEEP;
        } else if (pc1.blockParticipation === pc2.blockParticipation) {
          if (pc1.numberOfTransactions > pc2.numberOfTransactions) {
            return BLOCK_CHAIN_PLOT.KEEP;
          } else {
            if (pc1.totalFee > pc2.totalFee) {
              return BLOCK_CHAIN_PLOT.KEEP;
            } else if (pc1.totalFee === pc2.totalFee) {
              if (pc1.blockId > pc2.blockId) {
                return BLOCK_CHAIN_PLOT.KEEP;
              } else if (pc1.blockId === pc2.blockId) {
                return BLOCK_CHAIN_PLOT.MERGE;
              }
            }
          }
        }
      }
    }
    return BLOCK_CHAIN_PLOT.FORK;
  }
  private checkSameHeightBlockListPlot_(
    pcList1: BFChainCore.BlockPlotChecker[],
    pcList2: BFChainCore.BlockPlotChecker[],
  ) {
    return this.checkSameHeightBlockPlot_(
      this.blockHelper.parseBlockPlotCheckerListToPlotChecker(pcList1),
      this.blockHelper.parseBlockPlotCheckerListToPlotChecker(pcList2),
    );
  }
  /**
   * 获取一条链的终点信息：bgh与pc
   * @param pc
   * @param blockGetterHelper
   */
  private async getBlockPlotCheckerEnd_(
    blockGetterHelper: BFChainCore.BlockGetterHelperInterface | undefined,
    pc: BFChainCore.BlockPlotChecker,
  ) {
    const end = { pc, blockGetterHelper };
    const currentSyncBlockInfo = await this.blockHelper.getCurrentSyncBlockInfo(blockGetterHelper);
    if (currentSyncBlockInfo) {
      end.blockGetterHelper = currentSyncBlockInfo.blockGetterHelper;
      end.pc = this.blockHelper.parseBlockToPlotChecker(
        await currentSyncBlockInfo.blockGetterHelper.getLastBlock(),
      );
    }
    const currentGenerateBlock = await this.blockHelper.getCurrentGenerateBlock(blockGetterHelper);
    if (currentGenerateBlock) {
      end.pc = this.blockHelper.parseNewBlockToPlotChecker(currentGenerateBlock);
    }
    return end;
  }
  /**
   * 检查两个 blockGetterHelper 的同步策略
   *
   * 1. 其中`1`为**防守者**，`2`为**入侵者**
   * > * 以下注释中**防守者**等同于 **“我”**
   * > * 以下注释中**入侵者**等同于 **“新”**
   * 2. `5`与`6`为**防守者**与**入侵者**目前已知的最终区块（这个时刻的最高同步终点）
   *
   * @param pc1
   * @param blockGetterHelper1
   * @param pc2
   * @param blockGetterHelper2
   */
  async checkBlockGetterPlot(
    pc1: BFChainCore.BlockPlotChecker,
    blockGetterHelper1: BFChainCore.BlockGetterHelperInterface | undefined,
    pc2: BFChainCore.BlockPlotChecker,
    blockGetterHelper2: BFChainCore.BlockGetterHelperInterface | undefined,
  ): Promise<MixBlockCheckResult> {
    //#region 优先判定终点

    const [
      /**
       * 防守者的终点
       */
      pc5End,
      /**
       * 入侵者的终点
       */
      pc6End,
    ] = await Promise.all([
      this.getBlockPlotCheckerEnd_(blockGetterHelper1, pc1),
      this.getBlockPlotCheckerEnd_(blockGetterHelper2, pc2),
    ]);

    //#endregion

    /**
     * 判定两个终点的策略
     */
    if (pc5End.pc.height <= pc6End.pc.height) {
      /// 1. 入侵者始终高于防守者，直接进行终点检查
      const checkResult = await this.checkBlockGetterPlotEnd(
        pc5End.pc,
        pc6End.pc,
        pc6End.blockGetterHelper,
      );
      /**
       * 将终点策略进行转换，转换成原策略
       */
      if (checkResult.plot === BLOCK_CHAIN_PLOT.KEEP) {
        /// 1.1
        return {
          plot: BLOCK_CHAIN_PLOT.KEEP,
          height: pc1.height,
          blockPlotChecker: pc1,
        } as const;
      }
      if (checkResult.plot === BLOCK_CHAIN_PLOT.MERGE) {
        /// 1.2
        return {
          plot: BLOCK_CHAIN_PLOT.MERGE,
          height: pc2.height,
          blockPlotChecker: pc2,
        } as const;
      }
      if (checkResult.plot === BLOCK_CHAIN_PLOT.FORK) {
        /// 1.3
        if (typeof checkResult.height === "number" && checkResult.height <= pc1.height) {
          return {
            plot: checkResult.plot,
            height: checkResult.height,
          } as const;
        }
        return checkResult;
      }
      /// 1.4
      return checkResult;
    }
    /// 2. 如果我的终点反而的高于入侵者的，那么就进行反向入侵
    const checkResult = await this.checkBlockGetterPlotEnd(
      pc6End.pc,
      pc5End.pc,
      pc5End.blockGetterHelper,
    );
    /**
     * 将终点策略进行转换，转换成原策略
     */
    if (checkResult.plot === BLOCK_CHAIN_PLOT.MERGE) {
      return {
        plot: BLOCK_CHAIN_PLOT.MERGE,
        height: pc2.height,
        blockPlotChecker: pc2,
      } as const;
    }
    if (checkResult.plot === BLOCK_CHAIN_PLOT.FORK) {
      return {
        plot: BLOCK_CHAIN_PLOT.KEEP,
        height: pc1.height,
        blockPlotChecker: pc1,
      } as const;
    }
    warn(
      `should not happen: the pc5.height is large then pc6.height, Why plot is ${
        BLOCK_CHAIN_PLOT[checkResult.plot]
      }?`,
    );
    return checkResult;
  }
  /**
   * 终点判定法，检查两个 blockGetterHelper 的同步策略
   * 1. 其中`1`为**防守者**，`2`为**入侵者**
   * > * 以下注释中**防守者**等同于 **“我”**
   * > * 以下注释中**入侵者**等同于 **“新”**
   * 2. 另外`3`与`4`为**防守者**与**入侵者**的最小的下一个区块（包含正在处理（同步或者锻造），以及比对方最高高度多1的区块）
   *
   * @param pc1
   * @param pc2
   * @param blockGetterHelper2
   */
  async checkBlockGetterPlotEnd(
    pc1: BFChainCore.BlockPlotChecker,
    pc2: BFChainCore.BlockPlotChecker,
    blockGetterHelper2: BFChainCore.BlockGetterHelperInterface | undefined,
  ): Promise<MixBlockCheckResult> {
    //#region 返回值
    const $MERGE = {
      plot: BLOCK_CHAIN_PLOT.MERGE,
      height: pc2.height,
      blockPlotChecker: pc2,
    } as const;
    const $KEEP = {
      plot: BLOCK_CHAIN_PLOT.KEEP,
      height: pc1.height,
      blockPlotChecker: pc1,
    } as const;
    const ROLLBACK$ = (height?: number) =>
      ({
        plot: BLOCK_CHAIN_PLOT.FORK,
        height,
      } as const);
    const PUZZLED$ = () =>
      ({
        plot: BLOCK_CHAIN_CUSTOM_PLOT.PUZZLED,
      } as const);
    //#endregion

    /**
     * 开始执行判定
     */
    if (pc1.height < pc2.height) {
      /// 入侵者的链更长
      const pc4PreviousBlockId =
        pc1.height === pc2.height - 1
          ? /// 如果新区块是我现在所需要的下一个区块
            pc2.previousBlockId
          : /// 使用forceGetBlockIdByHeight判定等高的区块ID是否一致，这样意味着下一个区块的前块ID
            await this.blockHelper.forceGetBlockIdByHeight(pc1.height, blockGetterHelper2);

      if (pc4PreviousBlockId === pc1.blockId) {
        /// 因为前块ID是匹配的，所以直接信任新区快就行了
        return $MERGE;
      }
      /// 如果新区块的前块ID与我的区块不同，那么进入回滚判定
      return ROLLBACK$();
    } else if (pc1.height === pc2.height) {
      /// 二者等长
      if (pc1.blockId === pc2.blockId) {
        /// 二者完全相同
        return $MERGE;
      }
      /// 区块ID不一样
      if (pc1.previousBlockId === pc2.previousBlockId) {
        /// 前块ID相等的情况下，两个区块直接进行优先级对比。这里是一个优化过的分叉判定，否则直接 FORK 就行了
        const checkedPlot = this.checkSameHeightBlockPlot_(pc1, pc2);
        if (checkedPlot === BLOCK_CHAIN_PLOT.FORK) {
          /// 因为前块ID相同，所以明确知道分叉点就是前块，回滚到那个点
          return ROLLBACK$(pc1.height - 1);
        }
        /// 根据判定结果返回对应的策略
        return checkedPlot === BLOCK_CHAIN_PLOT.KEEP ? $KEEP : $MERGE;
      }
      /// 前块ID也不相同，直接进入困惑判定
      return PUZZLED$();
    }
    /**
     * 防守者高度高于入侵者
     * pc1.height > pc2.height
     * 直接保留自身
     */
    return $KEEP;
  }
  /**
   * 用于判断入侵者的区块是否可用
   */
  async checkNewBlock(
    /**
     * 收到的新区块
     */
    pc2_or_lastestBlock2: BFChainCore.BlockPlotChecker | BFChainCore.Block,
    blockGetterHelper2: BFChainCore.BlockGetterHelperInterface,
    blockGetterHelper1 = this.blockHelper.blockGetterHelper,
  ): Promise<{ plot: BLOCK_CHAIN_PLOT; height: number; block?: Block }> {
    /**
     * 我的最新区块
     */
    const lastestBlock1 = await this.blockHelper.getLastBlock(blockGetterHelper1);
    const pc1 = this.blockHelper.parseBlockToPlotChecker(
      await this.blockHelper.getLastBlock(blockGetterHelper1),
    );
    let pc2: BFChainCore.BlockPlotChecker;
    if (pc2_or_lastestBlock2 instanceof Block) {
      pc2 = this.blockHelper.parseBlockToPlotChecker(pc2_or_lastestBlock2);
    } else {
      pc2 = pc2_or_lastestBlock2;
    }

    const checkResult = await this.checkBlockGetterPlot(
      pc1,
      blockGetterHelper1,
      pc2,
      blockGetterHelper2,
    );

    const $MERGE = {
      plot: BLOCK_CHAIN_PLOT.MERGE,
      height: pc2.height,
      block: this.blockHelper.getBlockFromPlotChecker(pc2),
    } as const;
    const $KEEP = {
      plot: BLOCK_CHAIN_PLOT.KEEP,
      height: pc1.height,
      block: lastestBlock1,
    } as const;
    const FORK$ = (height: number, block?: Block) =>
      ({
        plot: BLOCK_CHAIN_PLOT.FORK,
        height,
        block,
      } as const);

    if (checkResult.plot === BLOCK_CHAIN_CUSTOM_PLOT.PUZZLED) {
      /// 1. 困惑模式，找出相同的一段区块手动判定是否要进行回滚
      const sameBlock = await this.findNearestSameBlock(
        pc1.height - 1,
        blockGetterHelper1,
        blockGetterHelper2,
      );

      const pcList1 = (
        await this.blockHelper.forceGetBlockListByHeightRange(
          sameBlock.height + 1,
          pc1.height,
          blockGetterHelper1,
        )
      ).map(b => this.blockHelper.parseBlockToPlotChecker(b));
      const pcList2 = (
        await this.blockHelper.forceGetBlockListByHeightRange(
          sameBlock.height + 1,
          pc2.height,
          blockGetterHelper2,
        )
      ).map(b => this.blockHelper.parseBlockToPlotChecker(b));
      const checkedPlot = this.checkSameHeightBlockListPlot_(pcList1, pcList2);

      if (checkedPlot === BLOCK_CHAIN_PLOT.FORK) {
        return FORK$(sameBlock.height, sameBlock);
      }
      if (checkedPlot === BLOCK_CHAIN_PLOT.KEEP) {
        return $KEEP;
      }
      if (checkedPlot === BLOCK_CHAIN_PLOT.MERGE) {
        warn("should not happen. pc1 and pc2 are puzzled. should not 'MERGE'!");
        return $MERGE;
      }

      throw new Error("should not happen in PUZZLED");
    }
    if (checkResult.plot === BLOCK_CHAIN_PLOT.FORK) {
      if (typeof checkResult.height === "number") {
        /// 如果策略中有明确的分叉点，那么就表明了必然是要发生回滚的
        return FORK$(
          checkResult.height,
          checkResult.height === pc1.height ? lastestBlock1 : undefined,
        );
      }
      const sameBlock = await this.findNearestSameBlock(
        pc1.height - 1,
        blockGetterHelper1,
        blockGetterHelper2,
      );

      return FORK$(sameBlock.height, sameBlock);
    }
    if (checkResult.plot === BLOCK_CHAIN_PLOT.MERGE) {
      return $MERGE;
    }
    if (checkResult.plot === BLOCK_CHAIN_PLOT.KEEP) {
      return $KEEP;
    }
    throw new Error(`should not happen in checkResult`);
  }

  /**
   * 获取最接近的相同区块。
   */
  async findNearestSameBlock(
    theHeight: number,
    blockGetterHelper1?: BFChainCore.BlockGetterHelperInterface,
    blockGetterHelper2?: BFChainCore.BlockGetterHelperInterface,
  ) {
    // 1 从当前高度逐一验证id到上一轮的最后一个区块
    const lastRound = this.blockHelper.calcRoundByHeight(theHeight) - 1;
    const lastRoundEndHeight = this.blockHelper.calcRoundEndHeight(lastRound);
    const result = await this.findNearestSameBlockInOneRound(
      theHeight,
      lastRoundEndHeight,
      blockGetterHelper1,
      blockGetterHelper2,
    );
    if (result) {
      return result;
    }
    // 2 验证链上链是否正确
    let verifyHeight = lastRoundEndHeight;
    do {
      //   获取本地节点的区块
      const block1 = await this.blockHelper.forceGetBlockByHeight<RoundLastBlock>(
        verifyHeight,
        blockGetterHelper1,
      );
      // 获取对方节点的区块
      const block2 = await this.blockHelper.forceGetBlockByHeight<RoundLastBlock>(
        verifyHeight,
        blockGetterHelper2,
      );
      if (block2.remark.hash === block1.remark.hash) {
        break;
      } else {
        verifyHeight -= this.config.blockPerRound;
      }
    } while (verifyHeight > 1);
    const wrongChainHeight = verifyHeight + this.config.blockPerRound;
    console.log(
      `链上链于 ${wrongChainHeight} 高度的轮次出错，所以从这里开始往回查询58个块能发现分叉 (上一个轮的轮末块也要判断)`,
    );
    const result2 = await this.findNearestSameBlockInOneRound(
      wrongChainHeight,
      wrongChainHeight - this.config.blockPerRound,
      blockGetterHelper1,
      blockGetterHelper2,
    );
    if (!result2) {
      throw new ConsensusException("should not happen in findNearestSameBlock.");
    }
    return result2;
  }
  /**
   * 查找一轮以内的分叉区块
   */
  async findNearestSameBlockInOneRound(
    theHeight: number,
    lastRoundEndHeight: number,
    blockGetterHelper1?: BFChainCore.BlockGetterHelperInterface,
    blockGetterHelper2?: BFChainCore.BlockGetterHelperInterface,
  ) {
    for (let compareHeight = theHeight; compareHeight >= lastRoundEndHeight - 1; compareHeight--) {
      // 获取对方节点的区块
      const block2 = await this.blockHelper.forceGetBlockByHeight(
        compareHeight,
        blockGetterHelper2,
      );
      //   获取本地节点的区块
      const block1 = await this.blockHelper.forceGetBlockByHeight(
        compareHeight,
        blockGetterHelper1,
      );
      if (block2.id === block1.id) {
        return block1;
      } else {
        // console.log(` 高度 ${compareHeight} 不一致，还在分叉，继续找上一个块`);
        if (compareHeight === 1) {
          throw new ConsensusException(`创世块不匹配, 同步节点创世块id都不对了`);
        }
        continue;
      }
    }
  }
}
