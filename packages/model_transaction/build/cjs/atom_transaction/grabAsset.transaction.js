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
var GrabAssetTransaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_model_transaction_base_1 = require("@bfchain/core-model-transaction-base");
const core_model_transaction_asset_1 = require("@bfchain/core-model-transaction-asset");
const protobuf_1 = require("@bfchain/protobuf");
/**
 * grabAsset 交易模型
 *
 */
let GrabAssetTransaction = GrabAssetTransaction_1 = class GrabAssetTransaction extends core_model_transaction_base_1.Transaction {
};
__decorate([
    protobuf_1.Field.d(GrabAssetTransaction_1.INC++, core_model_transaction_asset_1.GrabAssetAssetModel),
    __metadata("design:type", core_model_transaction_asset_1.GrabAssetAssetModel)
], GrabAssetTransaction.prototype, "asset", void 0);
GrabAssetTransaction = GrabAssetTransaction_1 = __decorate([
    protobuf_1.Type.d("GrabAssetTransaction")
], GrabAssetTransaction);
exports.GrabAssetTransaction = GrabAssetTransaction;
//# sourceMappingURL=grabAsset.transaction.js.map