import { BlocksProgressEventModel } from "./blocks.model";
import { ProgressEventModel } from "./progressEvent.model";
/**区块链重建中的事件进度模型 */
export declare class BlockchainRebuidingProgressEventModel extends ProgressEventModel<"blockchainRebuiding"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainRebuildingProgressEventJSON> {
    /**当前正在处理的区块的进度 */
    currentBlockDetails: BlocksProgressEventModel;
    toJSON(): {
        type: "blockchainRebuiding";
        mode: import("./progressEvent.model").PROGRESS_EVENT_MODE;
        loaded: number;
        buffer: number | undefined;
        total: number;
    } & {
        currentBlockDetails: {
            type: "blocks";
            mode: import("./progressEvent.model").PROGRESS_EVENT_MODE;
            loaded: number;
            buffer: number | undefined;
            total: number;
        } & {
            finishedDetails: {
                start: number;
                end: number;
            }[];
            processingDetails: {
                [height: number]: import("./transactions.model").TransactionsProgressEventModel;
            };
        };
    };
}
/**区块链节点扫描共识中的事件进度模型
 * 大部分情况处于 INDETERMINATE 模式
 * 在扫描节点阶段, total 会一直增加
 * 同时会进行共识, 此时的 loaded 会不断的变动
 */
export declare class BlockchainPeerScanningProgressEventModel extends ProgressEventModel<"blockchainPeerScanning"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainPeerScanningProgressEventJSON> {
}
/**区块链验证区块的事件进度模型
 * total 代表着校验交易的数量, 另外每一个区块另外代表着 1 个任务数
 * 验证的过程中如果收到新的区块, 那么 total 也要跟着增加
 */
export declare class BlockchainReplayBlockProgressEventModel extends ProgressEventModel<"blockchainReplayBlock"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainReplayBlockProgressEventJSON> {
    /**当前同步的区块的生效进度 */
    applyDetails: {
        [height: number]: BlocksProgressEventModel;
    };
    /**当前下载的区块的进度 */
    syncDetails: {
        [height: number]: BlocksProgressEventModel;
    };
    toJSON(): {
        type: "blockchainReplayBlock";
        mode: import("./progressEvent.model").PROGRESS_EVENT_MODE;
        loaded: number;
        buffer: number | undefined;
        total: number;
    } & {
        applyDetails: {
            [height: number]: BFChainCore.BlocksProgressEventJSON;
        };
        syncDetails: {
            [height: number]: BFChainCore.BlocksProgressEventJSON;
        };
    };
}
export declare class BlockchainRollbackProgressEventModel extends ProgressEventModel<"blockchainRollbackBlock"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainRollbackProgressEventJSON> {
}
/**区块链锻造区块的事件进度模型 */
export declare class BlockchainGeneratingProgressEventModel extends ProgressEventModel<"blockchainGenerating"> implements BFChainCore.JSONToModelType<BFChainCore.BlockchainGeneratingProgressEventJSON> {
}
export declare type SomeBlockchainStatusProgressEvent = BlockchainRebuidingProgressEventModel | BlockchainPeerScanningProgressEventModel | BlockchainReplayBlockProgressEventModel | BlockchainGeneratingProgressEventModel | BlockchainRollbackProgressEventModel;
//# sourceMappingURL=blockchainStatus.model.d.ts.map