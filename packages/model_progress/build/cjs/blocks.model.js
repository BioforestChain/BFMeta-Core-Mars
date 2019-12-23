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
var BlocksProgressEventModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const progressEvent_model_1 = require("./progressEvent.model");
const transactions_model_1 = require("./transactions.model");
const core_model_common_1 = require("@bfchain/core-model-common");
/**批量区块的进度事件进度模型 */
let BlocksProgressEventModel = BlocksProgressEventModel_1 = class BlocksProgressEventModel extends progressEvent_model_1.ProgressEventModel {
    toJSON() {
        // const processingDetails = this.processingDetails
        return Object.assign(super.toJSON(), {
            finishedDetails: this.finishedDetails.map(range => range.toJSON()),
            processingDetails: this.processingDetails,
        });
    }
};
__decorate([
    protobuf_1.Field.d(BlocksProgressEventModel_1.INC++, core_model_common_1.RangeModel, "repeated"),
    __metadata("design:type", Array)
], BlocksProgressEventModel.prototype, "finishedDetails", void 0);
__decorate([
    protobuf_1.MapField.d(BlocksProgressEventModel_1.INC++, "uint32", transactions_model_1.TransactionsProgressEventModel),
    __metadata("design:type", Object)
], BlocksProgressEventModel.prototype, "processingDetails", void 0);
BlocksProgressEventModel = BlocksProgressEventModel_1 = __decorate([
    protobuf_1.Type.d("BlocksProgressEvent")
], BlocksProgressEventModel);
exports.BlocksProgressEventModel = BlocksProgressEventModel;
//# sourceMappingURL=blocks.model.js.map