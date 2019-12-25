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
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@bfchain/util");
const core_util_exception_1 = require("@bfchain/core-util-exception");
const core_model_1 = require("@bfchain/core-model");
const core_helper_1 = require("@bfchain/core-helper");
const { ArgumentIllegalException, ArgumentFormatException } = core_util_exception_1.CoreExceptionGenerator("helper", "ChainChannelHelper");
let ChainChannelHelper = class ChainChannelHelper {
    constructor(baseHelper, accountHelper, transctionHelper, blockHelper) {
        this.baseHelper = baseHelper;
        this.accountHelper = accountHelper;
        this.transctionHelper = transctionHelper;
        this.blockHelper = blockHelper;
    }
    /**
     * 生成并校验交易查询的传入参数
     */
    boxQueryTransactionArg(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryTransactionArg",
                params,
            });
        }
        let arg;
        try {
            arg = core_model_1.QueryTransactionArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryTransactionArg",
                error,
                params,
            });
        }
        const BH = this.baseHelper;
        /// 参数校验
        //#region 查询参数校验
        const { type, signatureBuffer, senderId, recipientId, blockId, minHeight, maxHeight, storage, offset, limit, } = arg.query;
        let has_query_params = false;
        if (type) {
            //if (typeof type === "string") {
            has_query_params = true;
            if (!BH.isValidTransactionType(type)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg",
                    field: "type",
                });
            }
        }
        if (signatureBuffer) {
            //if (typeof signature === "string") {
            has_query_params = true;
            if (!BH.isValidSignature(signatureBuffer)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "signatureBuffer",
                });
            }
        }
        if (senderId) {
            //if (typeof senderId === "string") {
            has_query_params = true;
            if (!this.accountHelper.isAddress(senderId)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "senderId",
                });
            }
        }
        if (recipientId) {
            //if (typeof recipientId === "string") {
            has_query_params = true;
            if (!this.accountHelper.isAddress(recipientId)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "recipientId",
                });
            }
        }
        if (minHeight) {
            //if (typeof minHeight === "number") {
            has_query_params = true;
            if (!BH.isUint32(minHeight)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "minHeight",
                });
            }
        }
        if (maxHeight) {
            //if (typeof maxHeight === "number") {
            has_query_params = true;
            if (!BH.isUint32(maxHeight)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "maxHeight",
                });
            }
        }
        if (blockId) {
            //if (typeof maxHeight === "number") {
            has_query_params = true;
            if (!BH.isValidBlockId(blockId)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "blockId",
                });
            }
        }
        if (storage) {
            has_query_params = true;
            if (!(storage.key && storage.key.length)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "storage",
                });
            }
        }
        if (has_query_params === false) {
            throw new ArgumentIllegalException("Invalid QueryTransaction query params, no query conditions");
        }
        if (!BH.isUint32(offset)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxQueryTransactionArg.query",
                field: "offset",
            });
        }
        if (limit) {
            //if (typeof limit === "number") {
            if (!BH.isUint32(limit)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.query",
                    field: "limit",
                });
            }
        }
        //#endregion
        //#region 排序参数校验
        const { index: timestamp } = arg.sort;
        if (timestamp) {
            //if (typeof timestamp === "number") {
            if (!BH.isUint32(timestamp)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryTransactionArg.sort",
                    field: "timestamp",
                });
            }
        }
        //#endregion
        return arg;
    }
    /**
     * 生成并校验交易查询的返回结果
     */
    boxQueryTransactionReturn(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryTransactionReturn",
                params,
            });
        }
        let arg;
        try {
            arg = core_model_1.QueryTransactionReturnModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryTransactionReturn",
                error,
                params,
            });
        }
        /// 参数校验
        //#region 交易签名校验
        if (arg.status === core_model_1.RESPONSE_STATUS.success) {
            const { transactions } = arg;
            transactions.forEach(item => {
                this.transctionHelper.verifyTransactionSignature(item.transaction, {
                    taskLabel: "QueryTransactionReturn",
                });
            });
        }
        //#endregion
        return arg;
    }
    /**
     * 生成并校验交易广播的传入参数
     */
    boxNewTransactionArg(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxNewTransactionArg",
                params,
            });
        }
        let arg;
        try {
            arg = core_model_1.NewTransactionArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            if (error instanceof util_1.Exception) {
                throw error;
            }
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxNewTransactionArg",
                error,
                params,
            });
        }
        /// 参数校验
        //#region 交易签名校验
        const { transaction } = arg;
        this.transctionHelper.verifyTransactionSignature(transaction, {
            taskLabel: "NewTransactionArg",
        });
        //#endregion
        return arg;
    }
    /**
     * 生成并校验交易广播的返回结果
     */
    boxNewTransactionReturn(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxNewTransactionReturn",
                params,
            });
        }
        let arg;
        try {
            arg = core_model_1.NewTransactionReturnModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxNewTransactionReturn",
                error,
                params,
            });
        }
        /// 参数校验
        //#region 交易签名校验
        if (arg.status === core_model_1.RESPONSE_STATUS.success) {
            if (Number.isNaN(parseFloat(arg.minFee)) || BigInt(arg.minFee) < BigInt(0)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxNewTransactionReturn",
                    field: "minFee",
                });
            }
        }
        //#endregion
        return arg;
    }
    /**
     * 生成并校验区块查询的传入参数
     */
    boxQueryBlockArg(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, { function: "boxQueryBlockArg", params });
        }
        let arg;
        try {
            arg = core_model_1.QueryBlockArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryBlockArg",
                error,
                params,
            });
        }
        const BH = this.baseHelper;
        /// 参数校验
        //#region 查询参数校验
        const { height, id } = arg.query;
        /**是否有查询条件 */
        let has_query_params = false;
        // if (typeof height === "number") {
        if (height) {
            has_query_params = true;
            if (!BH.isUint32(height)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryBlockArg",
                    field: "height",
                });
            }
        }
        // if (typeof id === "string") {
        if (id) {
            has_query_params = true;
            if (!BH.isValidBlockId(id)) {
                throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                    function: "boxQueryBlockArg",
                    field: "id",
                });
            }
        }
        if (has_query_params === false) {
            throw new ArgumentIllegalException("Invalid QueryBlockArg query params, no query conditions");
        }
        //#endregion
        return arg;
    }
    /**
     * 生成并校验区块查询的返回结果
     */
    boxQueryBlockReturn(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryBlockReturn",
                params,
            });
        }
        let arg;
        try {
            arg = core_model_1.QueryBlockReturnModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxQueryBlockReturn",
                error,
                params,
            });
        }
        // FIXME: @wmc
        /// 参数校验
        //#region 交易签名校验
        const { someBlock } = arg;
        if (arg.status === core_model_1.RESPONSE_STATUS.success && someBlock) {
            this.blockHelper.verifyBlockSignature(someBlock.block, {
                taskLabel: "QueryBlockReturn",
            });
        }
        // #endregion
        return arg;
    }
    /**
     * 生成并校验区块查询的传入参数
     */
    boxNewBlockArg(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, { function: "boxNewBlockArg", params });
        }
        let newBlockArg;
        try {
            newBlockArg = core_model_1.NewBlockArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxNewBlockArg",
                error,
                params,
            });
        }
        const BH = this.baseHelper;
        /// 参数校验
        //#region 查询参数校验
        if (!BH.isUint32(newBlockArg.height)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "height",
            });
        }
        if (!BH.isValidBlockId(newBlockArg.blockId)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "blockId",
            });
        }
        if (!BH.isValidBlockId(newBlockArg.previousBlockId)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "previousBlockId",
            });
        }
        if (!BH.isFiniteBigInt(newBlockArg.totalFee)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "totalFee",
            });
        }
        if (!BH.isUint32(newBlockArg.numberOfTransactions)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "numberOfTransactions",
            });
        }
        if (!BH.isUint32(newBlockArg.timestamp)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "timestamp",
            });
        }
        if (!BH.isValidPublicKey(newBlockArg.generatorPublicKeyBuffer)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS_FIELD, {
                function: "boxNewBlockArg",
                field: "generatorPublicKey",
            });
        }
        //#endregion
        return newBlockArg;
    }
    /**
     * 生成并校验区块查询的返回结果
     */
    boxNewBlockReturn(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, { function: "boxNewBlockReturn", params });
        }
        try {
            const arg = core_model_1.NewBlockReturn.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
            return arg;
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxNewBlockReturn",
                error,
                params,
            });
        }
    }
    /**
     * 生成并校验获取节点信息的传入参数
     */
    boxGetPeerInfoArg(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, { function: "boxGetPeerInfoArg", params });
        }
        try {
            const arg = core_model_1.GetPeerInfoArgModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
            return arg;
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxGetPeerInfoArg",
                error,
                params,
            });
        }
    }
    /**
     * 生成并校验获取节点信息的返回结果
     */
    boxGetPeerInfoReturn(params) {
        if (!(params instanceof ArrayBuffer || params instanceof Uint8Array)) {
            throw new ArgumentIllegalException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxGetPeerInfoReturn",
                params,
            });
        }
        try {
            const arg = core_model_1.GetPeerInfoReturnModel.decode(params instanceof Uint8Array ? params : new Uint8Array(params));
            return arg;
        }
        catch (error) {
            throw new ArgumentFormatException(core_util_exception_1.INVALID_PARAMS, {
                function: "boxGetPeerInfoReturn",
                error,
                params,
            });
        }
    }
};
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", core_model_1.QueryTransactionArgModel)
], ChainChannelHelper.prototype, "boxQueryTransactionArg", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChainChannelHelper.prototype, "boxQueryTransactionReturn", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChainChannelHelper.prototype, "boxNewTransactionArg", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChainChannelHelper.prototype, "boxNewTransactionReturn", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", core_model_1.QueryBlockArgModel)
], ChainChannelHelper.prototype, "boxQueryBlockArg", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChainChannelHelper.prototype, "boxQueryBlockReturn", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", core_model_1.NewBlockArgModel)
], ChainChannelHelper.prototype, "boxNewBlockArg", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", core_model_1.NewBlockReturn)
], ChainChannelHelper.prototype, "boxNewBlockReturn", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", core_model_1.GetPeerInfoArgModel)
], ChainChannelHelper.prototype, "boxGetPeerInfoArg", null);
__decorate([
    util_1.bindThis,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", core_model_1.GetPeerInfoReturnModel)
], ChainChannelHelper.prototype, "boxGetPeerInfoReturn", null);
ChainChannelHelper = __decorate([
    util_1.Injectable(),
    __metadata("design:paramtypes", [core_helper_1.BaseHelper,
        core_helper_1.AccountBaseHelper,
        core_helper_1.TransactionHelper,
        core_helper_1.BlockHelper])
], ChainChannelHelper);
exports.ChainChannelHelper = ChainChannelHelper;
//# sourceMappingURL=chainChannelHelper.js.map