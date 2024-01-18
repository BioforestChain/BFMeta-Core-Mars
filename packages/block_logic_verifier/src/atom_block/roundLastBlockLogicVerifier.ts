import type { RoundLastBlock } from "@bfchain/core-model-block";
import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BlockLogicVerifier",
);

export class RoundLastBlockLogicVerifier extends BlockLogicVerifier {
  async verify(
    block: RoundLastBlock,
    processBlockType: PROCESSBLOCK_TYPE,
    generatorInfo: BFChainCore.AccountInfo,
  ) {
    await this.verifyBlockBase(block, processBlockType, generatorInfo);
    await this.checkPreviousBlock(block);
    await this.isValidBlockSlot(block);
    return true;
  }

  async verifyBlockAsset(block: RoundLastBlock) {
    const { height, asset } = block;
    const { assetChangeHash, chainOnChainHash } = asset.roundLastAsset;
    // 检验块内资产变动
    await this.checkAssetChangeHash(height, assetChangeHash);
    // 校验链上链 hash
    await this.checkChainOnChainHash(height, chainOnChainHash);
    // 校验新一轮的打块账户
    await this.checkNewForgingDelegates(block);
  }

  /**
   * 校验链上链 hash
   *
   * @param height
   * @param hash
   */
  async checkChainOnChainHash(height: number, hash: string) {
    const hashString = await this.blockHelper.calcChainOnChainHash(height, this.blockGetterHelper);
    if (hashString !== hash) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `hashString ${hashString}`,
        be_compare_prop: `hash ${hash}`,
        to_target: "block",
        be_target: "calculate",
      });
    }
  }

  /**
   * 校验新一轮的打块账户是否合法
   *
   * @param block
   */
  async checkNewForgingDelegates(block: RoundLastBlock) {
    const blockGetterHelper = this.blockGetterHelper;
    if (typeof blockGetterHelper.getNewForgingDelegates !== "function") {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: "getNewForgingDelegates",
        target: "blockGetterHelper",
      });
    }
    const delegates = await blockGetterHelper.getNewForgingDelegates(
      await blockGetterHelper.getLastBlock(),
      block.generatorPublicKey,
    );
    const nextRoundGenerators = block.asset.roundLastAsset.nextRoundGenerators;
    if (delegates.length !== nextRoundGenerators.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `delegates length ${delegates.length}`,
        be_compare_prop: `delegates length ${nextRoundGenerators.length}`,
        to_target: "block asset",
        be_target: "calculate",
      });
    }

    for (let i = 0; i < delegates.length; i++) {
      const address = delegates[i].address;
      const nextRoundGenerator = nextRoundGenerators[i];
      if (nextRoundGenerator.address !== address) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundGenerators index ${i} address ${nextRoundGenerator.address}`,
          be_compare_prop: `nextRoundGenerators index ${i} address ${address}`,
          to_target: "block asset",
          be_target: "calculate",
        });
      }
      const numberOfEntities = delegates[i].numberOfEntities;
      if (nextRoundGenerator.numberOfEntities !== numberOfEntities) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundGenerators index ${i} address ${nextRoundGenerator.address} numberOfEntities ${nextRoundGenerator.numberOfEntities}`,
          be_compare_prop: `nextRoundGenerators index ${i} address ${address} numberOfEntities ${numberOfEntities}`,
          to_target: "block asset",
          be_target: "calculate",
        });
      }
    }
  }
}
