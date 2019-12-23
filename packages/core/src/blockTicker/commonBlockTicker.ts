import { BlockTicker } from "./_blockbaseTicker";
import { CommonBlock } from "../../model";
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
