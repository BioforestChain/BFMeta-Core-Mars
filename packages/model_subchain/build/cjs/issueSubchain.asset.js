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
const protobuf_1 = require("@bfchain/protobuf");
const core_model_block_remark_1 = require("@bfchain/core-model-block-remark");
const core_model_block_1 = require("@bfchain/core-model-block");
const core_model_common_1 = require("@bfchain/core-model-common");
let subchain_field_index_acc = 1;
/**
 * issueSubchain 交易 asset 模型
 *
 */
let IssueSubchainModel = class IssueSubchainModel extends protobuf_1.Message {
    get beginEpochTime() {
        return this.beginEpochTimeLong.toNumber();
    }
    set beginEpochTime(v) {
        this.beginEpochTimeLong = protobuf_1.Long.fromNumber(v);
    }
    toJSON() {
        return {
            chainName: this.chainName,
            assetType: this.assetType,
            magic: this.magic,
            bnid: this.bnid,
            beginEpochTime: this.beginEpochTime,
            genesisNodeAddress: this.genesisNodeAddress,
            generateTotalAmount: this.generateTotalAmount,
            minTransactionFeePerByte: this.minTransactionFeePerByte.toJSON(),
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
            powOfWorkExemptionBlocks: this.powOfWorkExemptionBlocks,
            blockPerRound: this.blockPerRound,
            delegates: this.delegates,
            forgeInterval: this.forgeInterval,
            rewardPercent: this.rewardPercent.toJSON(),
            ports: this.ports.toJSON(),
            rewardPerBlock: this.rewardPerBlock.toJSON(),
            participationTotalChainAsset: this.participationTotalChainAsset,
            participationNumberOfTransaction: this.participationNumberOfTransaction,
            participationNumberOfAccount: this.participationNumberOfAccount,
            participationTotalFee: this.participationTotalFee,
            transactionPowOfWorkConfig: this.transactionPowOfWorkConfig.toJSON(),
            genesisBlock: this.genesisBlock.toJSON(),
        };
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
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "chainName", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "assetType", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "magic", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "bnid", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint64"),
    __metadata("design:type", Object)
], IssueSubchainModel.prototype, "beginEpochTimeLong", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "genesisNodeAddress", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "generateTotalAmount", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, core_model_common_1.Fraction),
    __metadata("design:type", core_model_common_1.Fraction)
], IssueSubchainModel.prototype, "minTransactionFeePerByte", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "maxPayloadLength", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "maxTPSPerBlock", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "maxTransactionSize", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "maxBlockRemarkSize", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "consessusBeforeSyncBlockDiff", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "maxDelegateTxsPerRound", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "issueAssetMinChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "string"),
    __metadata("design:type", String)
], IssueSubchainModel.prototype, "issueSubchainMinChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "chainAssetAndDigitalAssetExchangeRate", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "chainAssetAndSubchainAssetExchangeRate", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "chainAssetRewardWeight", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "numberOfTransactionRewardWeight", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "maxApplyAndConfirmedBlockHeightDiff", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "powOfWorkExemptionBlocks", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "blockPerRound", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "delegates", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "forgeInterval", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, core_model_block_remark_1.RewardPercentModel),
    __metadata("design:type", core_model_block_remark_1.RewardPercentModel)
], IssueSubchainModel.prototype, "rewardPercent", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, core_model_block_remark_1.PortsModel),
    __metadata("design:type", core_model_block_remark_1.PortsModel)
], IssueSubchainModel.prototype, "ports", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, core_model_block_remark_1.RewardPerBlock),
    __metadata("design:type", core_model_block_remark_1.RewardPerBlock)
], IssueSubchainModel.prototype, "rewardPerBlock", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "participationTotalChainAsset", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "participationNumberOfTransaction", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "participationNumberOfAccount", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, "uint32"),
    __metadata("design:type", Number)
], IssueSubchainModel.prototype, "participationTotalFee", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, core_model_block_remark_1.TransactionPowOfWorkConfigModel),
    __metadata("design:type", core_model_block_remark_1.TransactionPowOfWorkConfigModel)
], IssueSubchainModel.prototype, "transactionPowOfWorkConfig", void 0);
__decorate([
    protobuf_1.Field.d(subchain_field_index_acc++, core_model_block_1.GenesisBlock),
    __metadata("design:type", core_model_block_1.GenesisBlock)
], IssueSubchainModel.prototype, "genesisBlock", void 0);
IssueSubchainModel = __decorate([
    protobuf_1.Type.d("IssueSubchainModel")
], IssueSubchainModel);
exports.IssueSubchainModel = IssueSubchainModel;
/**
 * issueSubchain 交易 asset 外层模型
 *
 */
let IssueSubchainAssetModel = class IssueSubchainAssetModel extends protobuf_1.Message {
    toJSON() {
        return {
            issueSubchain: this.issueSubchain.toJSON(),
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, IssueSubchainModel),
    __metadata("design:type", IssueSubchainModel)
], IssueSubchainAssetModel.prototype, "issueSubchain", void 0);
IssueSubchainAssetModel = __decorate([
    protobuf_1.Type.d("IssueSubchainAssetModel")
], IssueSubchainAssetModel);
exports.IssueSubchainAssetModel = IssueSubchainAssetModel;
//# sourceMappingURL=issueSubchain.asset.js.map