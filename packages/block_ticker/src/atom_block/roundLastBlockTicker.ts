import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { Injectable } from "@bfchain/util";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "TICKER",
  "BlockLogicTicker",
);
import { BlockTicker } from "./_blockbaseTicker";
import type { RoundLastBlock } from "@bfchain/core-model-block";

@Injectable()
export class RoundLastBlockTicker extends BlockTicker {
  async tick(
    block: RoundLastBlock,
    accountGetterHelper = this.accountGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {
    await this.tickBlockBase(block, accountGetterHelper, blockTickGetterHelper);

    // const round = this.blockHelper.calcRoundByHeight(block.height);

    // return await this.roundEnd(block, round, accountGetterHelper, blockTickGetterHelper);
  }
  /**
   * 轮次结束时做扫尾工作
   *
   * @param block
   * @param round
   */
  async roundEnd(
    block: BFChainCore.Block,
    round: number,
    accountGetterHelper = this.accountGetterHelper,
    blockTickGetterHelper = this.blockTickGetterHelper,
  ) {}
}
