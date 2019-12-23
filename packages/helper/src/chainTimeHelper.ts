import {
  Injectable,
  PlatformHelper,
  ModuleStroge,
  sleep,
  cacheGetter,
  TimeHelper,
  Inject,
} from "@bfchain/util";
import { CoreExceptionGenerator } from "./exception/ExceptionGenerator";
import { ConfigHelper } from "./configHelper";
const { info } = CoreExceptionGenerator("Core", "Time");

/**区块链时间模块 */
export class ChainTimeHelper extends TimeHelper {
  @Inject(ConfigHelper)
  private config!: ConfigHelper;

  /**计算出对应时间的时间戳 */
  getTimestamp(time = this.now()) {
    return Math.floor((time - this.config.beginEpochTime) / 1000);
  }
  /**由时间戳计算出时间 */
  getTimeByTimestamp(timestamp: number) {
    return timestamp * 1000 + this.config.beginEpochTime;
  }
  /**创始块的时间 */
  @cacheGetter
  get beginEpochTime() {
    return new Date(this.config.beginEpochTime);
  }
  //#region slot
  /**
   * 获取指定时间对应的区块链插槽时间对应的信号量
   * 可以指代当前时间段，应该开始锻造区块的那个时间点对应的信号量
   */
  getSlotNumberByTimestamp(timestamp = this.getTimestamp()) {
    return Math.floor(timestamp / this.config.forgeInterval);
  }
  /**
   * 获取下一个插槽时间的信号量
   * 可以指代下一次锻造区块的那个时间点对应的信号量
   */
  getNextSlotNumberByTimestamp(timestamp = this.getTimestamp()) {
    return this.getSlotNumberByTimestamp(timestamp) + 1;
  }
  /**
   * 获取指定信号量对应的区块链 [插槽时间](https://en.wikipedia.org/wiki/Slot_time)
   * @param slot
   */
  getTimestampBySlotNumber(slot: number) {
    return slot * this.config.forgeInterval;
  }
  //#endregion

  //#region 通用的格式化时间
  formatTimestamp(timestamp = this.getTimestamp()) {
    return this.formatDateTime(timestamp * 1000 + this.config.beginEpochTime);
  }
  //#endregion
}
