import { Injectable } from "@bfchain/util";
import { ConfigHelper } from "@bfchain/core-helper-config";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { ERROR_LIST } from "@bfchain/core-util-exception-errorcode";
import { BaseHelper } from "@bfchain/core-helper-type";
const { ArgumentFormatException } = CoreExceptionGenerator("HELPER", "milestonesHelper");

@Injectable()
export class MilestonesHelper {
  heights: number[];
  rewards: string[];
  genesisAmount: string;
  constructor(public config: ConfigHelper, public baseHelper: BaseHelper) {
    this.isVaildMilestones();
    this.heights = this.config.milestones.heights;
    this.rewards = this.config.milestones.rewards;
    this.genesisAmount = this.config.genesisAmount;
  }

  /**
   * 奖励里程是否合法
   *
   */
  isVaildMilestones() {
    if (!this.baseHelper.isValidChainRewardMilestones(this.config.milestones)) {
      throw new ArgumentFormatException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "milestones",
        target: "config",
      });
    }
  }

  /**
   * 高度转化
   *
   * @param height
   */
  parseHeight(height: number) {
    if (!this.baseHelper.isPositiveInteger(height)) {
      throw new ArgumentFormatException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "height",
        type: "positive integer",
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
   * 计算某个高度的流通总量
   *
   * @param height
   */
  calcSupply(height: number) {
    height = this.parseHeight(height);
    // 根据高度计算当前处于第几奖励周期
    const milestone = Math.floor(this.binarySearchMiles(this.heights, height));
    // 流通的总币数
    let supply = BigInt(this.genesisAmount);
    const rewardAlready = new Map<number, bigint>();
    let mile;
    let multiplier;
    for (let i = 0; i <= milestone; i++) {
      multiplier = BigInt(this.rewards[i]);
      if (i === 0) {
        mile = this.heights[i] - 1; // 第一段是从1高度到第一个元素的高度
      } else if (i === milestone) {
        mile = height - this.heights[i - 1];
      } else {
        mile = this.heights[i] - this.heights[i - 1];
      }
      mile = BigInt(mile);
      rewardAlready.set(i, multiplier * mile);
    }
    rewardAlready.forEach((result, i) => {
      supply += result;
    });
    return supply.toString();
  }

  /**
   * 计算某个高度的流通总量
   *
   */
  calcAllSupply() {
    const lastRewardHeight = this.heights[this.heights.length - 1];
    // 根据高度计算当前处于第几奖励周期
    const milestone = this.heights.length;
    // 流通的总币数
    let supply = BigInt(this.genesisAmount);
    const rewardAlready = new Map<number, bigint>();
    let mile;
    let multiplier;
    for (let i = 0; i <= milestone; i++) {
      multiplier = BigInt(this.rewards[i]);
      if (i === 0) {
        mile = this.heights[i] - 1; // 第一段是从1高度到第一个元素的高度
      } else if (i === milestone) {
        mile = lastRewardHeight - this.heights[i - 1];
      } else {
        mile = this.heights[i] - this.heights[i - 1];
      }
      mile = BigInt(mile);
      rewardAlready.set(i, multiplier * mile);
    }
    rewardAlready.forEach((result, i) => {
      supply += result;
    });
    return supply.toString();
  }
}
