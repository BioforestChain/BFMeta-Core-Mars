import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import type { CommonBlock } from "@bfchain/core-model-block";
export declare class CommonBlockLogicVerifier extends BlockLogicVerifier {
    verify(block: CommonBlock, processBlockType: PROCESSBLOCK_TYPE, usedAddressCache?: BFChainCore.GeneratorAddressCache, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<boolean>;
    verifyBlockRemark(block: CommonBlock, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
    checkMaxBeginBalanceAndMaxTxCount(block: CommonBlock, tickResult: BFChainCore.TickResultInfo): void;
}
