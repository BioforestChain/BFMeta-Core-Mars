declare namespace BFChainCore {
  interface BlockGetterHelperSimpleInterface {
    /**根据高度获取区块 */
    getBlockByHeight(height: number): Promise<Block | undefined>;
    /**根据区块 signature 获取区块 */
    getBlockBySignature(signature: string): Promise<Block | undefined>;
    getBlockGeneratorPublicKeyBufferByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    getBlockSignatureByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    getLastBlock(): Promise<Block>;
    getCurrentGenerateBlock?(): Promise<CurrentGeneratingBlockInfo | undefined>;
    getCurrentReplayingBlockInfo?(): Promise<CurrentReplayingBlockSimpleInfo | undefined>;
    /**记录链区块分叉信息 */
    chainBlockFork?(block: BFChainCore.Block, cause: number): Promise<void>;
    /**获取新一轮的打块受托人 */
    getNewForgingDelegates?(
      lastBlock: LastBlockInfo,
      currentGeneraterPublicKey: string,
    ): Promise<BFChainCore.ForSortAccountInfo[]>;
    /**查询交易是否存在 */
    getCountBlock?(args: {
      /**区块高度 */
      height?: number;
      /**区块的锻造者公钥 */
      generatorPublicKey?: string;
      /**区块的签名 */
      signature?: string;
      /**区块的版本号 */
      version?: number;
    }): Promise<number>;
    /**统计区块 tick */
    countBlockTick?(height: number): Promise<number>;
    /**获取给某个账户投票的账户 */
    getVoteForDelegate?(generatorAddress: string, height: number): Promise<VoterInfo[]>;
    /**获取投票记录 */
    getVoteRecords?(): Promise<VoteRecord>;
  }
  interface BlockGetterHelperInterface<CC extends ChainChannel = ChainChannel>
    extends BlockGetterHelperSimpleInterface {
    getCurrentReplayingBlockInfo?(): Promise<CurrentReplayingBlockInfo<CC> | undefined>;
  }
  type BlockPlotChecker = Readonly<{
    height: number;
    timestamp: number;
    /**参与度 */
    blockParticipation: bigint;
    /**交易量 */
    numberOfTransactions: number;
    /**手续费 */
    totalFee: bigint;
    /**区块signature,如果没有signature,就用`ff*128` */
    signature: string;
    previousBlockSignature: string;
  }>;
  type CurrentGeneratingBlockInfo =
    | Omit<NewBlockArgJSON, "signature">
    | Omit<BlockPlotChecker, "signature">;
  type CurrentReplayingBlockSimpleInfo = {
    currentBlock: Block;
    replayingBlock?: Block;
    blockGetterHelper: BlockGetterHelperSimpleInterface;
  };
  type CurrentReplayingBlockInfo<CC extends ChainChannel> = CurrentReplayingBlockSimpleInfo & {
    blockGetterHelper: BlockGetterHelperInterface<CC>;
    chainChannelGroup?: ChainChannelGroup<CC>;
  };

  type ForSortAccountInfo = {
    productivity: number;
    address: string;
    publicKey: string;
    vote: bigint;
  };

  type GeneratorAddressCache = Map<
    number,
    { signature: string; timestamp: number; address: string }
  >;
  type AccountChangeResultInfo = {
    [address: string]: {
      [magicAndAssetType: string]: string;
    };
  };
  type LastBlockInfo = {
    height: number;
    timestamp: number;
    blockSize: number;
    signature: string;
    generatorPublicKey: string;
    numberOfTransactions: number;
    payloadHash: string;
    payloadLength: number;
    previousBlockSignature: string;
    totalAmount: string;
    totalFee: string;
    reward: string;
    magic: string;
    remark: {
      blockParticipation: string;
    };
  };
  type TickResultInfo = {
    maxBeginBalance?: string;
    maxTxCount?: number;
    rate?: string;
  };
  type VoterInfo = {
    equity: bigint;
    address: string;
  };
  type BlockUpdateDataInfo = {
    reward: bigint;
    vrewards: bigint;
    vrewardsRemaining: bigint;
    blockFee: bigint;
    blockReward: bigint;
    totalEquity: bigint;
    voters: VoterInfo[];
  };
  type VoteRecordInfo = {
    [address: string]: bigint;
  };
  type VoteRecord = {
    [address: string]: VoteRecordInfo;
  };

  //#region ChainChannel Base Interface

  interface ChainChannelGroup<CC extends ChainChannel> {
    addChainChannel(chainChannel: CC): boolean;
    removeChainChannel(chainChannel: CC): boolean;
    destroy(): void;
  }

  interface ChainChannel {
    endpoint: BFChainCore.ChannelEndpointInterface<Uint8Array>;
    close(reason?: string | undefined): void;
  }
  type EventListenerRemover = () => void;
  interface ChannelEndpointInterface<T = Uint8Array> {
    onMessage(handle: (messageData: T) => any): EventListenerRemover;
    postMessage(messageData: T): void;
    onClose(
      handle: (error: import("@bfchain/util").InterruptedException) => any,
    ): EventListenerRemover;
    close(reason?: string): void;
  }
  //#endregion
}
