declare namespace BFChainCore {
  interface ProgressEventJSON {
    type: string;
    mode: import("./").PROGRESS_EVENT_MODE;
    loaded: number;
    buffer?: number;
    total: number;
  }
  type TransactionsProgressEventJSON = ProgressEventJSON & {
    /**已经下载的交易的index范围 */
    finishedDetails: RangeJSON[];
  };
  type BlocksProgressEventJSON = ProgressEventJSON & {
    finishedDetails: RangeJSON[];
    processingDetails: { [height: number]: TransactionsProgressEventJSON };
  };
  type BlockchainRebuildingProgressEventJSON = ProgressEventJSON & {
    currentBlockDetails: BlocksProgressEventJSON;
  };
  type BlockchainPeerScanningProgressEventJSON = ProgressEventJSON & {};
  type BlockchainReplayBlockProgressEventJSON = ProgressEventJSON & {
    type: "blockchainReplayBlock";
    applyDetails: { [height: number]: BlocksProgressEventJSON };
    syncDetails: { [height: number]: BlocksProgressEventJSON };
  };
  type BlockchainGeneratingProgressEventJSON = ProgressEventJSON & {};
  type BlockchainRollbackProgressEventJSON = ProgressEventJSON & {};
}
