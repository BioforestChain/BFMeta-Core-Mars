declare namespace BFChainCore {
    type BlockTicker<T extends Block> = import("./atom_block").BlockTicker<T>;
    type BlockTickerConstructor<T extends Block = any> = new (...args: any[]) => BlockTicker<T>;
    type VoterRewardListInfo = {
        [address: string]: bigint;
    };
    interface BlockTickGetterHelperInterface {
        saveVotingAccountEquity(height: number): Promise<void>;
        saveVotingAccountLastInfoAndEquity(height: number): Promise<void>;
        getMaxBeginBalanceAndMaxTxCountAndRate(round: number): {
            maxBeginBalance: string;
            maxTxCount: number;
            rate: string;
        };
        updateForgingAccount(block: BFChainCore.Block, forgingReward: bigint): Promise<void>;
        updateVotingAccount(block: Block, voteRewardList: VoterRewardListInfo): Promise<void>;
    }
}
