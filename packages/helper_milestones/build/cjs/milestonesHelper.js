"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@bfchain/util");
const core_helper_config_1 = require("@bfchain/core-helper-config");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const core_util_exception_errorcode_1 = require("@bfchain/core-util-exception-errorcode");
const core_helper_type_1 = require("@bfchain/core-helper-type");
const { ArgumentFormatException } = core_util_exception_1.CoreExceptionGenerator("HELPER", "milestonesHelper");
let MilestonesHelper = class MilestonesHelper {
    constructor(config, baseHelper) {
        this.config = config;
        this.baseHelper = baseHelper;
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
            throw new ArgumentFormatException(core_util_exception_errorcode_1.PROP_IS_INVALID, {
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
    parseHeight(height) {
        const Function_Exception_Detail = { function: "isVaildMilestones" };
        if (!this.baseHelper.isPositiveInteger(height)) {
            throw new ArgumentFormatException(core_util_exception_errorcode_1.PROP_IS_INVALID, {
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
    binarySearchMiles(array, target) {
        if (array[0] >= target)
            return 0;
        if (array[array.length - 1] < target)
            return array.length;
        let left = 0;
        let right = array.length - 1;
        let mid;
        while (left < right) {
            mid = Math.floor((left + right) / 2);
            if (array[mid] >= target) {
                right = mid;
            }
            else {
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
    calcReward(height) {
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
    calcSupply(height) {
        height = this.parseHeight(height);
        // 根据高度计算当前处于第几奖励周期
        const milestone = Math.floor(this.binarySearchMiles(this.heights, height));
        // 流通的总币数
        let supply = BigInt(this.generateTotalAmount);
        let rewardAlready = new Map();
        let mile;
        let multiplier;
        for (let i = 0; i <= milestone; i++) {
            multiplier = BigInt(this.rewards[i]);
            if (i === 0) {
                mile = 0;
            }
            else if (i === milestone) {
                mile = height - this.heights[i - 1];
            }
            else {
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
};
MilestonesHelper = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_config_1.ConfigHelper, core_helper_type_1.BaseHelper])
], MilestonesHelper);
exports.MilestonesHelper = MilestonesHelper;
//# sourceMappingURL=milestonesHelper.js.map