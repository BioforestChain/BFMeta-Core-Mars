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
var GenesisBlockRemarkModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const core_model_common_1 = require("@bfchain/core-model-common");
const core_model_cacher_1 = require("@bfchain/core-model-cacher");
const roundDelegateRemark_1 = require("./roundDelegateRemark");
/**
 * RewardPercent 模型
 *
 */
let RewardPercentModel = class RewardPercentModel extends protobuf_1.Message {
    toJSON() {
        return {
            votePercent: this.votePercent.toJSON(),
            forgePercent: this.forgePercent.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], RewardPercentModel.prototype, "votePercent", void 0);
__decorate([
    protobuf_1.Field.d(2, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], RewardPercentModel.prototype, "forgePercent", void 0);
RewardPercentModel = __decorate([
    protobuf_1.Type.d("RewardPercentModel")
], RewardPercentModel);
exports.RewardPercentModel = RewardPercentModel;
/**
 * Rewards 模型
 *
 */
let RewardPerBlock = class RewardPerBlock extends protobuf_1.Message {
    toJSON() {
        return {
            heights: this.heights.slice(),
            rewards: this.rewards.slice(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "uint32", "repeated"),
    __metadata("design:type", Array)
], RewardPerBlock.prototype, "heights", void 0);
__decorate([
    protobuf_1.Field.d(2, "string", "repeated"),
    __metadata("design:type", Array)
], RewardPerBlock.prototype, "rewards", void 0);
RewardPerBlock = __decorate([
    protobuf_1.Type.d("RewardPerBlock")
], RewardPerBlock);
exports.RewardPerBlock = RewardPerBlock;
/**
 * ports 模型
 *
 */
let PortsModel = class PortsModel extends protobuf_1.Message {
    toJSON() {
        return {
            port: this.port,
            scan_peer_port: this.scan_peer_port,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "uint32"),
    __metadata("design:type", Number)
], PortsModel.prototype, "port", void 0);
__decorate([
    protobuf_1.Field.d(2, "uint32"),
    __metadata("design:type", Number)
], PortsModel.prototype, "scan_peer_port", void 0);
PortsModel = __decorate([
    protobuf_1.Type.d("PortsModel")
], PortsModel);
exports.PortsModel = PortsModel;
let TransactionPowOfWorkConfigModel = class TransactionPowOfWorkConfigModel extends protobuf_1.Message {
    toJSON() {
        return {
            growthFactor: this.growthFactor.toJSON(),
            participationRatio: this.participationRatio.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, core_model_common_1.FractionBigIntModel),
    __metadata("design:type", core_model_common_1.FractionBigIntModel)
], TransactionPowOfWorkConfigModel.prototype, "growthFactor", void 0);
__decorate([
    protobuf_1.Field.d(2, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], TransactionPowOfWorkConfigModel.prototype, "participationRatio", void 0);
TransactionPowOfWorkConfigModel = __decorate([
    protobuf_1.Type.d("TransactionPowOfWorkConfigModel")
], TransactionPowOfWorkConfigModel);
exports.TransactionPowOfWorkConfigModel = TransactionPowOfWorkConfigModel;
/**
 * GenesisBlockRemark 模型
 *
 */
let GenesisBlockRemarkModel = GenesisBlockRemarkModel_1 = class GenesisBlockRemarkModel extends roundDelegateRemark_1.RoundDelegateRemarkModel {
    get beginEpochTime() {
        return this.beginEpochTimeLong.toNumber();
    }
    set beginEpochTime(v) {
        this.beginEpochTimeLong = protobuf_1.Long.fromNumber(v);
    }
    toJSON() {
        const res = Object.assign(super.toJSON(), {
            assetType: this.assetType,
            chainName: this.chainName,
            magic: this.magic,
            bnid: this.bnid,
            beginEpochTime: this.beginEpochTime,
            genesisNodeAddress: this.genesisNodeAddress,
            generateTotalAmount: this.generateTotalAmount,
            minTransactionFeePerByte: this.minTransactionFeePerByte,
            maxPayloadLength: this.maxPayloadLength,
            maxTPSPerBlock: this.maxTPSPerBlock,
            maxTransactionSize: this.maxTransactionSize,
            maxBlockRemarkSize: this.maxBlockRemarkSize,
            consessusBeforeSyncBlockDiff: this.consessusBeforeSyncBlockDiff,
            maxDelegateTxsPerRound: this.maxDelegateTxsPerRound,
            issueAssetMinChainAsset: this.issueAssetMinChainAsset,
            issueSubchainMinChainAsset: this.issueSubchainMinChainAsset,
            chainAssetAndDigitalAssetExchangeRate: this.chainAssetAndDigitalAssetExchangeRate,
            chainAssetAndSubchainAssetExchangeRate: this.chainAssetAndSubchainAssetExchangeRate,
            chainAssetRewardWeight: this.chainAssetRewardWeight,
            numberOfTransactionRewardWeight: this.numberOfTransactionRewardWeight,
            maxApplyAndConfirmedBlockHeightDiff: this.maxApplyAndConfirmedBlockHeightDiff,
            blockPerRound: this.blockPerRound,
            delegates: this.delegates,
            forgeInterval: this.forgeInterval,
            rewardPercent: this.rewardPercent.toJSON(),
            ports: this.ports.toJSON(),
            rewardPerBlock: this.rewardPerBlock.toJSON(),
            debug: this.debug,
            info: this.info,
            blockParticipation: this.blockParticipation,
            participationTotalChainAsset: this.participationTotalChainAsset,
            participationNumberOfTransaction: this.participationNumberOfTransaction,
            participationNumberOfAccount: this.participationNumberOfAccount,
            participationTotalFee: this.participationTotalFee,
            transactionPowOfWorkConfig: this.transactionPowOfWorkConfig.toJSON(),
            powOfWorkExemptionBlocks: this.powOfWorkExemptionBlocks,
        });
        this.parentGenesisBlock && (res.parentGenesisBlock = this.parentGenesisBlock);
        return res;
    }
    getBytes() {
        return this.$type.encode(this).finish();
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.beginEpochTime && (res.beginEpochTime = object.beginEpochTime);
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "chainName", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "magic", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "bnid", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint64"),
    __metadata("design:type", Object)
], GenesisBlockRemarkModel.prototype, "beginEpochTimeLong", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "genesisNodeAddress", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "generateTotalAmount", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], GenesisBlockRemarkModel.prototype, "minTransactionFeePerByte", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "maxPayloadLength", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "maxTPSPerBlock", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "maxTransactionSize", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "maxBlockRemarkSize", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "consessusBeforeSyncBlockDiff", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "maxDelegateTxsPerRound", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "issueAssetMinChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "issueSubchainMinChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "chainAssetAndDigitalAssetExchangeRate", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "chainAssetAndSubchainAssetExchangeRate", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "chainAssetRewardWeight", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "numberOfTransactionRewardWeight", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "maxApplyAndConfirmedBlockHeightDiff", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "blockPerRound", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "delegates", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32", "required"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "forgeInterval", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, RewardPercentModel, "required"),
    __metadata("design:type", RewardPercentModel)
], GenesisBlockRemarkModel.prototype, "rewardPercent", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, PortsModel, "required"),
    __metadata("design:type", PortsModel)
], GenesisBlockRemarkModel.prototype, "ports", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, RewardPerBlock, "required"),
    __metadata("design:type", RewardPerBlock)
], GenesisBlockRemarkModel.prototype, "rewardPerBlock", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "GenesisBlock"),
    __metadata("design:type", Object)
], GenesisBlockRemarkModel.prototype, "parentGenesisBlock", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "debug", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "info", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "string"),
    __metadata("design:type", String)
], GenesisBlockRemarkModel.prototype, "blockParticipation", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "participationTotalChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "participationNumberOfTransaction", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "participationNumberOfAccount", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "participationTotalFee", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, TransactionPowOfWorkConfigModel),
    __metadata("design:type", TransactionPowOfWorkConfigModel)
], GenesisBlockRemarkModel.prototype, "transactionPowOfWorkConfig", void 0);
__decorate([
    protobuf_1.Field.d(GenesisBlockRemarkModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], GenesisBlockRemarkModel.prototype, "powOfWorkExemptionBlocks", void 0);
__decorate([
    core_model_cacher_1.cacheBytesGetter,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenesisBlockRemarkModel.prototype, "getBytes", null);
GenesisBlockRemarkModel = GenesisBlockRemarkModel_1 = __decorate([
    protobuf_1.Type.d("GenesisBlockRemarkModel")
], GenesisBlockRemarkModel);
exports.GenesisBlockRemarkModel = GenesisBlockRemarkModel;
//# sourceMappingURL=genesisBlockRemark.js.map