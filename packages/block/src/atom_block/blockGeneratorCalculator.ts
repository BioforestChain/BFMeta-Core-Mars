import {
  BlockHelper,
  ConfigHelper,
  AccountBaseHelper,
  TransactionHelper,
  ChainTimeHelper,
} from "@bfchain/core-helper";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";
import { Block, RoundLastBlock } from "@bfchain/core-model-block";
import { Injectable, Inject, TaskList } from "@bfchain/util";
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
  @Inject("blockGetterHelper", { optional: true, dynamics: true })
  private blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
  /**获取当前时间戳锻造要区块的委托人地址 */
  async calcGenerateBlockDelegate(
    currentBlock: { timestamp: number; height: number },
    opts: {
      usedAddressCache?: Map<number, { id: string; timestamp: number; address: string }>;
      curTime?: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
    },
  ): Promise<{
    address: string;
    timestamp: number;
  }> {
    /**缓存着区块高度对应的锻造者地址 */
    const usedAddressCache =
      opts.usedAddressCache ||
      new Map<number, { id: string; timestamp: number; address: string }>();
    /**当前区块链时间对应的插槽时间信号量 */
    const cur_time = typeof opts.curTime === "number" ? opts.curTime : this.timeHelper.now();
    /**新块的slot */
    const new_block_slot_number = Math.max(
      this.timeHelper.getSlotNumberByTimestamp(this.timeHelper.getTimestamp(cur_time)),
      this.timeHelper.getNextSlotNumberByTimestamp(currentBlock.timestamp),
    );
    const blockGetterHelper = (opts.blockGetterHelper ||
      this.blockGetterHelper) as BFChainCore.BlockGetterHelperInterface;
    /**新块的timestamp */
    const resultTimestamp = this.timeHelper.getTimestampBySlotNumber(new_block_slot_number);
    const result = {
      address: "",
      timestamp: resultTimestamp,
    };
    /**当前最后一个区块对应的信号量 */
    const block_slot = this.timeHelper.getSlotNumberByTimestamp(currentBlock.timestamp);
    // log(
    //   "next slot=%o, realLastblock slot=%o,lastBlockHeight: %o",
    //   new_block_slot_number,
    //   block_slot,
    //   currentBlock.height,
    // );
    /**新块高度 */
    const new_block_height = currentBlock.height + 1;
    /**当前轮次 */
    const current_round = this.blockHelper.calcRoundByHeight(new_block_height);
    /**上一轮最后一个区块的timestamp */
    let roundLastBlockTimestamp!: number;
    if (current_round === 1) {
      roundLastBlockTimestamp = this.config.genesisBlock.timestamp;
    } else {
      const per_round_last_height = this.blockHelper.calcRoundStartHeight(current_round) - 1;
      roundLastBlockTimestamp = (
        await this.blockHelper.forceGetBlockByHeight(per_round_last_height, blockGetterHelper)
      ).timestamp;
    }
    /**当前轮次的最大插槽时间信号量 */
    const max_slot_number = this.timeHelper.getSlotNumberByTimestamp(
      roundLastBlockTimestamp + this.config.blockPerRound * this.config.forgeInterval,
    );
    /**是否启用应急受托人 */
    const isEmergency = new_block_slot_number > max_slot_number;
    if (!isEmergency) {
      const delegates: string[] = [];
      /// 高度过低，使用从创始块中选区受托人
      if (new_block_height <= this.config.blockPerRound) {
        this.config.genesisBlock.remark.nextRoundDelegates.forEach(v => {
          delegates.push(v.address);
        });
      } else {
        /// 从上一轮的投票结果中选区受托人
        const perRoundLastBlock = (await this.blockHelper.forceGetBlockByHeight(
          this.blockHelper.calcRoundStartHeight(current_round) - 1,
          blockGetterHelper,
        )) as RoundLastBlock;
        const roundRemark = perRoundLastBlock.remark;
        delegates.push(...roundRemark.nextRoundDelegateAddressList);
      }
      result.address = await this._pickDelegateAddressCommon(new_block_height, delegates, {
        usedAddressCache,
        new_block_slot_number,
        blockGetterHelper,
      });
      return result;
    } else {
      /**启用应急受托人 */
      result.address = await this._pickEmergencyDelegateAddress(new_block_height, {
        currentBlock,
        usedAddressCache,
        max_slot_number,
        current_round,
        new_block_slot_number,
        blockGetterHelper,
      });
      return result;
    }
  }
  private __idNumberMap = new Map<string, number>();
  async *calcGenerateBlockDelegateGenerator(
    currentBlock: { timestamp: number; height: number },
    opts: {
      heightAcc: number;
      timeAcc?: number;
      curTime?: number;
      blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
      cache_block?: { [height: number]: Promise<Block | undefined> };
      usedAddressCache?: Map<number, { id: string; timestamp: number; address: string }>;
    },
  ) {
    this.__idNumberMap.clear();
    const heightAcc = opts.heightAcc;
    const timeAcc = opts.timeAcc || this.config.forgeInterval;
    const usedAddressCache =
      opts.usedAddressCache ||
      new Map<number, { id: string; timestamp: number; address: string }>();
    let timestamp = currentBlock.timestamp;
    let height = currentBlock.height;
    let curTime = opts.curTime || this.timeHelper.now();
    const blockGetterHelper = opts.blockGetterHelper || this.blockGetterHelper;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        function: "BlockGetterHelper.forceGetBlockById",
      });
    }
    /**
     * 带缓存共功能的`blockGetterHelpergetter`
     */

    const cache_block: { [height: number]: Promise<Block | undefined> } = opts.cache_block || {};
    const _getBlockByHeight = blockGetterHelper.getBlockByHeight.bind(blockGetterHelper);
    blockGetterHelper.getBlockByHeight = (height: number) => {
      if (cache_block[height]) {
        return cache_block[height];
      }
      cache_block[height] = _getBlockByHeight(height);
      return cache_block[height];
    };
    try {
      do {
        const res = await this.calcGenerateBlockDelegate(
          { timestamp, height },
          {
            usedAddressCache,
            curTime,
            blockGetterHelper,
          },
        );
        yield res;
        // timestamp = (yield res) || res.timestamp;
        height += heightAcc;
        curTime = this.timeHelper.getTimeByTimestamp(res.timestamp + timeAcc);
      } while (true);
    } finally {
      blockGetterHelper.getBlockByHeight = _getBlockByHeight;
    }
  }
  /**
   * 获取账户地址的`Hash`值
   * 字符串ascii码的和
   * @TODO [温宇强] 是否有证明过使用地址算出来的数字在使用的时候是等概率的吗？
   */
  private _getStringHash(str: string): number {
    const result = this.__idNumberMap.get(str);
    if (result) {
      return result;
    } else {
      let num = 0;
      for (let char of str) num += char.charCodeAt(0);
      // const buf = Buffer.from(str);
      // const num = buf.readUInt16LE(0);
      this.__idNumberMap.set(str, num);
      return num;
    }
  }
  /**选取受托人函数 */
  private async _pickDelegateAddressCommon(
    new_block_height: number,
    delegates: string[],
    opts: {
      usedAddressCache: Map<number, { id: string; timestamp: number; address: string }>;
      new_block_slot_number: number;
      blockGetterHelper: BFChainCore.BlockGetterHelperInterface;
    },
  ) {
    const { usedAddressCache, new_block_slot_number, blockGetterHelper } = opts;
    const current_round = this.blockHelper.calcRoundByHeight(new_block_height);
    const per_round_last_height = this.blockHelper.calcRoundStartHeight(current_round) - 1;
    //判断是否丢失块打包数据，是的话进行恢复，并更新id值
    const { usedAddressMap, curBlockId } = await this._recoverUsedGeneratorAddressMap(
      new_block_height - 1,
      usedAddressCache,
      blockGetterHelper,
    );
    const _arr: string[] = [];
    usedAddressMap.forEach((val, key, map) => {
      if (key <= per_round_last_height) {
        map.delete(key);
      } else {
        _arr.push(val.address);
      }
    });
    const usedAddressList = Object.freeze(_arr);
    /**计算还未使用过的地址 */
    const unUsedAddressList = delegates.filter(add => !usedAddressList.includes(add));
    //id转ASCII码 根据ascii码总和取余 算出打块人下标
    unUsedAddressList.sort();
    const i = (this._getStringHash(curBlockId) + new_block_slot_number) % unUsedAddressList.length;
    const delegateAddress = unUsedAddressList[i];
    return delegateAddress;
  }
  /**
   * 挑选应急受托人
   * 没读懂代码千万别乱改。 - by wzx
   * @param new_block_height
   * @param opts
   */
  private async _pickEmergencyDelegateAddress(
    new_block_height: number,
    opts: {
      currentBlock: { timestamp: number; height: number };
      usedAddressCache: Map<number, { id: string; timestamp: number; address: string }>;
      new_block_slot_number: number;
      max_slot_number: number;
      current_round: number;
      blockGetterHelper: BFChainCore.BlockGetterHelperInterface;
    },
  ) {
    const {
      currentBlock,
      new_block_slot_number,
      max_slot_number,
      current_round,
      blockGetterHelper,
      usedAddressCache,
    } = opts;

    const miss_round = Math.ceil(
      (new_block_slot_number - max_slot_number) / this.config.blockPerRound,
    );
    let delegateAddressList: string[] = [];
    /**要使用哪一轮次的受托人进行应急 */
    const target_round =
      current_round > miss_round ? current_round - (miss_round % current_round) : 1;
    if (target_round > 1) {
      /**还没掉到创世块 */
      const endHeight = target_round * this.config.blockPerRound;
      const startHeight = endHeight - this.config.blockPerRound + 1;
      const targetRoundMap = await this._fillUsedAddressMap(
        startHeight,
        endHeight,
        usedAddressCache,
        blockGetterHelper,
      );
      targetRoundMap.forEach((val, key) => {
        if (key <= endHeight || key >= startHeight) {
          delegateAddressList.push(val.address);
        }
      });
    } else {
      /**掉到创世块，使用创世块的受托人 */
      this.config.genesisBlock.remark.nextRoundDelegates.forEach(v => {
        delegateAddressList.push(v.address);
      });
      // delegateAddressList.push(...this.transactionHelper.genesisDelegates());
    }
    delegateAddressList.sort();
    const { usedAddressMap: thisRoundMap, curBlockId } = await this._recoverUsedGeneratorAddressMap(
      new_block_height - 1,
      usedAddressCache,
      blockGetterHelper,
    );
    /**从哪个区块开始启用这一轮的应急受托人 */
    let _start_emergency_height = new_block_height - 1;
    do {
      const block = thisRoundMap.get(_start_emergency_height);
      if (block) {
        const slot = this.timeHelper.getSlotNumberByTimestamp(block.timestamp);
        const _miss_round = Math.ceil((slot - max_slot_number) / this.config.blockPerRound);
        if (miss_round !== _miss_round) {
          break;
        }
      } else {
        break;
      }
      _start_emergency_height--;
    } while (true);
    _start_emergency_height = _start_emergency_height + 1;
    const tempMissCountArr: number[] = [];
    // console.log(`从 ${_start_emergency_height} 开始掉线,当前是 ${new_block_height}`);
    // fileLog(`miss_round: ....................... ${miss_round}`);
    /**计算这个区块到新块掉线的人 */
    for (let calcHeight = _start_emergency_height; calcHeight < new_block_height; calcHeight++) {
      let b = thisRoundMap.get(calcHeight);
      let b2 = thisRoundMap.get(calcHeight - 1);
      if (b && b2) {
        /**如果是中间的块则只要求出两个区块之间的slot就可以了 */
        let missCount =
          (this.timeHelper.getSlotNumberByTimestamp(b.timestamp) -
            this.timeHelper.getSlotNumberByTimestamp(b2.timestamp)) %
          this.config.blockPerRound;
        /**如果是第一个掉线的块，要算一下是从这个块的哪个slot开始掉的 */
        if (calcHeight === _start_emergency_height) {
          missCount =
            (this.timeHelper.getSlotNumberByTimestamp(b.timestamp) - max_slot_number) %
            this.config.blockPerRound;
        }
        /**需要用到前块id去取余数 */
        const preId = thisRoundMap.get(calcHeight - 1);
        // 重现去除的受托人
        if (preId) {
          const lastMiss =
            tempMissCountArr.length > 0 ? tempMissCountArr.reduce((a, b) => a + b) : 0;
          // console.log(`        2.计算区块${calcHeight}的使用了人数${missCount} 以往掉线 ${lastMiss}`);
          for (let miss = 1; miss <= missCount; miss++) {
            const _slot = (miss + lastMiss) % this.config.blockPerRound;
            const reminer = (this._getStringHash(preId.id) + _slot) % delegateAddressList.length;
            delegateAddressList.splice(reminer, 1);
          }
        } else {
          throw new Error(`no ${calcHeight - 1}`);
        }
        tempMissCountArr.push(missCount);
      } else {
        throw new Error(`no ${calcHeight}`);
      }
    }
    // 计算当前块掉的人数，如果本区块是第一个开始启用应急受托人
    if (_start_emergency_height === new_block_height) {
      const missCount2 = (new_block_slot_number - max_slot_number - 1) % this.config.blockPerRound;
      // console.log(`        1. 首个应急块${_start_emergency_height}~   ${missCount2}`);
      for (let i = 1; i <= missCount2; i++) {
        const slot = i % this.config.blockPerRound;
        const reminer = (this._getStringHash(curBlockId) + slot) % delegateAddressList.length;
        delegateAddressList.splice(reminer, 1);
      }
    } else {
      // 计算当前块掉的人数，如果本区块为已启用应急受托人的计算
      const missCount =
        (new_block_slot_number -
          1 -
          this.timeHelper.getSlotNumberByTimestamp(currentBlock.timestamp)) %
        this.config.blockPerRound;
      // console.log(
      //   `        3. 后面的应急块${new_block_height} miss: ${missCount}   ${new_block_slot_number}  . ${max_slot_number}  . ${this.timeHelper.getSlotNumberByTimestamp(
      //     currentBlock.timestamp,
      //   )}`,
      // );
      const preId = thisRoundMap.get(new_block_height - 1);
      if (!preId) throw new Error(` no ${new_block_height - 1}`);
      for (let i = missCount; i > 0; i--) {
        const slot = (new_block_slot_number - max_slot_number - i) % this.config.blockPerRound;
        const reminer = (this._getStringHash(preId.id) + slot) % delegateAddressList.length;
        delegateAddressList.splice(reminer, 1);
      }
    }
    const resultSlot = (new_block_slot_number - max_slot_number) % this.config.blockPerRound;
    const _r = (this._getStringHash(curBlockId) + resultSlot) % delegateAddressList.length;
    const address = delegateAddressList[_r];

    // console.log(
    //   `${this._getStringHash(curBlockId)}  ${
    //     delegateAddressList.length
    //   }   height: ${new_block_height} ${address} # ${miss_round} ###################### new_block_slot_number: ${new_block_slot_number} slot:${resultSlot} `,
    // );
    return address;
  }
  /**恢复丢失的打块人地址数据 */
  private async _recoverUsedGeneratorAddressMap(
    curHeight: number,
    usedAddressCache: Map<number, { id: string; timestamp: number; address: string }>,
    blockGetterHelper: BFChainCore.BlockGetterHelperInterface,
  ) {
    /**只针对当前轮次到当前高度为止的数据
     * 这里独立写入一份副本中 */
    const usedAddressMap = await this._fillUsedAddressMap(
      Math.max(curHeight - (curHeight % this.config.blockPerRound), 1),
      curHeight,
      usedAddressCache,
      blockGetterHelper,
    );

    const curBlockId = await this.blockHelper.forceGetBlockIdByHeight(curHeight, blockGetterHelper);

    return { usedAddressMap, curBlockId };
  }
  /**获取出一份指定高度范围的区块高度与锻造者映射表 */
  private async _fillUsedAddressMap(
    minHeight: number,
    maxHeight: number,
    usedAddressCache: Map<number, { id: string; timestamp: number; address: string }>,
    blockGetterHelper: BFChainCore.BlockGetterHelperInterface,
  ) {
    const usedAddressMap = new Map<number, { id: string; timestamp: number; address: string }>();
    const taskList = new TaskList();

    // 获取丢失的打块人缓存的块数据
    for (let height = minHeight; height <= maxHeight; height++) {
      const address = usedAddressCache.get(height);
      if (address) {
        usedAddressMap.set(height, address);
      } else {
        taskList.next = this.blockHelper
          .forceGetBlockByHeight(height, blockGetterHelper)
          .then(_block => {
            usedAddressMap.set(height, {
              address: this.accountBaseHelper.getAddressFromPublicKeyString(
                _block.generatorPublicKey,
              ),
              id: _block.id,
              timestamp: _block.timestamp,
            });
            usedAddressCache.set(height, {
              address: this.accountBaseHelper.getAddressFromPublicKeyString(
                _block.generatorPublicKey,
              ),
              id: _block.id,
              timestamp: _block.timestamp,
            });
          });
      }
    }
    await taskList.toPromise();
    return usedAddressMap;
  }
  //#endregion
}
