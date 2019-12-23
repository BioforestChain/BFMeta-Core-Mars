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
var BlockchainRebuidingProgressEventModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const blocks_model_1 = require("./blocks.model");
const progressEvent_model_1 = require("./progressEvent.model");
/**区块链重建中的事件进度模型 */
let BlockchainRebuidingProgressEventModel = BlockchainRebuidingProgressEventModel_1 = class BlockchainRebuidingProgressEventModel extends progressEvent_model_1.ProgressEventModel {
    toJSON() {
        return Object.assign(super.toJSON(), {
            currentBlockDetails: this.currentBlockDetails.toJSON(),
        });
    }
};
__decorate([
    protobuf_1.Field.d(BlockchainRebuidingProgressEventModel_1.INC++, blocks_model_1.BlocksProgressEventModel),
    __metadata("design:type", blocks_model_1.BlocksProgressEventModel)
], BlockchainRebuidingProgressEventModel.prototype, "currentBlockDetails", void 0);
BlockchainRebuidingProgressEventModel = BlockchainRebuidingProgressEventModel_1 = __decorate([
    protobuf_1.Type.d("BlockchainRebuidingProgressEvent")
], BlockchainRebuidingProgressEventModel);
exports.BlockchainRebuidingProgressEventModel = BlockchainRebuidingProgressEventModel;
/**区块链节点扫描共识中的事件进度模型
 * 大部分情况处于 INDETERMINATE 模式
 * 在扫描节点阶段, total 会一直增加
 * 同时会进行共识, 此时的 loaded 会不断的变动
 */
let BlockchainPeerScanningProgressEventModel = class BlockchainPeerScanningProgressEventModel extends progressEvent_model_1.ProgressEventModel {
};
BlockchainPeerScanningProgressEventModel = __decorate([
    protobuf_1.Type.d("BlockchainPeerScanningProgressEvent")
], BlockchainPeerScanningProgressEventModel);
exports.BlockchainPeerScanningProgressEventModel = BlockchainPeerScanningProgressEventModel;
/**区块链验证区块的事件进度模型
 * total 代表着校验交易的数量, 另外每一个区块另外代表着 1 个任务数
 * 验证的过程中如果收到新的区块, 那么 total 也要跟着增加
 */
let BlockchainReplayBlockProgressEventModel = class BlockchainReplayBlockProgressEventModel extends progressEvent_model_1.ProgressEventModel {
    toJSON() {
        const applyDetails = {};
        for (const h in this.applyDetails) {
            applyDetails[h] = this.applyDetails[h].toJSON();
        }
        const syncDetails = {};
        for (const h in this.syncDetails) {
            syncDetails[h] = this.syncDetails[h].toJSON();
        }
        return Object.assign(super.toJSON(), {
            applyDetails,
            syncDetails,
        });
    }
};
__decorate([
    protobuf_1.MapField.d(BlockchainRebuidingProgressEventModel.INC++, "uint32", blocks_model_1.BlocksProgressEventModel),
    __metadata("design:type", Object)
], BlockchainReplayBlockProgressEventModel.prototype, "applyDetails", void 0);
__decorate([
    protobuf_1.MapField.d(BlockchainRebuidingProgressEventModel.INC++, "uint32", blocks_model_1.BlocksProgressEventModel),
    __metadata("design:type", Object)
], BlockchainReplayBlockProgressEventModel.prototype, "syncDetails", void 0);
BlockchainReplayBlockProgressEventModel = __decorate([
    protobuf_1.Type.d("BlockchainReplayBlockProgressEvent")
], BlockchainReplayBlockProgressEventModel);
exports.BlockchainReplayBlockProgressEventModel = BlockchainReplayBlockProgressEventModel;
let BlockchainRollbackProgressEventModel = class BlockchainRollbackProgressEventModel extends progressEvent_model_1.ProgressEventModel {
};
BlockchainRollbackProgressEventModel = __decorate([
    protobuf_1.Type.d("BlockchainRollbackProgressEventModel")
], BlockchainRollbackProgressEventModel);
exports.BlockchainRollbackProgressEventModel = BlockchainRollbackProgressEventModel;
/**区块链锻造区块的事件进度模型 */
let BlockchainGeneratingProgressEventModel = class BlockchainGeneratingProgressEventModel extends progressEvent_model_1.ProgressEventModel {
};
BlockchainGeneratingProgressEventModel = __decorate([
    protobuf_1.Type.d("BlockchainGeneratingProgressEvent")
], BlockchainGeneratingProgressEventModel);
exports.BlockchainGeneratingProgressEventModel = BlockchainGeneratingProgressEventModel;
//# sourceMappingURL=blockchainStatus.model.js.map