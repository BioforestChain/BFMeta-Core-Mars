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
const atom_channel_1 = require("./atom_channel");
const util_1 = require("@bfchain/util");
const core_model_constants_1 = require("@bfchain/core-model-constants");
/**实现通用的双工通讯规范 */
let ChannelCore = class ChannelCore {
    constructor(moduleMap) {
        this.moduleMap = moduleMap;
        this._groupNameAcc = 1;
    }
    /**传入事件监听器，返回封装过的双工通讯 */
    registryChannel(channelEndpoint, CustomChainChannel = atom_channel_1.ChainChannel, moduleMap = this.moduleMap) {
        const chainChannel = util_1.Resolve(CustomChainChannel, new util_1.ModuleStroge([[core_model_constants_1.CHANNEL_ARGS.ENDPOINT, channelEndpoint]], moduleMap));
        return chainChannel;
    }
    /**传入一组双工通讯的链接，返回一个批量双工通讯管理器 */
    groupChannel(chainChannelList, groupName = `G${this._groupNameAcc++}`) {
        const { moduleMap } = this;
        const channelGroup = util_1.Resolve(atom_channel_1.ChainChannelGroup, new util_1.ModuleStroge([
            [atom_channel_1.CHAIN_CHANNEL_GROUP_ARGS.CHANNEL_LIST, chainChannelList],
            [atom_channel_1.CHAIN_CHANNEL_GROUP_ARGS.GROUP_NAME, groupName],
        ], moduleMap));
        return channelGroup;
    }
};
ChannelCore = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [util_1.ModuleStroge])
], ChannelCore);
exports.ChannelCore = ChannelCore;
//# sourceMappingURL=channel.js.map