import { BlocksProgressEventModel } from "./blocks.model";
import { ProgressEventModel } from "./progressEvent.model";
export declare class BlockchainRebuidingProgressEventModel extends ProgressEventModel<"blockchainRebuiding"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainRebuildingProgressEventJSON> {
    currentBlockDetails: BlocksProgressEventModel;
    toJSON(): BFChainCore.BlockchainRebuildingProgressEventJSON;
}
export declare class BlockchainPeerScanningProgressEventModel extends ProgressEventModel<"blockchainPeerScanning"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainPeerScanningProgressEventJSON> {
}
export declare class BlockchainReplayBlockProgressEventModel extends ProgressEventModel<"blockchainReplayBlock"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainReplayBlockProgressEventJSON> {
    applyDetails: {
        [height: number]: BlocksProgressEventModel;
    };
    syncDetails: {
        [height: number]: BlocksProgressEventModel;
    };
    toJSON(): BFChainCore.BlockchainReplayBlockProgressEventJSON;
}
export declare class BlockchainRollbackProgressEventModel extends ProgressEventModel<"blockchainRollbackBlock"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainRollbackProgressEventJSON> {
}
export declare class BlockchainGeneratingProgressEventModel extends ProgressEventModel<"blockchainGenerating"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainGeneratingProgressEventJSON> {
}
export declare type SomeBlockchainStatusProgressEvent = BlockchainRebuidingProgressEventModel | BlockchainPeerScanningProgressEventModel | BlockchainReplayBlockProgressEventModel | BlockchainGeneratingProgressEventModel | BlockchainRollbackProgressEventModel;
