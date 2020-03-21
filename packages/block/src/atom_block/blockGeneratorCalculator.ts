import {
  BlockHelper,
  ConfigHelper,
  AccountBaseHelper,
  TransactionHelper,
  ChainTimeHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";
import { Injectable, Inject, EasyMap } from "@bfchain/util";
const { log, NoFoundException } = CoreExceptionGenerator("Core", "BlockGeneratorCalculator");

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
    private transactionHelper: TransactionHelper,
  ) {}
  async calcGenerateBlockDelegate(
    currentBlock: { timestamp: number; height: number },
    opts: {
      nowTimestamp?: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperSimpleInterface;
    },
  ) {
    const {
      nowTimestamp = this.timeHelper.getTimestamp(),
      blockGetterHelper = this.blockHelper.blockGetterHelper,
    } = opts;
    /// RESULT
    const 结果掉块信息 = new Map<number, readonly string[]>();

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

    const 在某一轮轮选择受托人 = async () => {
      const 上一个块的信息 = await 获取上一个块的信息();
      const 上一个块掉到哪一轮 = 计算轮次间隔(上一个块的信息.timestamp);
      const 现在掉到哪一轮 = 计算轮次间隔(nowTimestamp); // <0 的轮次统一使用第一轮的数据

      let i = 上一个块掉到哪一轮;
      while (i !== 现在掉到哪一轮) {
        i++;
        const 剩余可用的受托人 = await 取得剩余可用受托人(i);
        结果掉块信息.set(i, 剩余可用的受托人);
      }
      const 剩余可用的受托人 = await 取得剩余可用受托人(现在掉到哪一轮);

      const { 掉线的受托人, 选中的受托人 } = 从一群受托人中选出一个受托人(
        剩余可用的受托人,
        上一个块的信息,
      );
      结果掉块信息.set(i, 掉线的受托人);
      return 选中的受托人;
    };
    /**
     *
     * @param 这一轮已经出来的区块
     * @param 掉到哪一轮
     */
    const 取得剩余可用受托人 = async (掉到哪一轮: number) => {
      //#region 那一轮可使用的受托人
      const 那一轮可使用的受托人 = [] as string[];
      if (掉到哪一轮 === 0) {
        for (const d of 上一轮轮末块.remark.nextRoundDelegates) {
          那一轮可使用的受托人.push(d.address);
        }
      } else {
        const 那一轮的最低高度 = this.blockHelper.calcRoundStartHeight(掉到哪一轮);
        const 那一轮的最高高度 = Math.min(
          this.blockHelper.calcRoundEndHeight(掉到哪一轮),
          currentBlock.height,
        );
        for (let h = 那一轮的最低高度; h < 那一轮的最高高度; h++) {
          那一轮可使用的受托人.push(
            await this.blockHelper.forceGetBlockGeneratorAddressByHeight(h, blockGetterHelper),
          );
        }
      }
      //#endregion

      //#region 那一轮已经使用的受托人
      const 那一轮已经使用的受托人 = [] as string[];
      for (const block of 这一轮已经出来的区块) {
        if (计算轮次间隔(block.timestamp) === 掉到哪一轮) {
          那一轮已经使用的受托人.push(
            await this.accountBaseHelper.getAddressFromPublicKey(block.generatorPublicKeyBuffer),
          );
        }
      }
      //#endregion

      //#region 那一轮已经掉线的受托人
      const 那一轮已经掉线的受托人 = [] as string[];
      for (const block of 这一轮已经出来的区块) {
        const 那一轮这个块掉线的受托人 = block.roundOfflineGeneratersReadonlyMap.get(掉到哪一轮);
        if (那一轮这个块掉线的受托人) {
          那一轮已经掉线的受托人.push(...那一轮这个块掉线的受托人);
        }
      }
      //#endregion

      /// RESULT
      const 剩余可用的受托人 = new Set(那一轮可使用的受托人);
      for (const address of 那一轮已经使用的受托人) {
        剩余可用的受托人.delete(address);
      }
      for (const address of 那一轮已经掉线的受托人) {
        剩余可用的受托人.delete(address);
      }

      return [...剩余可用的受托人];
    };
    /**
     * @param 这一轮已经出来的区块
     */
    const 获取上一个块的信息 = async () => {
      return this.blockHelper.forceGetBlockByHeight(currentBlock.height, blockGetterHelper);
    };
    /**
     * 指定时间来说,应该到了哪一轮
     * @return 从0开始的正整数
     * @param timestamp
     */
    const 计算轮次间隔 = (timestamp: number) => {
      return Math.floor(
        (timestamp - 上一轮轮末块.timestamp) /
          this.config.forgeInterval /
          this.config.blockPerRound,
      );
    };
    /**
     *
     * @param 候选名单
     * @param 上一个块的信息
     */
    const 从一群受托人中选出一个受托人 = (
      候选名单: string[],
      上一个块的信息: BFChainCore.Block,
    ) => {
      // id转ASCII码 根据ascii码总和取余 算出打块人下标

      const seed =
        上一个块的信息.generatorPublicKeyBuffer.reduce((r, v) => r + v, 0) +
        this.timeHelper.getSlotNumberByTimestamp(nowTimestamp);
      const addressToNum = new EasyMap((address: string) => {
        let num = 0;
        for (let i = 1; i < address.length; i++) {
          num += (address.charCodeAt(i) * seed) % seed;
        }
        return num;
      });

      候选名单.sort((a1, a2) => addressToNum.forceGet(a1) - addressToNum.forceGet(a2));

      const 最后一阶段的掉块数 =
        (this.timeHelper.getSlotNumberByTimestamp(nowTimestamp) -
          this.timeHelper.getSlotNumberByTimestamp(上一个块的信息.timestamp)) %
        this.config.blockPerRound;

      /// 基于nowTimestamp进行筛选
      return {
        掉线的受托人: 候选名单.slice(0, 最后一阶段的掉块数),
        选中的受托人: 候选名单[最后一阶段的掉块数],
      };
    };

    return {
      roundOfflineGeneratersMap: 结果掉块信息,
      address: await 在某一轮轮选择受托人(),
      timestamp: this.timeHelper.getTimestampBySlotNumber(
        this.timeHelper.getSlotNumberByTimestamp(nowTimestamp),
      ),
    };
  }
}
