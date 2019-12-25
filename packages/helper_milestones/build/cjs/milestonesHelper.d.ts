import { ConfigHelper } from "@bfchain/core-helper-config";
import { BaseHelper } from "@bfchain/core-helper-type";
export declare class MilestonesHelper {
    config: ConfigHelper;
    baseHelper: BaseHelper;
    heights: number[];
    rewards: string[];
    generateTotalAmount: string;
    constructor(config: ConfigHelper, baseHelper: BaseHelper);
    /**
     * 奖励里程是否合法
     *
     */
    isVaildMilestones(): void;
    /**
     * 高度转化
     *
     * @param height
     */
    parseHeight(height: number): number;
    /**
     * 获取奖励数量
     *
     * @param array
     * @param target
     */
    binarySearchMiles(array: number[], target: number): number;
    /**
     * 计算高度奖励
     *
     * @param height
     */
    calcReward(height: number): string;
    /**
     * 计算流通总量
     *
     * @param height
     */
    calcSupply(height: number): string;
}
//# sourceMappingURL=milestonesHelper.d.ts.map