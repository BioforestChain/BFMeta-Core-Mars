import { BlockTicker } from "./_blockbaseTicker";
import type { RoundLastBlock } from "@bfchain/core-model-block";
export declare class RoundLastBlockTicker extends BlockTicker {
    tick(block: RoundLastBlock, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<{
        maxBeginBalance: string;
        maxTxCount: number;
        rate: string;
        equities: bigint;
    }>;
    roundEnd(block: BFChainCore.Block, round: number, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<{
        maxBeginBalance: string;
        maxTxCount: number;
        rate: string;
        equities: bigint;
    }>;
    saveDelegatesVoteAndTotalVote(height: number, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined): Promise<bigint>;
    saveVotingAccountEquity(height: number, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<void>;
    saveVotingAccountLastInfoAndEquity(height: number, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<void>;
    getMaxBeginBalanceAndMaxTxCountAndRate(round: number, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<{
        maxBeginBalance: string;
        maxTxCount: number;
        rate: string;
    }>;
}
