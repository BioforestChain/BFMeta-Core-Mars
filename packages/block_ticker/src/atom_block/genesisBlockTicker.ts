import { BlockTicker } from "./_blockbaseTicker";
import type { GenesisBlock } from "@bfchain/core-model-block";
import { CoreExceptionGenerator, SHOULD_NOT_TICK } from "@bfchain/core-util-exception";
import { Injectable } from "@bfchain/util";

const { ConsensusException } = CoreExceptionGenerator("CONTROLLER", "BlockLogicVerifier");

@Injectable()
export class GenesisBlockTicker extends BlockTicker {
  async tick(block: GenesisBlock) {
    this.genesisBlockShouldNotTick(block.height);
    return {};
  }

  genesisBlockShouldNotTick(height: number) {
    throw new ConsensusException(SHOULD_NOT_TICK, {
      height: height,
      target: "blockChain",
      function: "genesisBlockShouldNotTick",
    });
  }
}
