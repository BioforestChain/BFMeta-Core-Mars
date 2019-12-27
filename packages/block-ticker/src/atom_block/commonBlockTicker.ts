import { BlockTicker } from "./_blockbaseTicker";
import { CommonBlock } from "@bfchain/core-model-block";
import { Injectable } from "@bfchain/util";

@Injectable()
export class CommonBlockTicker extends BlockTicker {
  async tick(
    block: CommonBlock,
    accountGetterHelper = this.accountGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    await this.tickBlockBase(block, accountGetterHelper, blockGetterHelper, blockTickGetterHelper);
    return {};
  }
}
