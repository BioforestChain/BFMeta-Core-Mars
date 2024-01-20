import { BlockTicker } from "./_blockbaseTicker";
import type { GenesisBlock } from "@bfchain/core-model-block";
import { CoreExceptionGenerator } from "@bfchain/core-util-exception";
import { Injectable } from "@bfchain/util";

const { ConsensusException } = CoreExceptionGenerator("CONTROLLER", "BlockLogicVerifier");

@Injectable()
export class GenesisBlockTicker extends BlockTicker {
  async tick(
    block: GenesisBlock,
    accountGetterHelper = this.accountGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    await this.tickBlockBase(block, accountGetterHelper, blockTickGetterHelper);
  }
}
