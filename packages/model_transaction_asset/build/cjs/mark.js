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
var MarkModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const dapp_1 = require("./dapp");
/**
 * mark 交易 asset 模型
 *
 */
let MarkModel = MarkModel_1 = class MarkModel extends protobuf_1.Message {
    toJSON() {
        return {
            markPossessor: this.markPossessor,
            content: this.content,
            action: this.action,
            dapp: this.dapp.toJSON(),
        };
    }
};
MarkModel.INC = 1;
__decorate([
    protobuf_1.Field.d(MarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], MarkModel.prototype, "markPossessor", void 0);
__decorate([
    protobuf_1.Field.d(MarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], MarkModel.prototype, "content", void 0);
__decorate([
    protobuf_1.Field.d(MarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], MarkModel.prototype, "action", void 0);
__decorate([
    protobuf_1.Field.d(MarkModel_1.INC++, dapp_1.DAppModel),
    __metadata("design:type", dapp_1.DAppModel)
], MarkModel.prototype, "dapp", void 0);
MarkModel = MarkModel_1 = __decorate([
    protobuf_1.Type.d("MarkModel")
], MarkModel);
exports.MarkModel = MarkModel;
/**
 * mark 交易 asset 外层模型
 *
 */
let MarkAssetModel = class MarkAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            mark: this.mark.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, MarkModel),
    __metadata("design:type", MarkModel)
], MarkAssetModel.prototype, "mark", void 0);
MarkAssetModel = __decorate([
    protobuf_1.Type.d("MarkAssetModel")
], MarkAssetModel);
exports.MarkAssetModel = MarkAssetModel;
//# sourceMappingURL=mark.js.map