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
const protobuf_1 = require("@bfchain/protobuf");
/**
 * vote 交易 asset 模型
 *
 */
let VoteModel = class VoteModel extends protobuf_1.Message {
    toJSON() {
        return {
            equity: this.equity,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], VoteModel.prototype, "equity", void 0);
VoteModel = __decorate([
    protobuf_1.Type.d("VoteModel")
], VoteModel);
exports.VoteModel = VoteModel;
/**
 * vote 交易 asset 外层模型
 *
 */
let VoteAssetModel = class VoteAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            vote: this.vote.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, VoteModel),
    __metadata("design:type", VoteModel)
], VoteAssetModel.prototype, "vote", void 0);
VoteAssetModel = __decorate([
    protobuf_1.Type.d("VoteAssetModel")
], VoteAssetModel);
exports.VoteAssetModel = VoteAssetModel;
//# sourceMappingURL=vote.js.map