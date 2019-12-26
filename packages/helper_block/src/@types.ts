declare namespace BFChainCore {
  interface BlockGetterHelperInterface {
    /**根据高度获取区块 */
    getBlockByHeight(height: number): Promise<Block | undefined>;
    /**根据区块 id 获取区块 */
    getBlockById(id: string): Promise<Block | undefined>;
    getBlockGeneratorPublicKeyBufferByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    getBlockSignatureByHeight?: (height: number) => Promise<Uint8Array | undefined>;
    getLastBlock(): Promise<Block>;
    getCurrentGenerateBlock?(): Promise<CurrentGenerateBlockInfo | undefined>;
    getCurrentSyncBlockInfo?(): Promise<
      | {
          block: Block;
          blockGetterHelper: BlockGetterHelperInterface;
        }
      | undefined
    >;
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
      id?: string;
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
  type BlockPlotChecker = Readonly<{
    height: number;
    timestamp: number;
    /**参与度 */
    blockParticipation: bigint;
    /**交易量 */
    numberOfTransactions: number;
    /**手续费 */
    totalFee: bigint;
    /**区块id,如果没有id,就用`ff*128` */
    blockId: string;
    previousBlockId: string;
  }>;
  type CurrentGenerateBlockInfo =
    | Omit<NewBlockArgJSON, "blockId">
    | Omit<BlockPlotChecker, "blockId">;

  type ForSortAccountInfo = {
    productivity: number;
    address: string;
    publicKey: string;
    vote: bigint;
  };

  type GeneratorAddressCache = Map<number, { id: string; timestamp: number; address: string }>;
  type AccountChangeResultInfo = {
    [address: string]: {
      [magicAndAssetType: string]: string;
    };
  };
  type LastBlockInfo = {
    id: string;
    height: number;
    timestamp: number;
    blockSize: number;
    blockSignature: string;
    generatorPublicKey: string;
    numberOfTransactions: number;
    payloadHash: string;
    payloadLength: number;
    previousBlock: string;
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
}
