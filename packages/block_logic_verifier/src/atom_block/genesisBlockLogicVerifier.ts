import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import type { GenesisBlock } from "@bfchain/core-model-block";

export class GenesisBlockLogicVerifier extends BlockLogicVerifier {
  async verify(
    block: GenesisBlock,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
    transactionGetterHelper = this.transactionGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    // body check
    await this.verifyBlockBase(
      block,
      processBlockType,
      generatorInfo,
      transactionGetterHelper,
      blockGetterHelper,
    );
    // 由于 remark 部分数据涉及交易流程，所以在外部手动调用校验
    // remark check
    // await this.verifyBlockRemark(block, blockGetterHelper, transactionGetterHelper);

    return true;
  }

  async verifyBlockRemark(
    block: GenesisBlock,
    transactionGetterHelper = this.transactionGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    // 校验新注册的受托人
    await this.checkNewDelegates(block.height, transactionGetterHelper);
  }

  checkMaxBeginBalanceAndMaxTxCount(block: GenesisBlock, tickResult: BFChainCore.TickResultInfo) {
    return;
  }
}
