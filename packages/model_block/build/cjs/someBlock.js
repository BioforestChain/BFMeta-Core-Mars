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
var SomeBlockModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const atom_block_1 = require("./atom_block");
const protobuf_1 = require("@bfchain/protobuf");
const core_helper_exception_1 = require("@bfchain/util-helper-exception");
const { ArgumentFormatException } = core_helper_exception_1.CoreExceptionGenerator("MODEL", "blockModel");
/**
 * 区块类型
 *
 */
var BLOCK_TYPES_BASE;
(function (BLOCK_TYPES_BASE) {
    /**创世块 */
    BLOCK_TYPES_BASE[BLOCK_TYPES_BASE["GENESIS"] = 0] = "GENESIS";
    /**普通区块 */
    BLOCK_TYPES_BASE[BLOCK_TYPES_BASE["COMMON"] = 1] = "COMMON";
    /**每轮最后一个块 */
    BLOCK_TYPES_BASE[BLOCK_TYPES_BASE["ROUNDEND"] = 2] = "ROUNDEND";
})(BLOCK_TYPES_BASE = exports.BLOCK_TYPES_BASE || (exports.BLOCK_TYPES_BASE = {}));
/**
 * K : BLOCK TYPEBASE VALUE
 * M : BlockModelConstructror
 * F : BlockFactoryConstructror
 */
exports.BLOCK_TYPES_MAP = (() => {
    const KM = new Map();
    const MK = new Map();
    [
        [BLOCK_TYPES_BASE.GENESIS, atom_block_1.GenesisBlock],
        [BLOCK_TYPES_BASE.COMMON, atom_block_1.CommonBlock],
        [BLOCK_TYPES_BASE.ROUNDEND, atom_block_1.RoundLastBlock],
    ].forEach(([K, M]) => {
        KM.set(K, M);
        MK.set(M, K);
    });
    return {
        KM,
        MK,
    };
})();
const BLOCK_BYTE_WM = new WeakMap();
let SomeBlockModel = SomeBlockModel_1 = class SomeBlockModel extends protobuf_1.Message {
    get block() {
        let block = BLOCK_BYTE_WM.get(this._block_bytes);
        if (!block) {
            const Model = exports.BLOCK_TYPES_MAP.KM.get(this._block_type);
            if (!Model) {
                throw new ArgumentFormatException(core_helper_exception_1.INVALID_BLOCK_TYPE, {
                    type: this._block_type,
                });
            }
            block = Model.decode(this._block_bytes);
            BLOCK_BYTE_WM.set(this._block_bytes, block);
        }
        return block;
    }
    set block(block) {
        const ctor = block.constructor;
        const block_type = exports.BLOCK_TYPES_MAP.MK.get(ctor);
        if (block_type === undefined) {
            throw new ArgumentFormatException(core_helper_exception_1.INVALID_BLOCK_CONSTRUCTOR, { name: ctor.name });
        }
        this._block_type = block_type;
        this._block_bytes = new Uint8Array(ctor.encode(block).finish());
        BLOCK_BYTE_WM.set(this._block_bytes, block);
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (object !== res) {
            const obj_block = object.block;
            if (obj_block) {
                if (!(obj_block instanceof protobuf_1.Message)) {
                    let type = BLOCK_TYPES_BASE.COMMON;
                    if (obj_block.height === 0) {
                        type = BLOCK_TYPES_BASE.GENESIS;
                    }
                    else if (obj_block.remark && "hash" in obj_block.remark) {
                        type = BLOCK_TYPES_BASE.ROUNDEND;
                    }
                    const ModelCtor = exports.BLOCK_TYPES_MAP.KM.get(type);
                    if (ModelCtor) {
                        res.block = ModelCtor.fromObject(obj_block);
                    }
                }
                else {
                    res.block = obj_block;
                }
            }
        }
        return res;
    }
    toJSON() {
        return {
            block: this.block,
        };
    }
};
SomeBlockModel.INC = 1;
__decorate([
    protobuf_1.Field.d(SomeBlockModel_1.INC++, BLOCK_TYPES_BASE),
    __metadata("design:type", Number)
], SomeBlockModel.prototype, "_block_type", void 0);
__decorate([
    protobuf_1.Field.d(SomeBlockModel_1.INC++, "bytes"),
    __metadata("design:type", Uint8Array)
], SomeBlockModel.prototype, "_block_bytes", void 0);
SomeBlockModel = SomeBlockModel_1 = __decorate([
    protobuf_1.Type.d("SomeBlockModel")
], SomeBlockModel);
exports.SomeBlockModel = SomeBlockModel;
//# sourceMappingURL=someBlock.js.map