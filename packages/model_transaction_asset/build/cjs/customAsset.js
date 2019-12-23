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
//import { getHexFromArrayBuffer, parseHexToArrayBuffer } from "../../helper/hexBufferHelper";
/**
 * CustomAsset 类型
 *
 */
let CustomModel = class CustomModel extends protobuf_1.Message {
    toJSON() {
        return {
            type: this.type,
            data: this.data,
        };
    }
};
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], CustomModel.prototype, "type", void 0);
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], CustomModel.prototype, "data", void 0);
CustomModel = __decorate([
    protobuf_1.Type.d("CustomModel")
], CustomModel);
exports.CustomModel = CustomModel;
/**
 * 自定义 交易 asset 外层模型
 *
 */
let CustomAssetModel = class CustomAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            custom: this.custom.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, CustomModel),
    __metadata("design:type", CustomModel)
], CustomAssetModel.prototype, "custom", void 0);
CustomAssetModel = __decorate([
    protobuf_1.Type.d("CustomAssetModel")
], CustomAssetModel);
exports.CustomAssetModel = CustomAssetModel;
//# sourceMappingURL=customAsset.js.map