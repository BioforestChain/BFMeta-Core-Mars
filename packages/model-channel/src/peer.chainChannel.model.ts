import { Message, Type, Field, MapField, Long } from "@bfchain/protobuf";
import { CommonResponse, ErrorMessage } from "./common.chainChannel.model";
import {
  BlockchainRebuildingProgressEventModel,
  BlockchainPeerScanningProgressEventModel,
  BlockchainReplayBlockProgressEventModel,
  BlockchainGeneratingProgressEventModel,
  SomeBlockchainStatusProgressEvent,
  BlockchainRollbackProgressEventModel,
  PROGRESS_EVENT_MODE,
} from "@bfchain/core-model-progress";
import { StringKeyMap } from "@bfchain/core-model-common";
import { BLOCKCHAIN_STATUS } from "./constants";

/**缓存服务市场节点扫描信息解析结果 */
const BUFFER_LIST_SERVICEPEERINFO_LIST_WM = new WeakMap<Uint8Array[], ServicePeerInfoModel[]>();
const SERVICEPEERINFO_BUFFER_WM = new WeakMap<ServicePeerInfoModel, Uint8Array>();
/**缓存服务市场信息解析结果 */
// const BUFFER_LIST_SERVICEINFO_LIST_WM = new WeakMap<Uint8Array[], ServiceInfoModel[]>();
// const SERVICEINFO_BUFFER_WM = new WeakMap<ServiceInfoModel, Uint8Array>();

@Type.d("GetPeerInfoArg")
export class GetPeerInfoArgModel
  extends Message<GetPeerInfoArgModel>
  implements BFChainCore.JSONToModelType<BFChainCore.GetPeerInfoArgJSON>
{
  /**申请分配的UID */
  @Field.d(1, "uint32", "optional")
  uid?: number;
  toJSON() {
    return {
      uid: this.uid,
    };
  }
}

@Type.d("PeerConsensus")
export class PeerConsensusModel
  extends Message<PeerConsensusModel>
  implements BFChainCore.JSONToModelType<BFChainCore.PeerConsensusJSON>
{
  /**节点的时间 */
  @Field.d(1, "uint64")
  peerTimeLong!: Long;
  get peerTime() {
    return this.peerTimeLong.toNumber();
  }
  set peerTime(v) {
    this.peerTimeLong = Long.fromNumber(v, true);
  }
  toJSON() {
    return {
      peerTime: this.peerTime,
    };
  }
  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<PeerConsensusModel>,
  ) {
    const res = super.fromObject(object) as PeerConsensusModel;
    if (res !== object) {
      object.peerTime !== undefined && (res.peerTime = object.peerTime);
    }
    return res as unknown as T;
  }
}

/**服务市场节点扫描信息 */
@Type.d("ServicePeerInfo")
export class ServicePeerInfoModel
  extends Message<ServicePeerInfoModel>
  implements BFChainCore.JSONToModelType<BFChainCore.ServicePeerInfoJSON>
{
  static INC = 1;
  @Field.d(ServicePeerInfoModel.INC++, "uint32")
  peerInfoDelay!: number;
  @Field.d(ServicePeerInfoModel.INC++, "uint32")
  onlineUser!: number;
  @Field.d(ServicePeerInfoModel.INC++, "uint32")
  productivity!: number;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  paidSourceChainMagic!: string;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  paidsourceChainName!: string;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  paidAssetType!: string;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  paidAmount!: string;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  paidType!: string;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  serviceNotesName!: string;
  @Field.d(ServicePeerInfoModel.INC++, "string")
  noteIP!: string;
  @Field.d(ServicePeerInfoModel.INC++, "bool")
  dappOnChainBuy!: boolean;

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
      dappOnChainBuy: this.dappOnChainBuy,
    };
  }

  set servicePeerInfo(data: BFChainCore.ServicePeerInfoJSON) {
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
      dappOnChainBuy: this.dappOnChainBuy,
    };
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<ServicePeerInfoModel>,
  ) {
    const res = super.fromObject(object) as ServicePeerInfoModel;
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
      object.dappOnChainBuy && (res.dappOnChainBuy = object.dappOnChainBuy);
    }
    return res as unknown as T;
  }
}

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
//       object.dappOnChainBuy && (res.dappOnChainBuy = object.dappOnChainBuy);
//     }
//     return (res as unknown) as T;
//   }
// }

/**区块链状态以及当下任务进度模型 */
@Type.d("BlockchainStatus")
export class BlockchainStatusModel<S extends BLOCKCHAIN_STATUS = any>
  extends Message<BlockchainStatusModel<S>>
  implements BFChainCore.JSONToModelType<BFChainCore.BlockchainStatusJSON<S>>
{
  static INC = 1;
  @Field.d(BlockchainStatusModel.INC++, BlockchainRebuildingProgressEventModel, "optional")
  rebuildingProgressEvent?: BlockchainRebuildingProgressEventModel;
  @Field.d(BlockchainStatusModel.INC++, BlockchainPeerScanningProgressEventModel, "optional")
  peerScanningProgressEvent?: BlockchainPeerScanningProgressEventModel;
  @Field.d(BlockchainStatusModel.INC++, BlockchainReplayBlockProgressEventModel, "optional")
  replayBlockProgressEvent?: BlockchainReplayBlockProgressEventModel;
  @Field.d(BlockchainStatusModel.INC++, BlockchainGeneratingProgressEventModel, "optional")
  generatingProgressEvent?: BlockchainGeneratingProgressEventModel;
  @Field.d(BlockchainStatusModel.INC++, BlockchainRollbackProgressEventModel, "optional")
  rollbackProgressEvent?: BlockchainRollbackProgressEventModel;

  get progress(): BFChainCore.BlockchainStatusJSON<S> {
    const { status } = this;
    if (status === BLOCKCHAIN_STATUS.REBUIDING) {
      /// 重建
      return {
        status,
        progressEvent: this.rebuildingProgressEvent as any,
      };
    } else if (status === BLOCKCHAIN_STATUS.PEER_SCANNING) {
      /// 节点扫描
      return {
        status,
        progressEvent: this.peerScanningProgressEvent as any,
      };
    } else if (status === BLOCKCHAIN_STATUS.REPLAY_BLOCK) {
      /// 同步
      return {
        status,
        progressEvent: this.replayBlockProgressEvent as any,
      };
    } else if (status === BLOCKCHAIN_STATUS.GENERATING) {
      /// 出块
      return {
        status,
        progressEvent: this.generatingProgressEvent as any,
      };
    } else if (status === BLOCKCHAIN_STATUS.ROLLBACK) {
      /// 出块
      return {
        status,
        progressEvent: this.rollbackProgressEvent as any,
      };
    }
    return {
      status,
      progressEvent: undefined,
    };
  }

  private _progressEvent?: BFChainCore.BlockchainStatus.StatusProgressEventMap<S>;
  public get progressEvent() {
    return this._progressEvent;
  }
  public set progressEvent(event) {
    if (!event) {
      return;
    }
    if (event instanceof BlockchainRebuildingProgressEventModel) {
      /// 重建
      this.rebuildingProgressEvent = event as any;
    } else if (event instanceof BlockchainPeerScanningProgressEventModel) {
      /// 节点扫描
      this.peerScanningProgressEvent = event as any;
    } else if (event instanceof BlockchainReplayBlockProgressEventModel) {
      /// 同步
      this.replayBlockProgressEvent = event as any;
    } else if (event instanceof BlockchainGeneratingProgressEventModel) {
      /// 出块
      this.generatingProgressEvent = event as any;
    } else if (event instanceof BlockchainRollbackProgressEventModel) {
      /// 回滚
      this.rollbackProgressEvent = event as any;
    }
  }
  @Field.d(BlockchainStatusModel.INC++, BLOCKCHAIN_STATUS)
  private _status!: S;
  public get status(): S {
    return this._status;
  }
  public set status(value: S) {
    if (value === this._status) {
      return;
    }
    this._status = value;
    this._clearProgressEvent();
    if (value === BLOCKCHAIN_STATUS.REBUIDING) {
      /// 重建
      this.rebuildingProgressEvent = BlockchainRebuildingProgressEventModel.fromObject({
        mode: PROGRESS_EVENT_MODE.DETERMINATE,
      });
    } else if (value === BLOCKCHAIN_STATUS.PEER_SCANNING) {
      /// 节点扫描
      this.peerScanningProgressEvent = BlockchainPeerScanningProgressEventModel.fromObject({
        mode: PROGRESS_EVENT_MODE.BUFFER,
      });
    } else if (value === BLOCKCHAIN_STATUS.REPLAY_BLOCK) {
      /// 同步
      this.replayBlockProgressEvent = BlockchainReplayBlockProgressEventModel.fromObject({
        mode: PROGRESS_EVENT_MODE.BUFFER,
      });
    } else if (value === BLOCKCHAIN_STATUS.GENERATING) {
      /// 出块
      this.generatingProgressEvent = BlockchainGeneratingProgressEventModel.fromObject({
        mode: PROGRESS_EVENT_MODE.QUERY, // 一开始要计算total(交易数与变更的账户数)
      });
    } else if (value === BLOCKCHAIN_STATUS.ROLLBACK) {
      /// 回滚
      this.rollbackProgressEvent = BlockchainRollbackProgressEventModel.fromObject({
        mode: PROGRESS_EVENT_MODE.BUFFER, // 一开始要计算total(交易数与变更的账户数)
      });
    }
  }
  private _clearProgressEvent() {
    this.rebuildingProgressEvent = undefined;
    this.peerScanningProgressEvent = undefined;
    this.replayBlockProgressEvent = undefined;
    this.generatingProgressEvent = undefined;
    this.rollbackProgressEvent = undefined;
  }
  toJSON() {
    return this.progress;
  }
}

@Type.d("PeerInfo")
export class PeerInfoModel
  extends Message<PeerInfoModel>
  implements BFChainCore.JSONToModelType<BFChainCore.PeerInfoJSON>
{
  static INC = 1;
  @Field.d(PeerInfoModel.INC++, "uint32")
  uid!: number;
  /**区块高度 */
  @Field.d(PeerInfoModel.INC++, "uint32")
  height!: number;
  /**区块状态 */
  @Field.d(PeerInfoModel.INC++, BlockchainStatusModel)
  blockchainStatus!: BlockchainStatusModel;
  @Field.d(PeerInfoModel.INC++, "string", "optional")
  serviceInfoJSON?: string;
  private _parsed_serviceInfo = false;
  private _serviceInfo?: BFChainCore.ServiceInfoJSON[];
  get serviceInfo() {
    if (!this._parsed_serviceInfo && typeof this.serviceInfoJSON === "string") {
      this._parsed_serviceInfo = true;
      this._serviceInfo = JSON.parse(this.serviceInfoJSON);
    }
    return this._serviceInfo;
  }
  set serviceInfo(serviceInfo: BFChainCore.ServiceInfoJSON[] | undefined) {
    this.serviceInfoJSON = (this._serviceInfo = serviceInfo)
      ? JSON.stringify(serviceInfo)
      : undefined;
    this._parsed_serviceInfo = true;
  }
  /**服务市场信息 */
  // @Field.d(PeerInfoModel.INC++, "bytes", "repeated")
  // serviceInfoBufferList!: Uint8Array[];
  // // public get serviceInfo() {
  // //   const { serviceInfoBufferList } = this;
  // //   let serviceInfoList = BUFFER_LIST_SERVICEINFO_LIST_WM.get(serviceInfoBufferList);
  // //   if (!serviceInfoList) {
  // //     serviceInfoList = this.serviceInfoBufferList.map(buf => {
  // //       const signature = serviceInfoModel.decode(buf);
  // //       SERVICEINFO_BUFFER_WM.set(signature, buf);
  // //       return signature;
  // //     });
  // //   }
  // //   return serviceInfoList;
  // // }
  // // public set serviceInfo(serviceInfoList: serviceInfoModel[]) {
  // //   const bufList = serviceInfoList.map(signature => {
  // //     let buf = SERVICEINFO_BUFFER_WM.get(signature);
  // //     if (!buf) {
  // //       buf = serviceInfoModel.encode(signature).finish();
  // //       SERVICEINFO_BUFFER_WM.set(signature, buf);
  // //     }
  // //     return buf;
  // //   });
  // //   BUFFER_LIST_SERVICEINFO_LIST_WM.set(bufList, serviceInfoList);
  // //   this.serviceInfoBufferList = bufList;
  // // }

  /**服务市场节点扫描信息 */
  @Field.d(PeerInfoModel.INC++, "bytes", "repeated")
  servicePeerInfoBufferList!: Uint8Array[];
  public get servicePeerInfo() {
    const { servicePeerInfoBufferList } = this;
    let servicePeerInfoList = BUFFER_LIST_SERVICEPEERINFO_LIST_WM.get(servicePeerInfoBufferList);
    if (!servicePeerInfoList) {
      servicePeerInfoList = this.servicePeerInfoBufferList.map((buf) => {
        const signature = ServicePeerInfoModel.decode(buf);
        SERVICEPEERINFO_BUFFER_WM.set(signature, buf);
        return signature;
      });
    }
    return servicePeerInfoList;
  }
  public set servicePeerInfo(servicePeerInfoList: ServicePeerInfoModel[]) {
    const bufList = servicePeerInfoList.map((signature) => {
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

  /**节点共识信息 */
  @Field.d(PeerInfoModel.INC++, PeerConsensusModel)
  peerConsensus!: PeerConsensusModel;
  /**节点连接的数量 */
  @Field.d(PeerInfoModel.INC++, "uint32")
  peerLinkCount!: number;

  toJSON(): BFChainCore.PeerInfoJSON {
    return {
      uid: this.uid,
      height: this.height,
      blockchainStatus: this.blockchainStatus.toJSON(),
      serviceInfo: this.serviceInfo,
      // servicePeerInfo: this.servicePeerInfo.toJSON(),
      servicePeerInfo: this.servicePeerInfo.map((servicePeerInfomation) =>
        servicePeerInfomation.toJSON(),
      ),
      peerConsensus: this.peerConsensus.toJSON(),
      peerLinkCount: this.peerLinkCount,
    };
  }

  static fromObject<T extends Message>(
    this: BFChainProtobuf.Constructor<T>,
    object: BFChainProtobuf.ObjectFromType<PeerInfoModel>,
  ) {
    const res = super.fromObject(object) as PeerInfoModel;
    if (res !== object) {
      const results: ServicePeerInfoModel[] = [];
      if (object.servicePeerInfo) {
        const servicePeerInfo = object.servicePeerInfo;
        for (const servicePeer of servicePeerInfo) {
          results[results.length] = ServicePeerInfoModel.fromObject(servicePeer);
        }
      }
      res.servicePeerInfo = results;
    }
    return res as unknown as T;
  }
}

@Type.d("GetPeerInfoReturn")
export class GetPeerInfoReturnModel
  extends CommonResponse
  implements BFChainCore.JSONToModelType<BFChainCore.GetPeerInfoReturnJSON>
{
  @Field.d(GetPeerInfoReturnModel.INC++, PeerInfoModel, "optional")
  peerInfo?: PeerInfoModel;
  toJSON() {
    const res: BFChainCore.GetPeerInfoReturnJSON = super.toJSON();
    if (this.peerInfo) {
      res.peerInfo = this.peerInfo.toJSON();
    }
    return res;
  }
}
