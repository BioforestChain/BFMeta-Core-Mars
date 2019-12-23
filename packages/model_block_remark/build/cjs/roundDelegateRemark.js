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
var NextRoundDelegateModel_1, RoundDelegateRemarkModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
let NextRoundDelegateModel = NextRoundDelegateModel_1 = class NextRoundDelegateModel extends protobuf_1.Message {
    toJSON() {
        return {
            address: this.address,
            equity: this.equity,
        };
    }
};
NextRoundDelegateModel.INC = 1;
__decorate([
    protobuf_1.Field.d(NextRoundDelegateModel_1.INC++, "string"),
    __metadata("design:type", String)
], NextRoundDelegateModel.prototype, "address", void 0);
__decorate([
    protobuf_1.Field.d(NextRoundDelegateModel_1.INC++, "string"),
    __metadata("design:type", String)
], NextRoundDelegateModel.prototype, "equity", void 0);
NextRoundDelegateModel = NextRoundDelegateModel_1 = __decorate([
    protobuf_1.Type.d("NextRoundDelegateModel")
], NextRoundDelegateModel);
exports.NextRoundDelegateModel = NextRoundDelegateModel;
let RoundDelegateRemarkModel = RoundDelegateRemarkModel_1 = class RoundDelegateRemarkModel extends protobuf_1.Message {
    get nextRoundDelegateAddressList() {
        if (!this._next_round_delegate_address_list) {
            this._next_round_delegate_address_list = [];
            for (const equ of this.nextRoundDelegates) {
                this._next_round_delegate_address_list.push(equ.address);
            }
        }
        return this._next_round_delegate_address_list;
    }
    get nextRoundDelegateEquitieMap() {
        if (!this._equitie_map) {
            this._equitie_map = new Map();
            for (const equ of this.nextRoundDelegates) {
                this._equitie_map.set(equ.address, equ.equity);
            }
        }
        return this._equitie_map;
    }
    get rate() {
        if (!this._rate) {
            this._rate = (BigInt(this.maxBeginBalance) / BigInt(this.maxTxCount || 1)).toString();
        }
        return this._rate;
    }
    toJSON() {
        return {
            newDelegates: this.newDelegates,
            maxBeginBalance: this.maxBeginBalance,
            maxTxCount: this.maxTxCount,
            nextRoundDelegates: this.nextRoundDelegates.map(rd => rd.toJSON()),
            rate: this.rate,
        };
    }
};
RoundDelegateRemarkModel.INC = 1;
__decorate([
    protobuf_1.Field.d(RoundDelegateRemarkModel_1.INC++, "string", "repeated"),
    __metadata("design:type", Array)
], RoundDelegateRemarkModel.prototype, "newDelegates", void 0);
__decorate([
    protobuf_1.Field.d(RoundDelegateRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], RoundDelegateRemarkModel.prototype, "maxBeginBalance", void 0);
__decorate([
    protobuf_1.Field.d(RoundDelegateRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], RoundDelegateRemarkModel.prototype, "maxTxCount", void 0);
__decorate([
    protobuf_1.Field.d(RoundDelegateRemarkModel_1.INC++, NextRoundDelegateModel, "repeated"),
    __metadata("design:type", Array)
], RoundDelegateRemarkModel.prototype, "nextRoundDelegates", void 0);
RoundDelegateRemarkModel = RoundDelegateRemarkModel_1 = __decorate([
    protobuf_1.Type.d("RoundDelegateRemarkModel")
], RoundDelegateRemarkModel);
exports.RoundDelegateRemarkModel = RoundDelegateRemarkModel;
//# sourceMappingURL=roundDelegateRemark.js.map