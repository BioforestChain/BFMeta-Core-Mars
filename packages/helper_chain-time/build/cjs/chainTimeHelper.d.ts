import { TimeHelper } from "@bfchain/util";
/**区块链时间模块 */
export declare class ChainTimeHelper extends TimeHelper {
    private config;
    /**计算出对应时间的时间戳 */
    getTimestamp(time?: number): number;
    /**由时间戳计算出时间 */
    getTimeByTimestamp(timestamp: number): number;
    /**创始块的时间 */
    get beginEpochTime(): Date;
    /**
     * 获取指定时间对应的区块链插槽时间对应的信号量
     * 可以指代当前时间段，应该开始锻造区块的那个时间点对应的信号量
     */
    getSlotNumberByTimestamp(timestamp?: number): number;
    /**
     * 获取下一个插槽时间的信号量
     * 可以指代下一次锻造区块的那个时间点对应的信号量
     */
    getNextSlotNumberByTimestamp(timestamp?: number): number;
    /**
     * 获取指定信号量对应的区块链 [插槽时间](https://en.wikipedia.org/wiki/Slot_time)
     * @param slot
     */
    getTimestampBySlotNumber(slot: number): number;
    formatTimestamp(timestamp?: number): string;
}
//# sourceMappingURL=chainTimeHelper.d.ts.map