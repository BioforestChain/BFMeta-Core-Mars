import { BlockTicker } from "./_blockbaseTicker";
import type { CommonBlock } from "@bfchain/core-model-block";
export declare class CommonBlockTicker extends BlockTicker {
    tick(block: CommonBlock, accountGetterHelper?: BFChainCore.AccountGetterHelperInterface<any> | undefined, blockGetterHelper?: BFChainCore.BlockGetterHelperInterface<BFChainCore.ChainChannel> | undefined, blockTickGetterHelper?: BFChainCore.BlockTickGetterHelperInterface | undefined): Promise<{}>;
}
