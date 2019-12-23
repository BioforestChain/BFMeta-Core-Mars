import { Injectable } from "@bfchain/util";
import { ConfigHelper } from "./configHelper";
import { CoreExceptionGenerator } from "./exception";
import { PROP_IS_INVALID } from "@bfchain/util-helper-exception-errorcode";
import { BaseHelper } from "./baseHelper";
const { ArgumentFormatException } = CoreExceptionGenerator("HELPER", "milestonesHelper");

@Injectable()
export class MilestonesHelper {
  heights: number[];
  rewards: string[];
  generateTotalAmount: string;
  constructor(public config: ConfigHelper, public baseHelper: BaseHelper) {
    this.isVaildMilestones();
    this.heights = this.config.milestones.heights;
    this.rewards = this.config.milestones.rewards;
    this.generateTotalAmount = this.config.generateTotalAmount;
  }

  /**
   * 奖励里程是否合法
   *
   */
  isVaildMilestones() {
    const Function_Exception_Detail = { function: "isVaildMilestones" };
    if (!this.baseHelper.isValidChainRewardMilestones(this.config.milestones)) {
      throw new ArgumentFormatException(PROP_IS_INVALID, {
        prop: "milestones",
        target: "config",
        ...Function_Exception_Detail,
      });
    }
  }

  /**
   * 高度转化
   *
   * @param height
   */
  parseHeight(height: number) {
    const Function_Exception_Detail = { function: "isVaildMilestones" };
    if (!this.baseHelper.isPositiveInteger(height)) {
      throw new ArgumentFormatException(PROP_IS_INVALID, {
        prop: "height",
        type: "positive integer",
        ...Function_Exception_Detail,
      });
    }
    return Number(height);
  }

  /**
   * 获取奖励数量
   *
   * @param array
   * @param target
   */
  binarySearchMiles(array: number[], target: number) {
    if (array[0] >= target) return 0;
    if (array[array.length - 1] < target) return array.length;
    let left = 0;
    let right = array.length - 1;
    let mid;
    while (left < right) {
      mid = Math.floor((left + right) / 2);
      if (array[mid] >= target) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    return left;
  }

  /**
   * 计算高度奖励
   *
   * @param height
   */
  calcReward(height: number) {
    height = this.parseHeight(height);
    if (height === 1) {
      return "0";
    }
    if (this.heights.length === 0) {
      return "0";
    }
    const mileIndex = Math.floor(this.binarySearchMiles(this.heights, height));
    return this.rewards[mileIndex];
  }

  /**
   * 计算流通总量
   *
   * @param height
   */
  calcSupply(height: number) {
    height = this.parseHeight(height);
    // 根据高度计算当前处于第几奖励周期
    const milestone = Math.floor(this.binarySearchMiles(this.heights, height));
    // 流通的总币数
    let supply = BigInt(this.generateTotalAmount);
    let rewardAlready = new Map<bigint, bigint>();
    let mile;
    let multiplier;
    for (let i = 0; i <= milestone; i++) {
      multiplier = BigInt(this.rewards[i]);
      if (i === 0) {
        mile = 0;
      } else if (i === milestone) {
        mile = height - this.heights[i - 1];
      } else {
        mile = this.heights[i] - this.heights[i - 1];
      }
      mile = BigInt(mile);
      rewardAlready.set(mile, multiplier);
    }
    rewardAlready.forEach((mile, reward) => {
      const mileRewards = mile * reward;
      supply = supply + mileRewards;
    });
    return supply.toString();
  }
}
