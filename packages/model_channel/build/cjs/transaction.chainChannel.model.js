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
var TransactionQueryOptions_1, TransactionSortOptions_1, QueryTransactionReturnModel_1, NewTransactionArgModel_1, NewTransactionReturnModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const common_chainChannel_model_1 = require("./common.chainChannel.model");
const core_model_transaction_1 = require("@bfchain/core-model-transaction");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const constants_1 = require("./constants");
/**
 * 查询交易的查询条件
 */
let TransactionQueryOptions = TransactionQueryOptions_1 = class TransactionQueryOptions extends protobuf_1.Message {
    get signature() {
        return (this.signatureBuffer && util_encoding_hex_1.getHexFromArrayBuffer(this.signatureBuffer)) || undefined;
    }
    set signature(value) {
        /// 空字符串也当成undefined处理
        this.signatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.signature && (res.signature = object.signature);
        }
        return res;
    }
    toJSON() {
        return {
            type: this.type,
            signature: this.signature,
            senderId: this.senderId,
            recipientId: this.recipientId,
            minHeight: this.minHeight,
            blockId: this.blockId,
            maxHeight: this.maxHeight,
            storage: this.storage,
            trusteeId: this.trusteeId,
            purchaseDAppid: this.purchaseDAppid,
            dappid: this.dappid,
            lns: this.lns,
            offset: this.offset,
            limit: this.limit,
        };
    }
};
TransactionQueryOptions.INC = 1;
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "type", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "bytes", "optional"),
    __metadata("design:type", Uint8Array)
], TransactionQueryOptions.prototype, "signatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "senderId", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "recipientId", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], TransactionQueryOptions.prototype, "minHeight", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "blockId", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], TransactionQueryOptions.prototype, "maxHeight", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, core_model_transaction_1.TransactionBaseStorageModel, "optional"),
    __metadata("design:type", core_model_transaction_1.TransactionBaseStorageModel)
], TransactionQueryOptions.prototype, "storage", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "trusteeId", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "purchaseDAppid", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "dappid", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], TransactionQueryOptions.prototype, "lns", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "uint32"),
    __metadata("design:type", Number)
], TransactionQueryOptions.prototype, "offset", void 0);
__decorate([
    protobuf_1.Field.d(TransactionQueryOptions_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], TransactionQueryOptions.prototype, "limit", void 0);
TransactionQueryOptions = TransactionQueryOptions_1 = __decorate([
    protobuf_1.Type.d("TransactionQueryOptions")
], TransactionQueryOptions);
exports.TransactionQueryOptions = TransactionQueryOptions;
/**
 * 查询交易的排序条件
 */
let TransactionSortOptions = TransactionSortOptions_1 = class TransactionSortOptions extends protobuf_1.Message {
    toJSON() {
        return {
            index: this.index,
            height: this.height,
        };
    }
};
TransactionSortOptions.INC = 1;
__decorate([
    protobuf_1.Field.d(TransactionSortOptions_1.INC++, "int32", "optional"),
    __metadata("design:type", Number)
], TransactionSortOptions.prototype, "index", void 0);
__decorate([
    protobuf_1.Field.d(TransactionSortOptions_1.INC++, "int32", "optional"),
    __metadata("design:type", Number)
], TransactionSortOptions.prototype, "height", void 0);
TransactionSortOptions = TransactionSortOptions_1 = __decorate([
    protobuf_1.Type.d("TransactionSortOptions")
], TransactionSortOptions);
exports.TransactionSortOptions = TransactionSortOptions;
/**
 * 查询交易的传入参数
 */
let QueryTransactionArgModel = class QueryTransactionArgModel extends protobuf_1.Message {
    toJSON() {
        return {
            query: this.query,
            sort: this.sort,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, TransactionQueryOptions),
    __metadata("design:type", TransactionQueryOptions)
], QueryTransactionArgModel.prototype, "query", void 0);
__decorate([
    protobuf_1.Field.d(2, TransactionSortOptions),
    __metadata("design:type", TransactionSortOptions)
], QueryTransactionArgModel.prototype, "sort", void 0);
QueryTransactionArgModel = __decorate([
    protobuf_1.Type.d("QueryTransactionArg")
], QueryTransactionArgModel);
exports.QueryTransactionArgModel = QueryTransactionArgModel;
/**
 * 查询交易的返回值
 * 可能的错误：查询参数有误
 */
let QueryTransactionReturnModel = QueryTransactionReturnModel_1 = class QueryTransactionReturnModel extends common_chainChannel_model_1.CommonResponse {
    toJSON() {
        return Object.assign(super.toJSON(), {
            transactions: this.transactions.map(tib => tib.toJSON()),
        });
    }
};
__decorate([
    protobuf_1.Field.d(QueryTransactionReturnModel_1.INC++, core_model_transaction_1.TransactionInBlock, "repeated"),
    __metadata("design:type", Array)
], QueryTransactionReturnModel.prototype, "transactions", void 0);
QueryTransactionReturnModel = QueryTransactionReturnModel_1 = __decorate([
    protobuf_1.Type.d("QueryTransactionReturn")
], QueryTransactionReturnModel);
exports.QueryTransactionReturnModel = QueryTransactionReturnModel;
/**
 * 广播交易的传入参数
 */
let NewTransactionArgModel = NewTransactionArgModel_1 = class NewTransactionArgModel extends core_model_transaction_1.SomeTransactionModel {
    static fromObject(object) {
        return super.fromObject(object);
    }
};
__decorate([
    protobuf_1.Field.d(NewTransactionArgModel_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], NewTransactionArgModel.prototype, "grabSecret", void 0);
NewTransactionArgModel = NewTransactionArgModel_1 = __decorate([
    protobuf_1.Type.d("NewTransactionArg")
], NewTransactionArgModel);
exports.NewTransactionArgModel = NewTransactionArgModel;
/**
 * 广播交易的返回值
 * 可能的错误：交易验证不通过，或者手续费不足，或者已经超出可处理的时间段
 */
let NewTransactionReturnModel = NewTransactionReturnModel_1 = class NewTransactionReturnModel extends common_chainChannel_model_1.CommonResponse {
    toJSON() {
        return Object.assign(super.toJSON(), {
            newTrsStatus: this.newTrsStatus,
            minFee: this.minFee,
            refuseReason: this.refuseReason,
        });
    }
};
__decorate([
    protobuf_1.Field.d(NewTransactionReturnModel_1.INC++, constants_1.NewTransactionStatus, "required", constants_1.NewTransactionStatus.Refuse),
    __metadata("design:type", Number)
], NewTransactionReturnModel.prototype, "newTrsStatus", void 0);
__decorate([
    protobuf_1.Field.d(NewTransactionReturnModel_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], NewTransactionReturnModel.prototype, "minFee", void 0);
__decorate([
    protobuf_1.Field.d(NewTransactionReturnModel_1.INC++, constants_1.NewTransactionRefuseReason, "optional"),
    __metadata("design:type", Number)
], NewTransactionReturnModel.prototype, "refuseReason", void 0);
NewTransactionReturnModel = NewTransactionReturnModel_1 = __decorate([
    protobuf_1.Type.d("NewTransactionReturn")
], NewTransactionReturnModel);
exports.NewTransactionReturnModel = NewTransactionReturnModel;
//# sourceMappingURL=transaction.chainChannel.model.js.map