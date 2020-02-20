declare namespace BFChainCore {
  interface ProgressEventJSON<T extends string = string> {
    type: T;
    mode: import("./").PROGRESS_EVENT_MODE;
    loaded: number;
    buffer?: number;
    total: number;
  }
  type TransactionsProgressEventJSON = ProgressEventJSON<"transactions"> & {
    /**已经下载的交易的index范围 */
    finishedDetails: BFChainCore.RangeJSON[];
  };
  type BlocksProgressEventJSON = ProgressEventJSON<"blocks"> & {
    finishedDetails: BFChainCore.RangeJSON[];
    processingDetails: { [height: number]: TransactionsProgressEventJSON };
  };
  type BlockchainRebuildingProgressEventJSON = ProgressEventJSON<"blockchainRebuiding"> & {
    currentBlockDetails: BlocksProgressEventJSON;
  };
  type BlockchainPeerScanningProgressEventJSON = ProgressEventJSON<"blockchainPeerScanning"> & {};
  type BlockchainReplayBlockProgressEventJSON = ProgressEventJSON<"blockchainReplayBlock"> & {
    type: "blockchainReplayBlock";
    applyDetails: { [height: number]: BlocksProgressEventJSON };
    syncDetails: { [height: number]: BlocksProgressEventJSON };
  };
  type BlockchainGeneratingProgressEventJSON = ProgressEventJSON<"blockchainGenerating"> & {};
  type BlockchainRollbackProgressEventJSON = ProgressEventJSON<"blockchainRollback"> & {};
}
