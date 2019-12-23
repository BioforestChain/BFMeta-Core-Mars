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
var QueryBlockReturnModel_1, NewBlockArgModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const common_chainChannel_model_1 = require("./common.chainChannel.model");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
const core_model_block_1 = require("@bfchain/core-model-block");
/**
 * 查询区块的查询条件
 */
let BlockQueryOptionsModel = class BlockQueryOptionsModel extends protobuf_1.Message {
    toJSON() {
        return Object.assign(super.toJSON(), {
            id: this.id,
            height: this.height,
        });
    }
};
__decorate([
    protobuf_1.Field.d(1, "string", "optional"),
    __metadata("design:type", String)
], BlockQueryOptionsModel.prototype, "id", void 0);
__decorate([
    protobuf_1.Field.d(2, "uint32", "optional"),
    __metadata("design:type", Number)
], BlockQueryOptionsModel.prototype, "height", void 0);
BlockQueryOptionsModel = __decorate([
    protobuf_1.Type.d("BlockQueryOptions")
], BlockQueryOptionsModel);
exports.BlockQueryOptionsModel = BlockQueryOptionsModel;
/**
 * 查询区块的传入参数
 */
let QueryBlockArgModel = class QueryBlockArgModel extends protobuf_1.Message {
    toJSON() {
        return { query: this.query.toJSON() };
    }
};
__decorate([
    protobuf_1.Field.d(1, BlockQueryOptionsModel),
    __metadata("design:type", BlockQueryOptionsModel)
], QueryBlockArgModel.prototype, "query", void 0);
QueryBlockArgModel = __decorate([
    protobuf_1.Type.d("QueryBlockArg")
], QueryBlockArgModel);
exports.QueryBlockArgModel = QueryBlockArgModel;
/**
 * 查询区块的返回结果
 */
let QueryBlockReturnModel = QueryBlockReturnModel_1 = class QueryBlockReturnModel extends common_chainChannel_model_1.CommonResponse {
    toJSON() {
        const res = super.toJSON();
        if (this.someBlock) {
            res.someBlock = this.someBlock.toJSON();
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(QueryBlockReturnModel_1.INC++, core_model_block_1.SomeBlockModel, "optional"),
    __metadata("design:type", core_model_block_1.SomeBlockModel)
], QueryBlockReturnModel.prototype, "someBlock", void 0);
QueryBlockReturnModel = QueryBlockReturnModel_1 = __decorate([
    protobuf_1.Type.d("QueryBlockReturn")
], QueryBlockReturnModel);
exports.QueryBlockReturnModel = QueryBlockReturnModel;
/**
 * 广播区块的传入参数
 */
let NewBlockArgModel = NewBlockArgModel_1 = class NewBlockArgModel extends protobuf_1.Message {
    get generatorPublicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.generatorPublicKeyBuffer);
    }
    set generatorPublicKey(value) {
        this.generatorPublicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    toJSON() {
        return {
            height: this.height,
            blockId: this.blockId,
            previousBlockId: this.previousBlockId,
            timestamp: this.timestamp,
            totalFee: this.totalFee,
            numberOfTransactions: this.numberOfTransactions,
            generatorPublicKey: this.generatorPublicKey,
            blockParticipation: this.blockParticipation,
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.generatorPublicKey && (res.generatorPublicKey = object.generatorPublicKey);
        }
        return res;
    }
};
NewBlockArgModel.INC = 1;
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], NewBlockArgModel.prototype, "height", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "string"),
    __metadata("design:type", String)
], NewBlockArgModel.prototype, "blockId", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "string"),
    __metadata("design:type", String)
], NewBlockArgModel.prototype, "previousBlockId", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], NewBlockArgModel.prototype, "timestamp", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "string"),
    __metadata("design:type", String)
], NewBlockArgModel.prototype, "totalFee", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], NewBlockArgModel.prototype, "numberOfTransactions", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], NewBlockArgModel.prototype, "generatorPublicKeyBuffer", void 0);
__decorate([
    protobuf_1.Field.d(NewBlockArgModel_1.INC++, "string"),
    __metadata("design:type", String)
], NewBlockArgModel.prototype, "blockParticipation", void 0);
NewBlockArgModel = NewBlockArgModel_1 = __decorate([
    protobuf_1.Type.d("NewBlockArg")
], NewBlockArgModel);
exports.NewBlockArgModel = NewBlockArgModel;
/**
 * 广播区块的返回结果
 */
let NewBlockReturn = class NewBlockReturn extends common_chainChannel_model_1.CommonResponse {
};
NewBlockReturn = __decorate([
    protobuf_1.Type.d("NewBlockReturn")
], NewBlockReturn);
exports.NewBlockReturn = NewBlockReturn;
//# sourceMappingURL=block.chainChannel.model.js.map