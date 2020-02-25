import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import type { GenesisBlock } from "@bfchain/core-model-block";
export declare class GenesisBlockLogicVerifier extends BlockLogicVerifier {
    verify(block: GenesisBlock, processBlockType: PROCESSBLOCK_TYPE, usedAddressCache?: BFChainCore.GeneratorAddressCache, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<boolean>;
    verifyBlockRemark(block: GenesisBlock, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
    checkMaxBeginBalanceAndMaxTxCount(block: GenesisBlock, tickResult: BFChainCore.TickResultInfo): void;
}
