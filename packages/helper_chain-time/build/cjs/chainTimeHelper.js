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
/**区块链时间模块 */
class ChainTimeHelper extends util_1.TimeHelper {
    /**计算出对应时间的时间戳 */
    getTimestamp(time = this.now()) {
        return Math.floor((time - this.config.beginEpochTime) / 1000);
    }
    /**由时间戳计算出时间 */
    getTimeByTimestamp(timestamp) {
        return timestamp * 1000 + this.config.beginEpochTime;
    }
    /**创始块的时间 */
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
    getTimestampBySlotNumber(slot) {
        return slot * this.config.forgeInterval;
    }
    //#endregion
    //#region 通用的格式化时间
    formatTimestamp(timestamp = this.getTimestamp()) {
        return this.formatDateTime(timestamp * 1000 + this.config.beginEpochTime);
    }
}
__decorate([
    util_1.Inject(core_helper_config_1.ConfigHelper),
    __metadata("design:type", core_helper_config_1.ConfigHelper)
], ChainTimeHelper.prototype, "config", void 0);
__decorate([
    util_1.cacheGetter,
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], ChainTimeHelper.prototype, "beginEpochTime", null);
exports.ChainTimeHelper = ChainTimeHelper;
//# sourceMappingURL=chainTimeHelper.js.map