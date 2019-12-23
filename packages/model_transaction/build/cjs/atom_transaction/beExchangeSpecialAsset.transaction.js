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
var BeExchangeSpecialAssetTransaction_1;
Object.defineProperty(exports, "__esModule", { value: true });
const core_model_transaction_base_1 = require("@bfchain/core-model-transaction-base");
const core_model_transaction_asset_1 = require("@bfchain/core-model-transaction-asset");
const protobuf_1 = require("@bfchain/protobuf");
/**
 * beExchangeSpecialAsset 交易模型
 *
 */
let BeExchangeSpecialAssetTransaction = BeExchangeSpecialAssetTransaction_1 = class BeExchangeSpecialAssetTransaction extends core_model_transaction_base_1.Transaction {
};
__decorate([
    protobuf_1.Field.d(BeExchangeSpecialAssetTransaction_1.INC++, core_model_transaction_asset_1.BeExchangeSpecialAssetAssetModel),
    __metadata("design:type", core_model_transaction_asset_1.BeExchangeSpecialAssetAssetModel)
], BeExchangeSpecialAssetTransaction.prototype, "asset", void 0);
BeExchangeSpecialAssetTransaction = BeExchangeSpecialAssetTransaction_1 = __decorate([
    protobuf_1.Type.d("BeExchangeSpecialAssetTransaction")
], BeExchangeSpecialAssetTransaction);
exports.BeExchangeSpecialAssetTransaction = BeExchangeSpecialAssetTransaction;
//# sourceMappingURL=beExchangeSpecialAsset.transaction.js.map