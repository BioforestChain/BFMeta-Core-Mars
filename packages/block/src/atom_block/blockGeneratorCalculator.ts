import {
  BlockHelper,
  ConfigHelper,
  AccountBaseHelper,
  ChainTimeHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { Injectable, EasyMap } from "@bfchain/util";
const { NoFoundException, ArgumentException } = CoreExceptionGenerator(
  "Core",
  "BlockGeneratorCalculator",
);

/**
 * 区块锻造者计算器
 */
@Injectable()
export class BlockGeneratorCalculator {
  constructor(
    private config: ConfigHelper,
    private timeHelper: ChainTimeHelper,
    private blockHelper: BlockHelper,
    private accountBaseHelper: AccountBaseHelper,
  ) {}

  /**
   * 快速算出指定时间点的锻造者
   * @param currentBlock
   * @param opts
   */
  async fastCalcGenerateBlockDelegate(
    currentBlock: { timestamp: number; height: number },
    opts: ({ nowTimestamp?: number } | { toTimestamp: number }) & {
      blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
    } = {},
  ) {
    let toTimestamp: number;
    if ("toTimestamp" in opts) {
      toTimestamp = opts.toTimestamp;
    } else {
      const { nowTimestamp = this.timeHelper.getTimestamp() } = opts;
      /// 如果是卡在slotnumber一致的时间戳，那么直接跳到下一个slotnumber，确保一定要有事件来处理区块。而不是应急去处理过去的区块
      toTimestamp = this.timeHelper.getTimestampBySlotNumber(
        this.timeHelper.getSlotNumberByTimestamp(nowTimestamp) + 1,
      );
    }

    if (currentBlock.timestamp >= toTimestamp) {
      throw new ArgumentException(
        `lastblock timestamp(${currentBlock.timestamp}) should not be greater than toTimestamp(${toTimestamp})`,
      );
    }
    /// 这里使用fromTimestamp，直接导致掉线人的顺序都直接跳过了，因为我们的目的只是快速地得出当下时间节点应该由谁来打块而已
    for await (const result of this.calcGenerateBlockDelegateGenerator(currentBlock, {
      toTimestamp,
      blockGetterHelper: opts.blockGetterHelper,
      ignoreOfflineGeneraters: true,
    })) {
      if (result.timestamp === toTimestamp) {
        return {
          address: result.address,
          timestamp: result.timestamp,
        };
      }
    }
    throw new Error();
  }
  /**
   *
   * @param currentBlock 最新的区块
   * @param opts nowTimestamp为区块间隔的整数倍，为当前区块时间戳的前置时间，例如当前时间戳为77，传入的时间应为70.因为锻造区块从70开始算，而不是80
   */
  async calcGenerateBlockDelegate(
    currentBlock: { timestamp: number; height: number },
    opts: {
      toTimestamp: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
    },
  ) {
    /// 这里使用fromTimestamp，直接导致掉线人的顺序都直接跳过了，因为我们的目的只是快速地得出当下时间节点应该由谁来打块而已
    for await (const result of this.calcGenerateBlockDelegateGenerator(currentBlock, opts)) {
      if (result.timestamp === opts.toTimestamp) {
        return result;
      }
    }
    throw new Error();
  }
  async *calcGenerateBlockDelegateGenerator(
    currentBlock: { timestamp: number; height: number },
    opts: {
      // fromTimestamp?: number;
      toTimestamp?: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
      ignoreOfflineGeneraters?: boolean;
      yieldSkip?: number;
    } = {},
  ) {
    const {
      toTimestamp = Infinity,
      blockGetterHelper = this.blockHelper.blockGetterHelper,
      ignoreOfflineGeneraters,
      yieldSkip = 1,
    } = opts;
    const fromTimestamp = currentBlock.timestamp + this.config.forgeInterval;

    let nowTimestamp = fromTimestamp;

    /// RESULT
    const 结果掉块信息 = new EasyMap<number, string[]>(() => []);

    /// 1
    const 这一轮已经出来的区块 = [] as BFChainCore.Block[];
    const 当前轮已经锻造的区块数 = currentBlock.height % this.config.blockPerRound;
    for (let i = 0; i < 当前轮已经锻造的区块数; i++) {
      这一轮已经出来的区块.push(
        await this.blockHelper.forceGetBlockByHeight(currentBlock.height - i, blockGetterHelper),
      );
    }
    /// 2
    const 上一轮轮末块 = await this.blockHelper.forceGetBlockByHeight<
      BFChainCore.RoundLastBlock | BFChainCore.GenesisBlock
    >(
      Math.max(
        1,
        this.blockHelper.calcRoundEndHeight(
          this.blockHelper.calcRoundByHeight(currentBlock.height + 1) - 1,
        ),
      ),
      blockGetterHelper,
    );
    const 当前轮次 = this.blockHelper.calcRoundByHeight(上一轮轮末块.height + 1);

    /**
     * 指定时间来说,应该到了哪一轮
     * @return 从0开始的正整数
     * @param timestamp
     */
    const 计算轮次间隔 = (timestamp: number) => {
      const roundOffset =
        (timestamp - 上一轮轮末块.timestamp) /
        this.config.forgeInterval /
        this.config.blockPerRound;
      if (roundOffset % 1 === 0 && roundOffset > 0) {
        return roundOffset - 1;
      }
      return Math.floor(roundOffset);
    };

    const 计算某一轮次间隔开始的时间戳 = (轮次间隔: number) => {
      return (
        (轮次间隔 * this.config.blockPerRound + 1) * this.config.forgeInterval +
        上一轮轮末块.timestamp
      );
    };

    /// 3
    const 上一个块的信息 = await this.blockHelper.forceGetBlockByHeight(
      currentBlock.height,
      blockGetterHelper,
    );
    if (ignoreOfflineGeneraters) {
      if (!Number.isSafeInteger(toTimestamp)) {
        throw new RangeError("toTimestamp must be an integer, when you ignore Offline Generaters.");
      }
      /// 快速的跳转到最后一轮，中间掉的轮次都可以忽略
      const fromTimestamp轮次间隔 = 计算轮次间隔(fromTimestamp);
      const toTimestamp轮次间隔 = 计算轮次间隔(toTimestamp);
      if (toTimestamp轮次间隔 > fromTimestamp轮次间隔) {
        nowTimestamp = 计算某一轮次间隔开始的时间戳(toTimestamp轮次间隔);
      }
    }

    const nextRoundDelegates =
      上一轮轮末块.height === 1
        ? (上一轮轮末块 as BFChainCore.GenesisBlock).asset.genesisAsset.nextRoundDelegates
        : (上一轮轮末块 as BFChainCore.RoundLastBlock).asset.roundLastAsset.nextRoundDelegates;

    const 取得剩余可用受托人 = async (掉了多少轮: number) => {
      //#region 那一轮可使用的受托人
      const 那一轮可使用的受托人 = new Set<string>();
      if (掉了多少轮 === 0) {
        for (const d of nextRoundDelegates) {
          那一轮可使用的受托人.add(d.address);
        }
      } else {
        const 掉到哪一轮 = 当前轮次 - 掉了多少轮;
        if (掉到哪一轮 <= 1) {
          /// 创世块那一轮,直接使用传世受托人,不用管第一轮到底是谁在打块
          for (const d of this.config.genesisBlock.asset.genesisAsset.nextRoundDelegates) {
            那一轮可使用的受托人.add(d.address);
          }
        } else {
          const 那一轮的最低高度 = this.blockHelper.calcRoundStartHeight(掉到哪一轮);
          const 那一轮的最高高度 = Math.min(
            this.blockHelper.calcRoundEndHeight(掉到哪一轮),
            currentBlock.height,
          );
          /**
           * @TODO 也许这里可以使用异步迭代器优化
           */
          for (let h = 那一轮的最低高度; h <= 那一轮的最高高度; h++) {
            那一轮可使用的受托人.add(
              await this.blockHelper.forceGetBlockGeneratorAddressByHeight(h, blockGetterHelper),
            );
          }
          /// 如果选出来的人不够, 那么使用选举出来的受托人进行候补
          if (那一轮可使用的受托人.size < this.config.blockPerRound) {
            for (const d of nextRoundDelegates) {
              那一轮可使用的受托人.add(d.address);
            }
          }
        }
      }
      //#endregion

      //#region 那一轮已经使用的受托人
      const 那一轮已经使用的受托人 = new Set<string>();
      for (const block of 这一轮已经出来的区块) {
        if (计算轮次间隔(block.timestamp) === 掉了多少轮) {
          那一轮已经使用的受托人.add(
            await this.accountBaseHelper.getAddressFromPublicKey(block.generatorPublicKeyBuffer),
          );
        }
      }
      //#endregion

      //#region 那一轮已经掉线的受托人
      const 那一轮已经掉线的受托人 = new Set<string>();
      for (const block of 这一轮已经出来的区块) {
        const 那一轮这个块掉线的受托人 = block.roundOfflineGeneratersHashMap[掉了多少轮];
        if (那一轮这个块掉线的受托人) {
          for (const address of 那一轮这个块掉线的受托人.split(",")) {
            那一轮已经掉线的受托人.add(address);
          }
        }
      }
      //#endregion

      /// RESULT
      const 剩余可用的受托人 = [] as string[];
      for (const address of 那一轮可使用的受托人) {
        if (那一轮已经使用的受托人.has(address) || 那一轮已经掉线的受托人.has(address)) {
          continue;
        }
        剩余可用的受托人.push(address);
      }

      return 剩余可用的受托人;
    };
    const 基于前块的排序种子 = 上一个块的信息.generatorPublicKeyBuffer.reduce((r, v) => r + v, 0);
    const 种子与地址结果值缓存 = new EasyMap((address: string) => {
      let num = 0;
      for (let i = 1; i < address.length; i++) {
        num += address.charCodeAt(i);
      }
      return num * 基于前块的排序种子;
    });
    const 对受托人排序 = (候选名单: string[]) => {
      return 候选名单.slice().sort((a1, a2) => {
        const sortRes = 种子与地址结果值缓存.forceGet(a1) - 种子与地址结果值缓存.forceGet(a2);
        if (sortRes === 0) {
          // 确保排序稳定
          return 候选名单.indexOf(a1) - 候选名单.indexOf(a2);
        }
        return sortRes;
      });
    };

    const getResult = (选中的受托人: string) => {
      let roundOfflineGeneratersHashMap: BFChainCore.RoundOfflineGeneratersHashMap | undefined;

      return {
        roundOfflineGeneratersReadonlyMap:
          结果掉块信息 as BFChainCore.RoundOfflineGeneratersReadonlyMap,
        get roundOfflineGeneratersHashMap() {
          if (!roundOfflineGeneratersHashMap) {
            roundOfflineGeneratersHashMap = {};
            for (const [roundOffset, OfflineGeneraterList] of 结果掉块信息) {
              roundOfflineGeneratersHashMap[roundOffset] = OfflineGeneraterList.join(",");
            }
          }
          return roundOfflineGeneratersHashMap;
        },
        address: 选中的受托人,
        timestamp: this.timeHelper.getTimestampBySlotNumber(
          this.timeHelper.getSlotNumberByTimestamp(nowTimestamp),
        ),
      };
    };

    let yieldCount = 0;

    //#region 在某一轮轮选择受托人
    while (nowTimestamp <= toTimestamp) {
      const 现在掉了多少轮 = 计算轮次间隔(nowTimestamp); // <0 的轮次统一使用第一轮的数据
      const 剩余可用的受托人 = await 取得剩余可用受托人(现在掉了多少轮);
      const 可用受托人列表元素个数 =
        (计算某一轮次间隔开始的时间戳(现在掉了多少轮 + 1) - nowTimestamp) /
        this.config.forgeInterval;
      if (剩余可用的受托人.length > 可用受托人列表元素个数) {
        剩余可用的受托人.length = 可用受托人列表元素个数;
      }

      const 排序后的受托人列表 = 对受托人排序(剩余可用的受托人);

      let 当前轮的掉线列表: string[] | undefined;

      do {
        const 选中的受托人 = 排序后的受托人列表.shift();

        if (!选中的受托人) {
          break;
        }

        /// 将受托人返回给外界
        if (yieldSkip > 1) {
          if (++yieldCount === yieldSkip || nowTimestamp === toTimestamp) {
            yieldCount = 0;
            yield getResult(选中的受托人);
          }
        } else {
          yield getResult(选中的受托人);
        }

        // 外界否定这个选中的受托人，那么将之推到掉线的列表中
        (当前轮的掉线列表 || (当前轮的掉线列表 = 结果掉块信息.forceGet(现在掉了多少轮))).push(
          选中的受托人,
        );
        nowTimestamp += this.config.forgeInterval;
      } while (排序后的受托人列表.length);
    }
    //#endregion
  }
}
