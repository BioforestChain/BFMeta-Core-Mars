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
var ServicePeerInfoModel_1, BlockchainStatusModel_1, PeerInfoModel_1, GetPeerInfoReturnModel_1;
Object.defineProperty(exports, "__esModule", { value: true });
const protobuf_1 = require("@bfchain/protobuf");
const common_chainChannel_model_1 = require("./common.chainChannel.model");
const core_model_progress_1 = require("@bfchain/core-model-progress");
const constants_1 = require("./constants");
/**缓存服务市场节点扫描信息解析结果 */
const BUFFER_LIST_SERVICEPEERINFO_LIST_WM = new WeakMap();
const SERVICEPEERINFO_BUFFER_WM = new WeakMap();
/**缓存服务市场信息解析结果 */
// const BUFFER_LIST_SERVICEINFO_LIST_WM = new WeakMap<Uint8Array[], ServiceInfoModel[]>();
// const SERVICEINFO_BUFFER_WM = new WeakMap<ServiceInfoModel, Uint8Array>();
let GetPeerInfoArgModel = class GetPeerInfoArgModel extends protobuf_1.Message {
    toJSON() {
        return {
            uid: this.uid,
        };
    }
};
__decorate([
    protobuf_1.Field.d(1, "uint32", "optional"),
    __metadata("design:type", Number)
], GetPeerInfoArgModel.prototype, "uid", void 0);
GetPeerInfoArgModel = __decorate([
    protobuf_1.Type.d("GetPeerInfoArg")
], GetPeerInfoArgModel);
exports.GetPeerInfoArgModel = GetPeerInfoArgModel;
let PeerConsensusModel = class PeerConsensusModel extends protobuf_1.Message {
    get peerTime() {
        return this.peerTimeLong.toNumber();
    }
    set peerTime(v) {
        this.peerTimeLong = protobuf_1.Long.fromNumber(v);
    }
    toJSON() {
        return {
            peerTime: this.peerTime,
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.peerTime && (res.peerTime = object.peerTime);
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(1, "uint64"),
    __metadata("design:type", Object)
], PeerConsensusModel.prototype, "peerTimeLong", void 0);
PeerConsensusModel = __decorate([
    protobuf_1.Type.d("PeerConsensus")
], PeerConsensusModel);
exports.PeerConsensusModel = PeerConsensusModel;
/**服务市场节点扫描信息 */
let ServicePeerInfoModel = ServicePeerInfoModel_1 = class ServicePeerInfoModel extends protobuf_1.Message {
    get servicePeerInfo() {
        return {
            peerInfoDelay: this.peerInfoDelay,
            onlineUser: this.onlineUser,
            productivity: this.productivity,
            paidSourceChainMagic: this.paidSourceChainMagic,
            paidsourceChainName: this.paidsourceChainName,
            paidAssetType: this.paidAssetType,
            paidAmount: this.paidAmount,
            paidType: this.paidType,
            serviceNotesName: this.serviceNotesName,
            noteIP: this.noteIP,
            delegateAddress: this.delegateAddress,
            developerVote: this.developerVote,
            systemDelegateVote: this.systemDelegateVote,
            dappOnChainBuy: this.dappOnChainBuy,
        };
    }
    set servicePeerInfo(data) {
        this.peerInfoDelay = data.peerInfoDelay;
        this.onlineUser = data.onlineUser;
        this.productivity = data.productivity;
        this.paidSourceChainMagic = data.paidSourceChainMagic;
        this.paidsourceChainName = data.paidsourceChainName;
        this.paidAssetType = data.paidAssetType;
        this.paidAmount = data.paidAmount;
        this.paidType = data.paidType;
        this.serviceNotesName = data.serviceNotesName;
        this.noteIP = data.noteIP;
        this.delegateAddress = data.delegateAddress;
        this.developerVote = data.developerVote;
        this.systemDelegateVote = data.systemDelegateVote;
        this.dappOnChainBuy = data.dappOnChainBuy;
    }
    toJSON() {
        return {
            peerInfoDelay: this.peerInfoDelay,
            onlineUser: this.onlineUser,
            productivity: this.productivity,
            paidSourceChainMagic: this.paidSourceChainMagic,
            paidsourceChainName: this.paidsourceChainName,
            paidAssetType: this.paidAssetType,
            paidAmount: this.paidAmount,
            paidType: this.paidType,
            serviceNotesName: this.serviceNotesName,
            noteIP: this.noteIP,
            delegateAddress: this.delegateAddress,
            developerVote: this.developerVote,
            systemDelegateVote: this.systemDelegateVote,
            dappOnChainBuy: this.dappOnChainBuy,
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            object.peerInfoDelay && (res.peerInfoDelay = object.peerInfoDelay);
            object.onlineUser && (res.onlineUser = object.onlineUser);
            object.productivity && (res.productivity = object.productivity);
            object.paidSourceChainMagic && (res.paidSourceChainMagic = object.paidSourceChainMagic);
            object.paidsourceChainName && (res.paidsourceChainName = object.paidsourceChainName);
            object.paidAmount && (res.paidAmount = object.paidAmount);
            object.paidType && (res.paidType = object.paidType);
            object.serviceNotesName && (res.serviceNotesName = object.serviceNotesName);
            object.noteIP && (res.noteIP = object.noteIP);
            object.delegateAddress && (res.delegateAddress = object.delegateAddress);
            object.developerVote && (res.developerVote = object.developerVote);
            object.systemDelegateVote && (res.systemDelegateVote = object.systemDelegateVote);
            object.dappOnChainBuy && (res.dappOnChainBuy = object.dappOnChainBuy);
        }
        return res;
    }
};
ServicePeerInfoModel.INC = 1;
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ServicePeerInfoModel.prototype, "peerInfoDelay", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ServicePeerInfoModel.prototype, "onlineUser", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], ServicePeerInfoModel.prototype, "productivity", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "paidSourceChainMagic", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "paidsourceChainName", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "paidAssetType", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "paidAmount", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "paidType", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "serviceNotesName", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "noteIP", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "string"),
    __metadata("design:type", String)
], ServicePeerInfoModel.prototype, "delegateAddress", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "bool"),
    __metadata("design:type", Boolean)
], ServicePeerInfoModel.prototype, "developerVote", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "bool"),
    __metadata("design:type", Boolean)
], ServicePeerInfoModel.prototype, "systemDelegateVote", void 0);
__decorate([
    protobuf_1.Field.d(ServicePeerInfoModel_1.INC++, "bool"),
    __metadata("design:type", Boolean)
], ServicePeerInfoModel.prototype, "dappOnChainBuy", void 0);
ServicePeerInfoModel = ServicePeerInfoModel_1 = __decorate([
    protobuf_1.Type.d("ServicePeerInfo")
], ServicePeerInfoModel);
exports.ServicePeerInfoModel = ServicePeerInfoModel;
/**服务市场信息 */
// @Type.d("ServiceInfo")
// export class ServiceInfoModel extends Message<ServiceInfoModel>
//   implements BFChainCore.JSONToModelType<BFChainCore.ServiceInfoJSON> {
//   static INC = 1;
//   @Field.d(ServiceInfoModel.INC++, "uint32")
//   peerInfoDelay!: number;
//   @Field.d(ServiceInfoModel.INC++, "uint32")
//   onlineUser!: number;
//   @Field.d(ServiceInfoModel.INC++, "uint32")
//   productivity!: number;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   paidSourceChainMagic!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   paidsourceChainName!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   paidAssetType!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   paidAmount!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   paidType!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   serviceNotesName!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   noteIP!: string;
//   @Field.d(ServiceInfoModel.INC++, "string")
//   delegateAddress!: string;
//   @Field.d(ServiceInfoModel.INC++, "bool")
//   developerVote!: boolean;
//   @Field.d(ServiceInfoModel.INC++, "bool")
//   systemDelegateVote!: boolean;
//   @Field.d(ServiceInfoModel.INC++, "bool")
//   dappOnChainBuy!: boolean;
//   get ServiceInfo() {
//     return {
//       peerInfoDelay: this.peerInfoDelay,
//       onlineUser: this.onlineUser,
//       productivity: this.productivity,
//       paidSourceChainMagic: this.paidSourceChainMagic,
//       paidsourceChainName: this.paidsourceChainName,
//       paidAssetType: this.paidAssetType,
//       paidAmount: this.paidAmount,
//       paidType: this.paidType,
//       serviceNotesName: this.serviceNotesName,
//       noteIP: this.noteIP,
//       delegateAddress: this.delegateAddress,
//       developerVote: this.developerVote,
//       systemDelegateVote: this.systemDelegateVote,
//       dappOnChainBuy: this.dappOnChainBuy,
//     };
//   }
//   set ServiceInfo(data: BFChainCore.ServiceInfoJSON) {
//     this.peerInfoDelay = data.peerInfoDelay;
//     this.onlineUser = data.onlineUser;
//     this.productivity = data.productivity;
//     this.paidSourceChainMagic = data.paidSourceChainMagic;
//     this.paidsourceChainName = data.paidsourceChainName;
//     this.paidAssetType = data.paidAssetType;
//     this.paidAmount = data.paidAmount;
//     this.paidType = data.paidType;
//     this.serviceNotesName = data.serviceNotesName;
//     this.noteIP = data.noteIP;
//     this.delegateAddress = data.delegateAddress;
//     this.developerVote = data.developerVote;
//     this.systemDelegateVote = data.systemDelegateVote;
//     this.dappOnChainBuy = data.dappOnChainBuy;
//   }
//   toJSON() {
//     return {
//       peerInfoDelay: this.peerInfoDelay,
//       onlineUser: this.onlineUser,
//       productivity: this.productivity,
//       paidSourceChainMagic: this.paidSourceChainMagic,
//       paidsourceChainName: this.paidsourceChainName,
//       paidAssetType: this.paidAssetType,
//       paidAmount: this.paidAmount,
//       paidType: this.paidType,
//       serviceNotesName: this.serviceNotesName,
//       noteIP: this.noteIP,
//       delegateAddress: this.delegateAddress,
//       developerVote: this.developerVote,
//       systemDelegateVote: this.systemDelegateVote,
//       dappOnChainBuy: this.dappOnChainBuy,
//     };
//   }
//   static fromObject<T extends Message>(
//     this: BFChainProtobuf.Constructor<T>,
//     object: BFChainProtobuf.ObjectFromType<ServiceInfoModel>,
//   ) {
//     const res = super.fromObject(object) as ServiceInfoModel;
//     if (res !== object) {
//       object.peerInfoDelay && (res.peerInfoDelay = object.peerInfoDelay);
//       object.onlineUser && (res.onlineUser = object.onlineUser);
//       object.productivity && (res.productivity = object.productivity);
//       object.paidSourceChainMagic && (res.paidSourceChainMagic = object.paidSourceChainMagic);
//       object.paidsourceChainName && (res.paidsourceChainName = object.paidsourceChainName);
//       object.paidAmount && (res.paidAmount = object.paidAmount);
//       object.paidType && (res.paidType = object.paidType);
//       object.serviceNotesName && (res.serviceNotesName = object.serviceNotesName);
//       object.noteIP && (res.noteIP = object.noteIP);
//       object.delegateAddress && (res.delegateAddress = object.delegateAddress);
//       object.developerVote && (res.developerVote = object.developerVote);
//       object.systemDelegateVote && (res.systemDelegateVote = object.systemDelegateVote);
//       object.dappOnChainBuy && (res.dappOnChainBuy = object.dappOnChainBuy);
//     }
//     return (res as unknown) as T;
//   }
// }
/**区块链状态以及当下任务进度模型 */
let BlockchainStatusModel = BlockchainStatusModel_1 = class BlockchainStatusModel extends protobuf_1.Message {
    get progress() {
        const { status } = this;
        if (status === constants_1.BLOCKCHAIN_STATUS.REBUIDING) {
            /// 重建
            return {
                status,
                progressEvent: this.rebuildingProgressEvent,
            };
        }
        else if (status === constants_1.BLOCKCHAIN_STATUS.PEER_SCANNING) {
            /// 节点扫描
            return {
                status,
                progressEvent: this.peerScanningProgressEvent,
            };
        }
        else if (status === constants_1.BLOCKCHAIN_STATUS.REPLAY_BLOCK) {
            /// 同步
            return {
                status,
                progressEvent: this.replayBlockProgressEvent,
            };
        }
        else if (status === constants_1.BLOCKCHAIN_STATUS.GENERATING) {
            /// 出块
            return {
                status,
                progressEvent: this.generatingProgressEvent,
            };
        }
        else if (status === constants_1.BLOCKCHAIN_STATUS.ROLLBACK) {
            /// 出块
            return {
                status,
                progressEvent: this.rollbackProgressEvent,
            };
        }
        return {
            status,
            progressEvent: undefined,
        };
    }
    get progressEvent() {
        return this._progressEvent;
    }
    set progressEvent(event) {
        if (event instanceof core_model_progress_1.BlockchainRebuidingProgressEventModel) {
            /// 重建
            this.rebuildingProgressEvent = event;
        }
        else if (event instanceof core_model_progress_1.BlockchainPeerScanningProgressEventModel) {
            /// 节点扫描
            this.peerScanningProgressEvent = event;
        }
        else if (event instanceof core_model_progress_1.BlockchainReplayBlockProgressEventModel) {
            /// 同步
            this.replayBlockProgressEvent = event;
        }
        else if (event instanceof core_model_progress_1.BlockchainGeneratingProgressEventModel) {
            /// 出块
            this.generatingProgressEvent = event;
        }
        else if (event instanceof core_model_progress_1.BlockchainRollbackProgressEventModel) {
            /// 回滚
            this.rollbackProgressEvent = event;
        }
    }
    get status() {
        return this._status;
    }
    set status(value) {
        if (value == this._status) {
            return;
        }
        this._status = value;
        this._clearProgressEvent();
        if (value === constants_1.BLOCKCHAIN_STATUS.REBUIDING) {
            /// 重建
            this.rebuildingProgressEvent = core_model_progress_1.BlockchainRebuidingProgressEventModel.fromObject({
                mode: core_model_progress_1.PROGRESS_EVENT_MODE.DETERMINATE,
            });
        }
        else if (value === constants_1.BLOCKCHAIN_STATUS.PEER_SCANNING) {
            /// 节点扫描
            this.peerScanningProgressEvent = core_model_progress_1.BlockchainPeerScanningProgressEventModel.fromObject({
                mode: core_model_progress_1.PROGRESS_EVENT_MODE.BUFFER,
            });
        }
        else if (value === constants_1.BLOCKCHAIN_STATUS.REPLAY_BLOCK) {
            /// 同步
            this.replayBlockProgressEvent = core_model_progress_1.BlockchainReplayBlockProgressEventModel.fromObject({
                mode: core_model_progress_1.PROGRESS_EVENT_MODE.BUFFER,
            });
        }
        else if (value === constants_1.BLOCKCHAIN_STATUS.GENERATING) {
            /// 出块
            this.generatingProgressEvent = core_model_progress_1.BlockchainGeneratingProgressEventModel.fromObject({
                mode: core_model_progress_1.PROGRESS_EVENT_MODE.QUERY,
            });
        }
        else if (value === constants_1.BLOCKCHAIN_STATUS.ROLLBACK) {
            /// 回滚
            this.rollbackProgressEvent = core_model_progress_1.BlockchainRollbackProgressEventModel.fromObject({
                mode: core_model_progress_1.PROGRESS_EVENT_MODE.BUFFER,
            });
        }
    }
    _clearProgressEvent() {
        this.rebuildingProgressEvent = undefined;
        this.peerScanningProgressEvent = undefined;
        this.replayBlockProgressEvent = undefined;
        this.generatingProgressEvent = undefined;
        this.rollbackProgressEvent = undefined;
    }
    toJSON() {
        return this.progress;
    }
};
BlockchainStatusModel.INC = 1;
__decorate([
    protobuf_1.Field.d(BlockchainStatusModel_1.INC++, core_model_progress_1.BlockchainRebuidingProgressEventModel, "optional"),
    __metadata("design:type", core_model_progress_1.BlockchainRebuidingProgressEventModel)
], BlockchainStatusModel.prototype, "rebuildingProgressEvent", void 0);
__decorate([
    protobuf_1.Field.d(BlockchainStatusModel_1.INC++, core_model_progress_1.BlockchainPeerScanningProgressEventModel, "optional"),
    __metadata("design:type", core_model_progress_1.BlockchainPeerScanningProgressEventModel)
], BlockchainStatusModel.prototype, "peerScanningProgressEvent", void 0);
__decorate([
    protobuf_1.Field.d(BlockchainStatusModel_1.INC++, core_model_progress_1.BlockchainReplayBlockProgressEventModel, "optional"),
    __metadata("design:type", core_model_progress_1.BlockchainReplayBlockProgressEventModel)
], BlockchainStatusModel.prototype, "replayBlockProgressEvent", void 0);
__decorate([
    protobuf_1.Field.d(BlockchainStatusModel_1.INC++, core_model_progress_1.BlockchainGeneratingProgressEventModel, "optional"),
    __metadata("design:type", core_model_progress_1.BlockchainGeneratingProgressEventModel)
], BlockchainStatusModel.prototype, "generatingProgressEvent", void 0);
__decorate([
    protobuf_1.Field.d(BlockchainStatusModel_1.INC++, core_model_progress_1.BlockchainRollbackProgressEventModel, "optional"),
    __metadata("design:type", core_model_progress_1.BlockchainRollbackProgressEventModel)
], BlockchainStatusModel.prototype, "rollbackProgressEvent", void 0);
__decorate([
    protobuf_1.Field.d(BlockchainStatusModel_1.INC++, constants_1.BLOCKCHAIN_STATUS),
    __metadata("design:type", Number)
], BlockchainStatusModel.prototype, "_status", void 0);
BlockchainStatusModel = BlockchainStatusModel_1 = __decorate([
    protobuf_1.Type.d("BlockchainStatus")
], BlockchainStatusModel);
exports.BlockchainStatusModel = BlockchainStatusModel;
let PeerInfoModel = PeerInfoModel_1 = class PeerInfoModel extends protobuf_1.Message {
    constructor() {
        super(...arguments);
        this._parsed_serviceInfo = false;
    }
    get serviceInfo() {
        if (!this._parsed_serviceInfo && typeof this.serviceInfoJSON === "string") {
            this._parsed_serviceInfo = true;
            this._serviceInfo = JSON.parse(this.serviceInfoJSON);
        }
        return this._serviceInfo;
    }
    set serviceInfo(serviceInfo) {
        this.serviceInfoJSON = (this._serviceInfo = serviceInfo)
            ? JSON.stringify(serviceInfo)
            : undefined;
        this._parsed_serviceInfo = true;
    }
    get servicePeerInfo() {
        const { servicePeerInfoBufferList } = this;
        let servicePeerInfoList = BUFFER_LIST_SERVICEPEERINFO_LIST_WM.get(servicePeerInfoBufferList);
        if (!servicePeerInfoList) {
            servicePeerInfoList = this.servicePeerInfoBufferList.map(buf => {
                const signature = ServicePeerInfoModel.decode(buf);
                SERVICEPEERINFO_BUFFER_WM.set(signature, buf);
                return signature;
            });
        }
        return servicePeerInfoList;
    }
    set servicePeerInfo(servicePeerInfoList) {
        const bufList = servicePeerInfoList.map(signature => {
            let buf = SERVICEPEERINFO_BUFFER_WM.get(signature);
            if (!buf) {
                buf = ServicePeerInfoModel.encode(signature).finish();
                SERVICEPEERINFO_BUFFER_WM.set(signature, buf);
            }
            return buf;
        });
        BUFFER_LIST_SERVICEPEERINFO_LIST_WM.set(bufList, servicePeerInfoList);
        this.servicePeerInfoBufferList = bufList;
    }
    toJSON() {
        return {
            uid: this.uid,
            height: this.height,
            blockchainStatus: this.blockchainStatus.toJSON(),
            serviceInfo: this.serviceInfo,
            // servicePeerInfo: this.servicePeerInfo.toJSON(),
            servicePeerInfo: this.servicePeerInfo.map(servicePeerInfomation => servicePeerInfomation.toJSON()),
            peerConsensus: this.peerConsensus.toJSON(),
            peerLinkCount: this.peerLinkCount,
        };
    }
    static fromObject(object) {
        const res = super.fromObject(object);
        if (res !== object) {
            const results = [];
            if (object.servicePeerInfo) {
                const servicePeerInfo = object.servicePeerInfo;
                for (const servicePeer of servicePeerInfo) {
                    results[results.length] = ServicePeerInfoModel.fromObject(servicePeer);
                }
            }
            res.servicePeerInfo = results;
        }
        return res;
    }
};
PeerInfoModel.INC = 1;
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], PeerInfoModel.prototype, "uid", void 0);
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], PeerInfoModel.prototype, "height", void 0);
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, BlockchainStatusModel),
    __metadata("design:type", BlockchainStatusModel)
], PeerInfoModel.prototype, "blockchainStatus", void 0);
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, "string", "optional"),
    __metadata("design:type", String)
], PeerInfoModel.prototype, "serviceInfoJSON", void 0);
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, "bytes", "repeated"),
    __metadata("design:type", Array)
], PeerInfoModel.prototype, "servicePeerInfoBufferList", void 0);
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, PeerConsensusModel),
    __metadata("design:type", PeerConsensusModel)
], PeerInfoModel.prototype, "peerConsensus", void 0);
__decorate([
    protobuf_1.Field.d(PeerInfoModel_1.INC++, "uint32"),
    __metadata("design:type", Number)
], PeerInfoModel.prototype, "peerLinkCount", void 0);
PeerInfoModel = PeerInfoModel_1 = __decorate([
    protobuf_1.Type.d("PeerInfo")
], PeerInfoModel);
exports.PeerInfoModel = PeerInfoModel;
let GetPeerInfoReturnModel = GetPeerInfoReturnModel_1 = class GetPeerInfoReturnModel extends common_chainChannel_model_1.CommonResponse {
    toJSON() {
        const res = super.toJSON();
        if (this.peerInfo) {
            res.peerInfo = this.peerInfo.toJSON();
        }
        return res;
    }
};
__decorate([
    protobuf_1.Field.d(GetPeerInfoReturnModel_1.INC++, PeerInfoModel, "optional"),
    __metadata("design:type", PeerInfoModel)
], GetPeerInfoReturnModel.prototype, "peerInfo", void 0);
GetPeerInfoReturnModel = GetPeerInfoReturnModel_1 = __decorate([
    protobuf_1.Type.d("GetPeerInfoReturn")
], GetPeerInfoReturnModel);
exports.GetPeerInfoReturnModel = GetPeerInfoReturnModel;
//# sourceMappingURL=peer.chainChannel.model.js.map