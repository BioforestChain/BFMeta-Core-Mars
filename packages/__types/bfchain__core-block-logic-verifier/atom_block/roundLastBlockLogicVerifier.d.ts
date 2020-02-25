import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import type { RoundLastBlock } from "@bfchain/core-model-block";
export declare class RoundLastBlockLogicVerifier extends BlockLogicVerifier {
    verify(block: RoundLastBlock, processBlockType: PROCESSBLOCK_TYPE, usedAddressCache?: BFChainCore.GeneratorAddressCache, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<boolean>;
    verifyBlockRemark(block: RoundLastBlock, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
    isValidNewDelegates(height: number, newDelegates: string[], transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface | undefined): Promise<void>;
    checkRemarkHash(height: number, hash: string, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    checkNewForgingDelegates(block: RoundLastBlock, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined): Promise<void>;
    checkMaxBeginBalanceAndMaxTxCount(block: RoundLastBlock, tickResult: BFChainCore.TickResultInfo): void;
}
