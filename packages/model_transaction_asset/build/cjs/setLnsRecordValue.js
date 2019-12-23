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
var SetLnsRecordValueModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const locationNameRecord_1 = require("./locationNameRecord");
const core_model_constants_1 = require("@bfchain/core-model-constants");
/**
 * setLnsRecordValue 交易 asset 模型
 *
 */
let SetLnsRecordValueModel = SetLnsRecordValueModel_1 = class SetLnsRecordValueModel extends protobuf_1.Message {
    toJSON() {
        const res = {
            name: this.name,
            sourceChainName: this.sourceChainName,
            sourceChainMagic: this.sourceChainMagic,
            operationType: this.operationType,
        };
        this.addRecord && (res.addRecord = this.addRecord.toJSON());
        this.deleteRecord && (res.deleteRecord = this.deleteRecord.toJSON());
        return res;
    }
};
SetLnsRecordValueModel.INC = 1;
__decorate([
    protobuf_1.Field.d(SetLnsRecordValueModel_1.INC++, "string"),
    __metadata("design:type", String)
], SetLnsRecordValueModel.prototype, "name", void 0);
__decorate([
    protobuf_1.Field.d(SetLnsRecordValueModel_1.INC++, "string"),
    __metadata("design:type", String)
], SetLnsRecordValueModel.prototype, "sourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(SetLnsRecordValueModel_1.INC++, "string"),
    __metadata("design:type", String)
], SetLnsRecordValueModel.prototype, "sourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(SetLnsRecordValueModel_1.INC++, core_model_constants_1.RECORD_OPERATION_TYPE),
    __metadata("design:type", Number)
], SetLnsRecordValueModel.prototype, "operationType", void 0);
__decorate([
    protobuf_1.Field.d(SetLnsRecordValueModel_1.INC++, locationNameRecord_1.LocationNameRecordInfo, "optional"),
    __metadata("design:type", locationNameRecord_1.LocationNameRecordInfo)
], SetLnsRecordValueModel.prototype, "addRecord", void 0);
__decorate([
    protobuf_1.Field.d(SetLnsRecordValueModel_1.INC++, locationNameRecord_1.LocationNameRecordInfo, "optional"),
    __metadata("design:type", locationNameRecord_1.LocationNameRecordInfo)
], SetLnsRecordValueModel.prototype, "deleteRecord", void 0);
SetLnsRecordValueModel = SetLnsRecordValueModel_1 = __decorate([
    protobuf_1.Type.d("SetLnsRecordValueModel")
], SetLnsRecordValueModel);
exports.SetLnsRecordValueModel = SetLnsRecordValueModel;
/**
 * setLnsRecordValue 交易 asset 外层模型
 *
 */
let SetLnsRecordValueAssetModel = class SetLnsRecordValueAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            lnsRecordValue: this.lnsRecordValue.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, SetLnsRecordValueModel),
    __metadata("design:type", SetLnsRecordValueModel)
], SetLnsRecordValueAssetModel.prototype, "lnsRecordValue", void 0);
SetLnsRecordValueAssetModel = __decorate([
    protobuf_1.Type.d("SetLnsRecordValueAssetModel")
], SetLnsRecordValueAssetModel);
exports.SetLnsRecordValueAssetModel = SetLnsRecordValueAssetModel;
//# sourceMappingURL=setLnsRecordValue.js.map