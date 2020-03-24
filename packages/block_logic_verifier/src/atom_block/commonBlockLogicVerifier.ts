import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import type { CommonBlock } from "@bfchain/core-model-block";

export class CommonBlockLogicVerifier extends BlockLogicVerifier {
  async verify(
    block: CommonBlock,
    processBlockType: PROCESSBLOCK_TYPE,
    blockGetterHelper = this.blockGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    // body check
    await this.verifyBlockBase(block, processBlockType, blockGetterHelper, transactionGetterHelper);
    await this.checkPreviousBlock(block, blockGetterHelper);
    await this.isValidBlockSlot(block,  blockGetterHelper);
    // 由于 remark 部分数据涉及交易流程，所以在外部手动调用校验
    // remark check
    // await this.verifyBlockRemark(block, blockGetterHelper, transactionGetterHelper);

    return true;
  }

  async verifyBlockRemark(
    block: CommonBlock,
    blockGetterHelper = this.blockGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    // 校验新注册的受托人
    await this.checkNewDelegates(block.height, transactionGetterHelper);
  }

  checkMaxBeginBalanceAndMaxTxCount(block: CommonBlock, tickResult: BFChainCore.TickResultInfo) {
    return;
  }
}
