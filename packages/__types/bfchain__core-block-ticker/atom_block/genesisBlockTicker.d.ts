import { BlockTicker } from "./_blockbaseTicker";
import type { GenesisBlock } from "@bfchain/core-model-block";
export declare class GenesisBlockTicker extends BlockTicker {
    tick(block: GenesisBlock): Promise<{}>;
    genesisBlockShouldNotTick(height: number): void;
}
