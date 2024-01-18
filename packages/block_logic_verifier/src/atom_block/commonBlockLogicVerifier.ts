import type { CommonBlock } from "@bfchain/core-model-block";
import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";

export class CommonBlockLogicVerifier extends BlockLogicVerifier {
  async verify(
    block: CommonBlock,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
  ) {
    await this.verifyBlockBase(block, processBlockType, generatorInfo);
    await this.checkPreviousBlock(block);
    await this.isValidBlockSlot(block);
    return true;
  }

  async verifyBlockAsset(block: CommonBlock) {
    // 检验块内资产变动
    await this.checkAssetChangeHash(block.height, block.asset.commonAsset.assetChangeHash);
  }
}
