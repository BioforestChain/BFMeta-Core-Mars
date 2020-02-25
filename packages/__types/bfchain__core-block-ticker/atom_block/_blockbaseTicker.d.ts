import { BlockHelper, ChainTimeHelper, ConfigHelper, AccountBaseHelper, JSBIHelper } from "@bfchain/core-helper";
import { BlockGeneratorCalculator } from "@bfchain/core-block";
import type { Block } from "@bfchain/core-model-block";
export declare abstract class BlockTicker<T extends Block<any> = Block<any>> {
    protected blockHelper: BlockHelper;
    protected configHelper: ConfigHelper;
    protected timeHelper: ChainTimeHelper;
    protected accountBaseHelper: AccountBaseHelper;
    protected jsbiHelper: JSBIHelper;
    protected blockGeneratorCalculator: BlockGeneratorCalculator;
    protected accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>;
    protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
    protected blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface;
    abstract tick(block: T, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any>, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface): Promise<BFChainCore.TickResultInfo>;
    tickBlockBase(block: T, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<void>;
    calcMissedBlocks(block: T, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    isBlockAlreadyTick(height: number, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    getVoteForDelegate(generatorAddress: string, height: number, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<{
        voters: BFChainCore.VoterInfo[];
        totalEquity: bigint;
    }>;
    calcForgingAndVotingReward(block: T, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<BFChainCore.BlockUpdateDataInfo>;
    updateForgingAndVotingAccount(block: T, blockUpdateData: BFChainCore.BlockUpdateDataInfo, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<void>;
}
