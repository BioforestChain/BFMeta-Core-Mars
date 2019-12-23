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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
// import '@bfchain/util';
typeof Promise.resolve().then(() => __importStar(require("@bfchain/util")));
/**
 * 比例模型
 */
let RateModel = class RateModel extends protobuf_1.Message {
    toJSON() {
        return {
            prevWeight: this.prevWeight,
            nextWeight: this.nextWeight,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "string"),
    __metadata("design:type", String)
], RateModel.prototype, "prevWeight", void 0);
__decorate([
    protobuf_1.Field.d(2, "string"),
    __metadata("design:type", String)
], RateModel.prototype, "nextWeight", void 0);
RateModel = __decorate([
    protobuf_1.Type.d("RateModel")
], RateModel);
exports.RateModel = RateModel;
//# sourceMappingURL=rate.model.js.map