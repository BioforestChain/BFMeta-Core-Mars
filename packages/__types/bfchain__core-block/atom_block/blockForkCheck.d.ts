import { Block } from "@bfchain/core-model-block";
import { BlockHelper, ChainTimeHelper, ConfigHelper } from "@bfchain/core-helper";
import { ChainChannelGroup } from "@bfchain/core-channel";
export declare enum BLOCK_CHAIN_PLOT {
    KEEP = 1,
    MERGE = 2,
    FORK = 3
}
declare enum BLOCK_CHAIN_CUSTOM_PLOT {
    PUZZLED = 11
}
declare type MixBlockCheckResult = {
    plot: BLOCK_CHAIN_PLOT.MERGE;
    height: number;
    blockPlotChecker: BFChainCore.BlockPlotChecker;
} | {
    plot: BLOCK_CHAIN_PLOT.KEEP;
    height: number;
    blockPlotChecker: BFChainCore.BlockPlotChecker;
} | {
    plot: BLOCK_CHAIN_PLOT.FORK;
    height?: number;
} | {
    plot: BLOCK_CHAIN_CUSTOM_PLOT.PUZZLED;
};
export declare class BlockForkChecker {
    private blockHelper;
    private timeHelper;
    private config;
    constructor(blockHelper: BlockHelper, timeHelper: ChainTimeHelper, config: ConfigHelper);
    checkNewBlockFromChainChannel<CC extends BFChainCore.ChainChannel>(pc2_or_lastestBlock2: BFChainCore.BlockPlotChecker | BFChainCore.Block, chainChannel_or_Group: ChainChannelGroup<CC> | CC, blockGetterHelper1?: BFChainCore.BlockGetterHelperInterface<CC>): Promise<{
        plot: BLOCK_CHAIN_PLOT;
        height: number;
        block?: Block<BFChainCore.CommonBlockRemarkJSON> | undefined;
    }>;
    private checkSameHeightBlockPlot_;
    private checkSameHeightBlockListPlot_;
    private getBlockPlotCheckerEnd_;
    checkBlockGetterPlot(pc1: BFChainCore.BlockPlotChecker, blockGetterHelper1: BFChainCore.BlockGetterHelperSimpleInterface | undefined, pc2: BFChainCore.BlockPlotChecker, blockGetterHelper2: BFChainCore.BlockGetterHelperSimpleInterface | undefined): Promise<MixBlockCheckResult>;
    checkBlockGetterPlotEnd(pc1: BFChainCore.BlockPlotChecker, pc2: BFChainCore.BlockPlotChecker, blockGetterHelper2: BFChainCore.BlockGetterHelperSimpleInterface | undefined): Promise<MixBlockCheckResult>;
    checkNewBlock(pc2_or_lastestBlock2: BFChainCore.BlockPlotChecker | BFChainCore.Block, blockGetterHelper2: BFChainCore.BlockGetterHelperSimpleInterface, blockGetterHelper1?: BFChainCore.BlockGetterHelperSimpleInterface | undefined): Promise<{
        plot: BLOCK_CHAIN_PLOT;
        height: number;
        block?: Block;
    }>;
    findNearestSameBlock(theHeight: number, blockGetterHelper1?: BFChainCore.BlockGetterHelperSimpleInterface, blockGetterHelper2?: BFChainCore.BlockGetterHelperSimpleInterface): Promise<Block<BFChainCore.CommonBlockRemarkJSON>>;
    findNearestSameBlockInOneRound(theHeight: number, lastRoundEndHeight: number, blockGetterHelper1?: BFChainCore.BlockGetterHelperSimpleInterface, blockGetterHelper2?: BFChainCore.BlockGetterHelperSimpleInterface): Promise<Block<BFChainCore.CommonBlockRemarkJSON> | undefined>;
}
export {};
