declare namespace BFChainCore {
    interface BlockGetterHelperSimpleInterface {
        getBlockByHeight(height: number): Promise<Block | undefined>;
        getBlockBySignature(signature: string): Promise<Block | undefined>;
        getBlockGeneratorPublicKeyBufferByHeight?: (height: number) => Promise<Uint8Array | undefined>;
        getBlockSignatureByHeight?: (height: number) => Promise<Uint8Array | undefined>;
        getLastBlock(): Promise<Block>;
        getCurrentGenerateBlock?(): Promise<CurrentGeneratingBlockInfo | undefined>;
        getCurrentReplayingBlockInfo?(): Promise<CurrentReplayingBlockSimpleInfo | undefined>;
        chainBlockFork?(block: BFChainCore.Block, cause: number): Promise<void>;
        getNewForgingDelegates?(lastBlock: LastBlockInfo, currentGeneraterPublicKey: string): Promise<BFChainCore.ForSortAccountInfo[]>;
        getCountBlock?(args: {
            height?: number;
            generatorPublicKey?: string;
            signature?: string;
            version?: number;
        }): Promise<number>;
        countBlockTick?(height: number): Promise<number>;
        getVoteForDelegate?(generatorAddress: string, height: number): Promise<VoterInfo[]>;
        getVoteRecords?(): Promise<VoteRecord>;
    }
    interface BlockGetterHelperInterface<CC extends ChainChannel = ChainChannel> extends BlockGetterHelperSimpleInterface {
        getCurrentReplayingBlockInfo?(): Promise<CurrentReplayingBlockInfo<CC> | undefined>;
    }
    type BlockPlotChecker = Readonly<{
        height: number;
        timestamp: number;
        blockParticipation: bigint;
        numberOfTransactions: number;
        totalFee: bigint;
        signature: string;
        previousBlockSignature: string;
    }>;
    type CurrentGeneratingBlockInfo = Omit<NewBlockArgJSON, "signature"> | Omit<BlockPlotChecker, "signature">;
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
    type GeneratorAddressCache = Map<number, {
        signature: string;
        timestamp: number;
        address: string;
    }>;
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
        onClose(handle: (error: BFChainUtil.InterruptedException) => any): EventListenerRemover;
        close(reason?: string): void;
    }
}
