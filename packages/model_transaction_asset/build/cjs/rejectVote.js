"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
/**
 * rejectVote 交易 asset 模型
 *
 */
let RejectVoteAssetModel = class RejectVoteAssetModel extends protobuf_1.Message {
    toJSON() {
        return {};
    }
};
RejectVoteAssetModel = __decorate([
    protobuf_1.Type.d("RejectVoteAssetModel")
], RejectVoteAssetModel);
exports.RejectVoteAssetModel = RejectVoteAssetModel;
//# sourceMappingURL=rejectVote.js.map