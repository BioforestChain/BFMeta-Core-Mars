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
var Block_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const util_encoding_hex_1 = require("@bfchain/util-encoding-hex");
// type TransactionInBlock = import("./transactionModel").TransactionInBlock;
const core_model_transaction_1 = require("@bfchain/core-model-transaction");
const statistic_info_1 = require("./statistic_info");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
// <T, C = _GetMessageModel<_GetBlockRemarkModel<T>>> = {
//   [K in keyof C]: _GetMessageModel<C[K]>;
// };
/**缓存trasList解析结果 */
const BUFFER_LIST_TRANSACTION_LIST_WM = new WeakMap();
const TRANSACTION_BUFFER_WM = new WeakMap();
let Block = Block_1 = 
// BFChainUtil.JSONAble<BFChainCore.BlockJSON<BFChainUtil.ToJSONType<RemarkModel>>>
class Block extends protobuf_1.Message {
    /**
     * 2. 区块ID
     * 同理`height`，`id`放在第二位
     */
    get id() {
        return this.blockSignature;
    }
    get blockSignature() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.blockSignatureBuffer);
    }
    set blockSignature(value) {
        this.blockSignatureBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get generatorPublicKey() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.generatorPublicKeyBuffer);
    }
    set generatorPublicKey(value) {
        this.generatorPublicKeyBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    get payloadHash() {
        return util_encoding_hex_1.getHexFromArrayBuffer(this.payloadHashBuffer);
    }
    set payloadHash(value) {
        this.payloadHashBuffer = util_encoding_hex_1.parseHexToArrayBuffer(value);
    }
    /**区块总资产数量 */
    get totalAmount() {
        return this.statisticInfo.totalAsset || "0";
    }
    /**区块总手续费 */
    get totalFee() {
        return this.statisticInfo.totalFee || "0";
    }
    get transactions() {
        const { transactionBufferList } = this;
        let trsList = BUFFER_LIST_TRANSACTION_LIST_WM.get(transactionBufferList);
        if (!trsList) {
            trsList = this.transactionBufferList.map(buf => {
                const trs = core_model_transaction_1.TransactionInBlock.decode(buf);
                TRANSACTION_BUFFER_WM.set(trs, buf);
                return trs;
            });
        }
        return trsList;
    }
    set transactions(trsList) {
        const bufList = trsList.map(trs => {
            let buf = TRANSACTION_BUFFER_WM.get(trs);
            if (!buf) {
                buf = core_model_transaction_1.TransactionInBlock.encode(trs).finish();
                TRANSACTION_BUFFER_WM.set(trs, buf);
            }
            return buf;
        });
        BUFFER_LIST_TRANSACTION_LIST_WM.set(bufList, trsList);
        this.transactionBufferList = bufList;
    }
    getBytes(skipSignature, skipTransactions) {
        const props = {};
        if (skipSignature) {
            props.blockSignatureBuffer = { value: null };
        }
        if (skipTransactions) {
            props.transactionBufferList = { value: [] };
        }
        const blockWrapper = Object.create(this, props);
        return this.$type.encode(blockWrapper).finish();
    }
    toJSON() {
        return {
            version: this.version,
            id: this.id,
            height: this.height,
            blockSize: this.blockSize,
            timestamp: this.timestamp,
            blockSignature: this.blockSignature,
            generatorPublicKey: this.generatorPublicKey,
            numberOfTransactions: this.numberOfTransactions,
            payloadHash: this.payloadHash,
            payloadLength: this.payloadLength,
            previousBlock: this.previousBlock,
            totalAmount: this.totalAmount,
            totalFee: this.totalFee,
            reward: this.reward,
            magic: this.magic,
            transactions: this.transactions.map(transaction => transaction.toJSON()),
            remark: this.remark.toJSON(),
            statisticInfo: this.statisticInfo.toJSON(),
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        object.generatorPublicKey && (res.generatorPublicKey = object.generatorPublicKey);
        if (res !== object) {
            object.payloadHash && (res.payloadHash = object.payloadHash);
            const trsInBlock = [];
            if (object.transactions) {
                const transactions = object.transactions;
                for (const transaction of transactions) {
                    trsInBlock[trsInBlock.length] = core_model_transaction_1.TransactionInBlock.fromObject(transaction);
                }
            }
            res.transactions = trsInBlock;
            object.blockSignature && (res.blockSignature = object.blockSignature);
        }
        return res;
    }
};
/// 往后开始自由组合
Block.INC = 9;
__decorate([
    protobuf_1.Field.d(1, "uint32"),
    __metadata("design:type", Number)
], Block.prototype, "version", void 0);
__decorate([
    protobuf_1.Field.d(2, "uint32"),
    __metadata("design:type", Number)
], Block.prototype, "height", void 0);
__decorate([
    protobuf_1.Field.d(3, "bytes"),
    __metadata("design:type", Uint8Array)
], Block.prototype, "blockSignatureBuffer", void 0);
__decorate([
    protobuf_1.Field.d(4, "uint32"),
    __metadata("design:type", Number)
], Block.prototype, "timestamp", void 0);
__decorate([
    protobuf_1.Field.d(5, "bytes"),
    __metadata("design:type", Uint8Array)
], Block.prototype, "generatorPublicKeyBuffer", void 0);
__decorate([
    protobuf_1.Field.d(6, "string"),
    __metadata("design:type", String)
], Block.prototype, "previousBlock", void 0);
__decorate([
    protobuf_1.Field.d(7, "uint32"),
    __metadata("design:type", Number)
], Block.prototype, "numberOfTransactions", void 0);
__decorate([
    protobuf_1.Field.d(8, "string"),
    __metadata("design:type", String)
], Block.prototype, "magic", void 0);
__decorate([
    protobuf_1.Field.d(Block_1.INC++, "uint32"),
    __metadata("design:type", Number)
], Block.prototype, "blockSize", void 0);
__decorate([
    protobuf_1.Field.d(Block_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], Block.prototype, "payloadHashBuffer", void 0);
__decorate([
    protobuf_1.Field.d(Block_1.INC++, "uint32"),
    __metadata("design:type", Number)
], Block.prototype, "payloadLength", void 0);
__decorate([
    protobuf_1.Field.d(Block_1.INC++, statistic_info_1.StatisticInfoModel),
    __metadata("design:type", statistic_info_1.StatisticInfoModel)
], Block.prototype, "statisticInfo", void 0);
__decorate([
    protobuf_1.Field.d(Block_1.INC++, "string", "required", "0"),
    __metadata("design:type", String)
], Block.prototype, "reward", void 0);
__decorate([
    protobuf_1.Field.d(Block_1.INC++, "bytes", "repeated"),
    __metadata("design:type", Array)
], Block.prototype, "transactionBufferList", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean, Boolean]),
    __metadata("design:returntype", void 0)
], Block.prototype, "getBytes", null);
Block = Block_1 = __decorate([
    protobuf_1.Type.d("Block")
    // BFChainUtil.JSONAble<BFChainCore.BlockJSON<BFChainUtil.ToJSONType<RemarkModel>>>
], Block);
exports.Block = Block;
// type BlockObjectFromType<T> = T extends Block<infer U> ?BFChainProtobuf.ObjectFromType<Block<U>>:BFChainProtobuf.ObjectFromType<T>
//# sourceMappingURL=block.js.map