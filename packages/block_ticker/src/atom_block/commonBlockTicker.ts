import { BlockTicker } from "./_blockbaseTicker";
import type { CommonBlock } from "@bfchain/core-model-block";
import { Injectable } from "@bfchain/util";

@Injectable()
export class CommonBlockTicker extends BlockTicker {
  async tick(
    block: CommonBlock,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    await this.tickBlockBase(block, blockGetterHelper, blockTickGetterHelper);

    return {};
  }
}
