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
 * setLnsManager 交易 asset 模型
 *
 */
let SetLnsManagerModel = class SetLnsManagerModel extends protobuf_1.Message {
    toJSON() {
        return {
            name: this.name,
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            manager: this.manager,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], SetLnsManagerModel.prototype, "name", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], SetLnsManagerModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(3, "string"),
    __metadata("design:type", String)
], SetLnsManagerModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(4, "string"),
    __metadata("design:type", String)
], SetLnsManagerModel.prototype, "manager", void 0);
SetLnsManagerModel = __decorate([
    protobuf_1.Type.d("SetLnsManagerModel")
], SetLnsManagerModel);
exports.SetLnsManagerModel = SetLnsManagerModel;
/**
 * setLnsManager 交易 asset 外层模型
 *
 */
let SetLnsManagerAssetModel = class SetLnsManagerAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            lnsManager: this.lnsManager.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, SetLnsManagerModel),
    __metadata("design:type", SetLnsManagerModel)
], SetLnsManagerAssetModel.prototype, "lnsManager", void 0);
SetLnsManagerAssetModel = __decorate([
    protobuf_1.Type.d("SetLnsManagerAssetModel")
], SetLnsManagerAssetModel);
exports.SetLnsManagerAssetModel = SetLnsManagerAssetModel;
//# sourceMappingURL=setLnsManager.js.map