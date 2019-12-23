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
var ProgressEventModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
var PROGRESS_EVENT_MODE;
(function (PROGRESS_EVENT_MODE) {
    /**不定的 */
    PROGRESS_EVENT_MODE[PROGRESS_EVENT_MODE["INDETERMINATE"] = 0] = "INDETERMINATE";
    /**确定的 */
    PROGRESS_EVENT_MODE[PROGRESS_EVENT_MODE["DETERMINATE"] = 1] = "DETERMINATE";
    /**对于想要指示来自其它节点的活动或者等待的操作,使用缓冲区指示符
     * 一般用到3个进度的时候就需要使用 buffer 模式
     * 比如直播的视频流, 最外层的是时间轴(total),中间层是已经下载的(buffer),内层是增加播放的进度(loaded)
     * 比如"重放区块":下载区块并验证.
     * 外层像是直播的时间轴, 因为区块是一直在增加的
     * 中间层就是已经同步过来的区块
     * 内层就是校验的进度
     */
    PROGRESS_EVENT_MODE[PROGRESS_EVENT_MODE["BUFFER"] = 2] = "BUFFER";
    /**对于想要指示预加载的情况(直到可以实际加载),使用查询指示符
     * 比如同步区块,要先下载区块头,区块头里头才会有总交易数
     */
    PROGRESS_EVENT_MODE[PROGRESS_EVENT_MODE["QUERY"] = 3] = "QUERY";
})(PROGRESS_EVENT_MODE = exports.PROGRESS_EVENT_MODE || (exports.PROGRESS_EVENT_MODE = {}));
/**通用的进度事件进度模型 */
let ProgressEventModel = ProgressEventModel_1 = class ProgressEventModel extends protobuf_1.Message {
    toJSON() {
        return {
            type: this.type,
            mode: this.mode,
            loaded: this.loaded,
            buffer: this.buffer,
            total: this.total,
        };
    }
};
ProgressEventModel.INC = 1;
__decorate([
    protobuf_1.Field.d(ProgressEventModel_1.INC++, "string"),
    __metadata("design:type", String)
], ProgressEventModel.prototype, "type", void 0);
__decorate([
    protobuf_1.Field.d(ProgressEventModel_1.INC++, PROGRESS_EVENT_MODE),
    __metadata("design:type", Number)
], ProgressEventModel.prototype, "mode", void 0);
__decorate([
    protobuf_1.Field.d(ProgressEventModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ProgressEventModel.prototype, "loaded", void 0);
__decorate([
    protobuf_1.Field.d(ProgressEventModel_1.INC++, "uint32", "optional"),
    __metadata("design:type", Number)
], ProgressEventModel.prototype, "buffer", void 0);
__decorate([
    protobuf_1.Field.d(ProgressEventModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ProgressEventModel.prototype, "total", void 0);
ProgressEventModel = ProgressEventModel_1 = __decorate([
    protobuf_1.Type.d("ProgressEvent")
], ProgressEventModel);
exports.ProgressEventModel = ProgressEventModel;
//# sourceMappingURL=progressEvent.model.js.map