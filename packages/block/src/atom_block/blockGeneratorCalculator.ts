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
  async fastCalcGenerateBlockGenerator(
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
    for await (const result of this.calcGenerateBlockGeneratorIterator(currentBlock, {
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
  async calcGenerateBlockGenerator(
    currentBlock: { timestamp: number; height: number },
    opts: {
      toTimestamp: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
    },
  ) {
    /// 这里使用fromTimestamp，直接导致掉线人的顺序都直接跳过了，因为我们的目的只是快速地得出当下时间节点应该由谁来打块而已
    for await (const result of this.calcGenerateBlockGeneratorIterator(currentBlock, opts)) {
      if (result.timestamp === opts.toTimestamp) {
        return result;
      }
    }
    throw new Error();
  }
  async *calcGenerateBlockGeneratorIterator(
    currentBlock: { timestamp: number; height: number },
    opts: {
      // fromTimestamp?: number;
      toTimestamp?: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
      ignoreOfflineGeneraters?: boolean;
      yieldSkip?: number;
      blockCache?: {
        [height: number]: BFChainCore.Block;
      };
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
    const resultMisBlockMap = new EasyMap<number, string[]>(() => []);

    /// 1
    /**这一轮已经出来的区块 */
    const thisRoundGeneratorBlocks = [] as BFChainCore.Block[];
    /**当前轮已经锻造的区块数 */
    const currentRoundGeneratorblockCount = currentBlock.height % this.config.blockPerRound;
    const blockCache = opts.blockCache || {};
    for (let i = 0; i < currentRoundGeneratorblockCount; i++) {
      const targetHeight = currentBlock.height - i;
      thisRoundGeneratorBlocks.push(
        blockCache[targetHeight] ||
          (await this.blockHelper.forceGetBlockByHeight(targetHeight, blockGetterHelper)),
      );
    }
    /// 2
    const roundLastBlockHeight = Math.max(
      1,
      this.blockHelper.calcRoundEndHeight(
        this.blockHelper.calcRoundByHeight(currentBlock.height + 1) - 1,
      ),
    );
    const lastRoundEndBlock =
      blockCache[roundLastBlockHeight] ||
      (await this.blockHelper.forceGetBlockByHeight<
        BFChainCore.RoundLastBlock | BFChainCore.GenesisBlock
      >(roundLastBlockHeight, blockGetterHelper));
    /**当前轮次 */
    const currentRound = this.blockHelper.calcRoundByHeight(lastRoundEndBlock.height + 1);

    /**
     * 计算轮次间隔
     * 指定时间来说,应该到了哪一轮
     * @return 从0开始的正整数
     * @param timestamp
     */
    const calcRoundInterval = (timestamp: number) => {
      const roundOffset =
        (timestamp - lastRoundEndBlock.timestamp) /
        this.config.forgeInterval /
        this.config.blockPerRound;
      if (roundOffset % 1 === 0 && roundOffset > 0) {
        return roundOffset - 1;
      }
      return Math.floor(roundOffset);
    };

    /**计算某一轮次间隔开始的时间戳 */
    const calcRoundStartTimestamp = (轮次间隔: number) => {
      return (
        (轮次间隔 * this.config.blockPerRound + 1) * this.config.forgeInterval +
        lastRoundEndBlock.timestamp
      );
    };

    /// 3
    /**上一个块的信息 */
    const lastBlockInfo =
      blockCache[currentBlock.height] ||
      (await this.blockHelper.forceGetBlockByHeight(currentBlock.height, blockGetterHelper));
    if (ignoreOfflineGeneraters) {
      if (!Number.isSafeInteger(toTimestamp)) {
        throw new RangeError("toTimestamp must be an integer, when you ignore Offline Generaters.");
      }
      /// 快速的跳转到最后一轮，中间掉的轮次都可以忽略
      const fromTimestampInterval = calcRoundInterval(fromTimestamp);
      const toTimestampInterval = calcRoundInterval(toTimestamp);
      if (toTimestampInterval > fromTimestampInterval) {
        nowTimestamp = calcRoundStartTimestamp(toTimestampInterval);
      }
    }

    const nextRoundGenerators =
      lastRoundEndBlock.height === 1
        ? (lastRoundEndBlock as BFChainCore.GenesisBlock).asset.genesisAsset.nextRoundGenerators
        : (lastRoundEndBlock as BFChainCore.RoundLastBlock).asset.roundLastAsset
            .nextRoundGenerators;

    /**取得剩余可用受托人 */
    const getRestGenerator = async (misRound: number) => {
      //#region
      /**那一轮可使用的受托人 */
      const roundUseableGenertor = new Set<string>();
      if (misRound === 0) {
        for (const d of nextRoundGenerators) {
          roundUseableGenertor.add(d.address);
        }
      } else {
        /**掉到哪一轮 */
        const theRound = currentRound - misRound;
        if (theRound <= 1) {
          /// 创世块那一轮,直接使用传世受托人,不用管第一轮到底是谁在打块
          for (const d of this.config.genesisBlock.asset.genesisAsset.nextRoundGenerators) {
            roundUseableGenertor.add(d.address);
          }
        } else {
          for (const d of nextRoundGenerators) {
            roundUseableGenertor.add(d.address);
          }
        }
      }
      //#endregion

      //#region 那一轮已经使用的受托人
      const usedGenerators = new Set<string>();
      for (const block of thisRoundGeneratorBlocks) {
        if (calcRoundInterval(block.timestamp) === misRound) {
          usedGenerators.add(
            await this.accountBaseHelper.getAddressFromPublicKey(block.generatorPublicKeyBuffer),
          );
        }
      }
      //#endregion

      /// RESULT
      /**剩余可用的受托人 */
      const restGenertors = [] as string[];
      for (const address of roundUseableGenertor) {
        if (usedGenerators.has(address)) {
          continue;
        }
        restGenertors.push(address);
      }
      return restGenertors;
    };
    const sortSeed = lastBlockInfo.signatureBuffer.reduce((r, v) => r + v, 0);

    const sortGenerators = (_generators: string[]) => {
      return _generators.slice().sort((a1, a2) => {
        const sortRes =
          this.getAddressSeedMap(sortSeed).forceGet(a1) -
          this.getAddressSeedMap(sortSeed).forceGet(a2);
        if (sortRes === 0) {
          // 确保排序稳定
          return _generators.indexOf(a1) - _generators.indexOf(a2);
        }
        return sortRes;
      });
    };

    const getResult = (theAddress: string) => {
      return {
        address: theAddress,
        timestamp: this.timeHelper.getTimestampBySlotNumber(
          this.timeHelper.getSlotNumberByTimestamp(nowTimestamp),
        ),
      };
    };

    let yieldCount = 0;

    //#region 在某一轮轮选择受托人
    while (nowTimestamp <= toTimestamp) {
      /**现在掉了多少轮 */
      const nowMisRound = calcRoundInterval(nowTimestamp); // <0 的轮次统一使用第一轮的数据
      /**剩余可用的受托人 */
      const restEnableGenerators = await getRestGenerator(nowMisRound);
      /**可用受托人列表元素个数 */
      const count =
        (calcRoundStartTimestamp(nowMisRound + 1) - nowTimestamp) / this.config.forgeInterval;
      if (restEnableGenerators.length > count) {
        restEnableGenerators.length = count;
      }

      const list = sortGenerators(restEnableGenerators);

      let misList: string[] | undefined;

      do {
        const theAddress = list.shift();

        if (!theAddress) {
          break;
        }

        /// 将受托人返回给外界
        if (yieldSkip > 1) {
          if (++yieldCount === yieldSkip || nowTimestamp === toTimestamp) {
            yieldCount = 0;
            yield getResult(theAddress);
          }
        } else {
          yield getResult(theAddress);
        }

        // 外界否定这个选中的受托人，那么将之推到掉线的列表中
        (misList || (misList = resultMisBlockMap.forceGet(nowMisRound))).push(theAddress);
        nowTimestamp += this.config.forgeInterval;
      } while (list.length);
    }
    //#endregion
  }

  getAddressSeedMap = (seed: number) => {
    const cacheMap = new EasyMap((address: string) => {
      let num = 0;
      for (let i = 1; i < address.length; i++) {
        num += address.charCodeAt(i);
      }
      return (num * seed) % 256;
    });
    return cacheMap;
  };

  async calcNextBlockGenerator(block: BFChainCore.Block) {
    const toTimestamp = block.timestamp + this.config.forgeInterval;
    /// 这里使用fromTimestamp，直接导致掉线人的顺序都直接跳过了，因为我们的目的只是快速地得出当下时间节点应该由谁来打块而已
    for await (const result of this.calcGenerateBlockGeneratorIterator(
      {
        timestamp: block.timestamp,
        height: block.height,
      },
      {
        toTimestamp,
        blockCache: { [block.height]: block },
      },
    )) {
      if (result.timestamp === toTimestamp) {
        return result;
      }
    }
    throw new Error();
  }
}
