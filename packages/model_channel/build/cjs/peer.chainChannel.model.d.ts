/// <reference types="long" />
import { Message } from "@bfchain/protobuf";
import { CommonResponse } from "./common.chainChannel.model";
import { BlockchainRebuidingProgressEventModel as BlockchainRebuildingProgressEventModel, BlockchainPeerScanningProgressEventModel, BlockchainReplayBlockProgressEventModel, BlockchainGeneratingProgressEventModel, BlockchainRollbackProgressEventModel } from "@bfchain/core-model-progress";
import { BLOCKCHAIN_STATUS } from "./constants";
/**缓存服务市场信息解析结果 */
export declare class GetPeerInfoArgModel extends Message<GetPeerInfoArgModel> implements BFChainCore.JSONToModelType<BFChainCore.GetPeerInfoArgJSON> {
    /**申请分配的UID */
    uid?: number;
    toJSON(): {
        uid: number | undefined;
    };
}
export declare class PeerConsensusModel extends Message<PeerConsensusModel> implements BFChainCore.JSONToModelType<BFChainCore.PeerConsensusJSON> {
    /**节点的时间 */
    peerTimeLong: Long;
    get peerTime(): number;
    set peerTime(v: number);
    toJSON(): {
        peerTime: number;
    };
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<PeerConsensusModel>): T;
}
/**服务市场节点扫描信息 */
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
/**服务市场信息 */
/**区块链状态以及当下任务进度模型 */
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
    /**区块高度 */
    height: number;
    /**区块状态 */
    blockchainStatus: BlockchainStatusModel;
    serviceInfoJSON?: string;
    private _parsed_serviceInfo;
    private _serviceInfo?;
    get serviceInfo(): BFChainCore.ServiceInfoJSON[] | undefined;
    set serviceInfo(serviceInfo: BFChainCore.ServiceInfoJSON[] | undefined);
    /**服务市场信息 */
    /**服务市场节点扫描信息 */
    servicePeerInfoBufferList: Uint8Array[];
    get servicePeerInfo(): ServicePeerInfoModel[];
    set servicePeerInfo(servicePeerInfoList: ServicePeerInfoModel[]);
    /**节点共识信息 */
    peerConsensus: PeerConsensusModel;
    /**节点连接的数量 */
    peerLinkCount: number;
    toJSON(): BFChainCore.PeerInfoJSON;
    static fromObject<T extends Message>(this: BFChainProtobuf.Constructor<T>, object: BFChainProtobuf.ObjectFromType<PeerInfoModel>): T;
}
export declare class GetPeerInfoReturnModel extends CommonResponse implements BFChainCore.JSONToModelType<BFChainCore.GetPeerInfoReturnJSON> {
    peerInfo?: PeerInfoModel;
    toJSON(): BFChainCore.GetPeerInfoReturnJSON;
}
//# sourceMappingURL=peer.chainChannel.model.d.ts.map