import type { GenesisBlock } from "@bfchain/core-model-block";
import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";

export class GenesisBlockLogicVerifier extends BlockLogicVerifier {
  async verify(
    block: GenesisBlock,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
  ) {
    await this.verifyBlockBase(block, processBlockType, generatorInfo);
    return true;
  }

  async verifyBlockAsset(block: GenesisBlock) {
    // 校验新注册的受托人
    await this.checkNewDelegates(block.height);
    // 检验块内资产变动
    await this.checkAssetChangeHash(block.height, block.asset.genesisAsset.assetChangeHash);
  }
}
