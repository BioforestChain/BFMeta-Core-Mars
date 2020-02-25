/// <reference types="long" />
import { Message } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { BlockchainRebuidingProgressEventModel as BlockchainRebuildingProgressEventModel, BlockchainPeerScanningProgressEventModel, BlockchainReplayBlockProgressEventModel, BlockchainGeneratingProgressEventModel, BlockchainRollbackProgressEventModel } from "@bfchain/core-model-progress";
import { BLOCKCHAIN_STATUS } from "./constants";
export declare class GetPeerInfoArgModel extends Message<GetPeerInfoArgModel> implements BFChainCore.JSONToModelType<BFChainCore.GetPeerInfoArgJSON> {
    uid?: number;
    toJSON(): {
        uid: number | undefined;
    };
}
export declare class PeerConsensusModel extends Message<PeerConsensusModel> implements BFChainCore.JSONToModelType<BFChainCore.PeerConsensusJSON> {
    peerTimeLong: Long;
    get peerTime(): number;
    set peerTime(v: number);
    toJSON(): {
        peerTime: number;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<PeerConsensusModel>): T;
}
export declare class ServicePeerInfoModel extends Message<ServicePeerInfoModel> implements BFChainCore.JSONToModelType<BFChainCore.ServicePeerInfoJSON> {
    static INC: number;
    peerInfoDelay: number;
    onlineUser: number;
    productivity: number;
    paidSourceChainMagic: string;
    paidsourceChainName: string;
    paidAssetType: string;
    paidAmount: string;
    paidType: string;
    serviceNotesName: string;
    noteIP: string;
    delegateAddress: string;
    developerVote: boolean;
    systemDelegateVote: boolean;
    dappOnChainBuy: boolean;
    get servicePeerInfo(): BFChainCore.ServicePeerInfoJSON;
    set servicePeerInfo(data: BFChainCore.ServicePeerInfoJSON);
    toJSON(): {
        peerInfoDelay: number;
        onlineUser: number;
        productivity: number;
        paidSourceChainMagic: string;
        paidsourceChainName: string;
        paidAssetType: string;
        paidAmount: string;
        paidType: string;
        serviceNotesName: string;
        noteIP: string;
        delegateAddress: string;
        developerVote: boolean;
        systemDelegateVote: boolean;
        dappOnChainBuy: boolean;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<ServicePeerInfoModel>): T;
}
export declare class BlockchainStatusModel<S extends BLOCKCHAIN_STATUS = any> extends Message<BlockchainStatusModel<S>> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainStatusJSON<S>> {
    static INC: number;
    rebuildingProgressEvent?: BlockchainRebuildingProgressEventModel;
    peerScanningProgressEvent?: BlockchainPeerScanningProgressEventModel;
    replayBlockProgressEvent?: BlockchainReplayBlockProgressEventModel;
    generatingProgressEvent?: BlockchainGeneratingProgressEventModel;
    rollbackProgressEvent?: BlockchainRollbackProgressEventModel;
    get progress(): BFChainCore.BlockchainStatusJSON<S>;
    private _progressEvent?;
    get progressEvent(): BFChainCore.BlockchainStatus.StatusProgressEventMap<S> | undefined;
    set progressEvent(event: BFChainCore.BlockchainStatus.StatusProgressEventMap<S> | undefined);
    private _status;
    get status(): S;
    set status(value: S);
    private _clearProgressEvent;
    toJSON(): BFChainCore.BlockchainStatusJSON<S>;
}
export declare class PeerInfoModel extends Message<PeerInfoModel> implements BFChainCore.JSONToModelType<BFChainCore.PeerInfoJSON> {
    static INC: number;
    uid: number;
    height: number;
    blockchainStatus: BlockchainStatusModel;
    serviceInfoJSON?: string;
    private _parsed_serviceInfo;
    private _serviceInfo?;
    get serviceInfo(): BFChainCore.ServiceInfoJSON[] | undefined;
    set serviceInfo(serviceInfo: BFChainCore.ServiceInfoJSON[] | undefined);
    servicePeerInfoBufferList: Uint8Array[];
    get servicePeerInfo(): ServicePeerInfoModel[];
    set servicePeerInfo(servicePeerInfoList: ServicePeerInfoModel[]);
    peerConsensus: PeerConsensusModel;
    peerLinkCount: number;
    toJSON(): BFChainCore.PeerInfoJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<PeerInfoModel>): T;
}
export declare class GetPeerInfoReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.GetPeerInfoReturnJSON> {
    peerInfo?: PeerInfoModel;
    toJSON(): BFChainCore.GetPeerInfoReturnJSON;
}
