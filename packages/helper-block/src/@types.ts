declare namespace BFChainCore {
  interface BlockGetterHelperSimpleInterface {
    /**
     * 根据区块高度获取区块
     *
     * @param height 高度
     */
    getBlockByHeight(height: number): Promise<Block | undefined>;
    /**
     * 根据区块 signature 获取区块
     *
     * @param signature 区块签名
     */
    getBlockBySignature(signature: string): Promise<Block | undefined>;
    /**
     * 根据区块高度获取锻造公钥
     *
     * @param height
     *
     */
    getBlockGeneratorPublicKeyBufferByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    /**
     * 根据区块高度获取区块签名
     *
     * @param height 区块高度
     *
     */
    getBlockSignatureByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    /**
     * 获取链上最新的区块
     *
     */
    getLastBlock(): Promise<Block>;
    /**
     * 获取当前锻造的区块
     *
     */
    getCurrentGenerateBlock?(): Promise<CurrentGeneratingBlockInfo | undefined>;
    /**
     * 获取当前重放中的区块信息
     *
     */
    getCurrentReplayingBlockInfo?(): Promise<CurrentReplayingBlockSimpleInfo | undefined>;
    /**
     * 记录链区块分叉信息
     *
     * @param block
     * @param cause
     */
    chainBlockFork?(block: BFChainCore.Block, cause: string): Promise<void>;
    /**
     * 获取新一轮的打块受托人
     *
     * @param lastBlock
     * @param currentGeneraterPublicKey
     */
    getNewForgingDelegates?<T extends Block>(
      lastBlock: LastBlockInfo<T>,
      currentGeneraterPublicKey: string,
    ): Promise<BFChainCore.ForSortAccountInfo[]>;
    /**
     * 查询区块是否存在
     *
     * @param args
     */
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
    /**
     * 获取给某个账户投票的账户
     *
     * @param generatorAddress
     * @param height
     */
    getVoteForDelegate?(generatorAddress: string, height: number): Promise<VoterInfo[]>;
    /**
     * 获取投票记录
     *
     */
    getVoteRecords?(): Promise<VoteRecord>;
    /**
     * 根据高度范围获取区块
     *
     * @param minHeight
     * @param maxHeight
     */
    getBlocksByRange?(minHeight: number, maxHeight: number): Promise<Block[]>;
  }
  interface BlockGetterHelperInterface<CC extends SimpleChainChannel = SimpleChainChannel>
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
  type CurrentReplayingBlockInfo<CC extends SimpleChainChannel> =
    CurrentReplayingBlockSimpleInfo & {
      blockGetterHelper: BlockGetterHelperInterface<CC>;
      chainChannelGroup?: ChainChannelGroup<CC>;
    };

  type ForSortAccountInfo = {
    productivity: number;
    address: string;
    publicKey: string;
    vote: bigint;
    isAcceptVote: boolean;
  };

  type AccountChangeResultInfo = {
    [address: string]: {
      [magicAndAssetType: string]: string;
    };
  };
  type LastBlockInfo<T extends Block> = {
    /**区块版本号 */
    version: number;
    /**区块高度 */
    height: number;
    /**区块时间戳 */
    timestamp: number;
    /**区块大小 */
    blockSize: number;
    /**锻造者公钥 */
    generatorPublicKey: string;
    /**锻造者的安全公钥 */
    generatorSecondPublicKey?: string;
    /**锻造者权益 */
    generatorEquity: string;
    /**区块事件数量 */
    numberOfTransactions: number;
    /**区块事件摘要 */
    payloadHash: string;
    /**区块事件摘要长度 */
    payloadLength: number;
    /**前块签名 */
    previousBlockSignature: string;
    /**总发生资产量 */
    totalAmount: string;
    /**总发生手续费 */
    totalFee: string;
    /**区块奖励值 */
    reward: string;
    /**区块的链标识符 */
    magic: string;
    /**区块参与度 */
    blockParticipation: string;
    /**区块签名 */
    signature: string;
    /**区块安全签名 */
    signSignature?: string;
    /**区块备注信息 */
    remark: { [key: string]: string };
    /**区块附加信息 */
    asset: GetBlockAssetJSON<T>;
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
  type VoterRewardListInfo = {
    [address: string]: bigint;
  };

  //#region ChainChannel Base Interface

  interface ChainChannelGroup<CC extends SimpleChainChannel> {
    include(chainChannel: CC): boolean;
    size: number;
    [Symbol.iterator](): IterableIterator<CC>;
    addChainChannel(chainChannel: CC): boolean;
    addChainChannels(chainChannels: CC | ChainChannelGroup<CC>): { ADD: number; FAIL: number };
    removeChainChannel(chainChannel: CC): boolean;
    destroy(): void;
  }

  interface SimpleChainChannel {
    endpoint: BFChainCore.ChannelEndpointInterface<Uint8Array>;
    close(reason?: string | undefined): void;
  }
  type EventListenerRemover = () => void;
  interface ChannelEndpointInterface<T = Uint8Array> {
    onMessage(handle: (messageData: T) => any): EventListenerRemover;
    postMessage(messageData: T): void;
    onClose(handle: (error: BFChainUtil.InterruptedException) => any): EventListenerRemover;
    close(reason?: string): void;
  }
  //#endregion
}
