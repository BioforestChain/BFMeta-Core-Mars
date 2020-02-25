import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
export declare class MilestonesHelper {
    config: ConfigHelper;
    baseHelper: BaseHelper;
    heights: number[];
    rewards: string[];
    generateTotalAmount: string;
    constructor(config: ConfigHelper, baseHelper: BaseHelper);
    isVaildMilestones(): void;
    parseHeight(height: number): number;
    binarySearchMiles(array: number[], target: number): number;
    calcReward(height: number): string;
    calcSupply(height: number): string;
}
