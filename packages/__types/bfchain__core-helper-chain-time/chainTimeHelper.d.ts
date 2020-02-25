import { TimeHelper } from "@bfchain/util";
export declare class ChainTimeHelper extends TimeHelper {
    private config;
    getTimestamp(time?: number): number;
    getTimeByTimestamp(timestamp: number): number;
    get beginEpochTime(): Date;
    getSlotNumberByTimestamp(timestamp?: number): number;
    getNextSlotNumberByTimestamp(timestamp?: number): number;
    getTimestampBySlotNumber(slot: number): number;
    formatTimestamp(timestamp?: number): string;
}
