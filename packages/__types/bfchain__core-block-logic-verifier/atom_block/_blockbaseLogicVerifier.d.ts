import { AccountBaseHelper, BlockHelper, ConfigHelper, ChainTimeHelper, MilestonesHelper, ChainAssetInfoHelper, StatisticsInfo } from "@bfchain/core-helper";
import type { Block } from "@bfchain/core-model-block";
import { BlockGeneratorCalculator } from "@bfchain/core-block";
export declare enum PROCESSBLOCK_TYPE {
    SYNC = 1,
    REBUILD = 2,
    GENERATEBLOCK = 3
}
export declare abstract class BlockLogicVerifier<T extends Block<any> = Block<any>> {
    blockHelper: BlockHelper;
    protected accountBaseHelper: AccountBaseHelper;
    protected configHelper: ConfigHelper;
    protected timeHelper: ChainTimeHelper;
    protected milestonesHelper: MilestonesHelper;
    protected chainAssetInfoHelper: ChainAssetInfoHelper;
    protected blockCore: import("@bfchain/core-block").BlockCore;
    protected blockGeneratorCalculator: BlockGeneratorCalculator;
    protected blockGetterHelper?: BFChainCore.BlockGetterHelperInterface;
    protected transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface;
    abstract verify(block: T, processBlockType: PROCESSBLOCK_TYPE, usedAddressCache?: BFChainCore.GeneratorAddressCache, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface): Promise<boolean>;
    abstract verifyBlockRemark(block: T, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface): Promise<void>;
    abstract checkMaxBeginBalanceAndMaxTxCount(block: T, tickResult: BFChainCore.TickResultInfo): void;
    verifyBlockBase(block: T, processBlockType: PROCESSBLOCK_TYPE, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
    isBlockAlreadyExist(signature: string, height: number, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    verifyBlockWithTransactions(block: T, processBlockType: PROCESSBLOCK_TYPE): Promise<void>;
    checkPreviousBlock(block: T, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    isValidBlockSlot(block: T, usedAddressCache?: BFChainCore.GeneratorAddressCache, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    checkNewDelegates(height: number, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<string[]>;
    verifyTransactionAssetChange(trsInBlock: BFChainCore.TransactionInBlock, applyResult: BFChainCore.AccountChangeResultInfo, statisticsInfo: StatisticsInfo): void;
}
