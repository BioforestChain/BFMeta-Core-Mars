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
    const { newDelegates, assetChangeHash, chainOnChainHash } = asset.roundLastAsset;
    // 检验块内资产变动
    await this.checkAssetChangeHash(height, assetChangeHash);
    // 校验链上链 hash
    await this.checkChainOnChainHash(height, chainOnChainHash);
    // 校验新注册的受托人
    await this.isValidNewDelegates(height, newDelegates);
    // 校验新一轮的打块账户
    await this.checkNewForgingDelegates(block);
  }

  /**
   * 新注册的受托人是否合法
   *
   * @param height
   * @param newDelegates
   */
  async isValidNewDelegates(height: number, newDelegates: string[]) {
    // 校验新注册的受托人
    const realNewDelegates = await this.checkNewDelegates(height);
    if (newDelegates.length !== realNewDelegates.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `newDelegates length ${newDelegates.length}`,
        be_compare_prop: `newDelegates length ${realNewDelegates.length}`,
        to_target: "block",
        be_target: "blockChain",
      });
    }
    // 校验新注册的受托人是否与区块携带的一致
    for (const address of newDelegates) {
      if (!realNewDelegates.includes(address)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `newDelegates ${JSON.stringify(realNewDelegates)}`,
          be_compare_prop: `newDelegates ${address}`,
          to_target: "block",
          be_target: "blockChain",
        });
      }
    }
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
    const nextRoundDelegates = block.asset.roundLastAsset.nextRoundDelegates;
    if (delegates.length !== nextRoundDelegates.length) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `delegates length ${delegates.length}`,
        be_compare_prop: `delegates length ${nextRoundDelegates.length}`,
        to_target: "block asset",
        be_target: "calculate",
      });
    }

    for (let i = 0; i < delegates.length; i++) {
      const address = delegates[i].address;
      const nextRoundDelegate = nextRoundDelegates[i];
      if (nextRoundDelegate.address !== address) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address}`,
          to_target: "block asset",
          be_target: "calculate",
        });
      }
      const calcEquity = delegates[i].vote.toString();
      if (nextRoundDelegate.equity !== calcEquity) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address} equity ${nextRoundDelegate.equity}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address} equity ${calcEquity}`,
          to_target: "block asset",
          be_target: "calculate",
        });
      }
    }
  }

  /**
   * 校验链上上一轮末投票账户中最大初始余额和交易量
   *
   * @param block
   * @param tickResult
   */
  checkMaxBeginBalanceAndMaxTxCount(block: RoundLastBlock, tickResult: BFChainCore.TickResultInfo) {
    const roundLastAsset = block.asset.roundLastAsset;
    if (roundLastAsset.maxBeginBalance !== tickResult.maxBeginBalance) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `maxBeginBalance ${roundLastAsset.maxBeginBalance}`,
        be_compare_prop: `maxBeginBalance ${tickResult.maxBeginBalance}`,
        to_target: "block asset",
        be_target: "calculate",
      });
    }
    if (roundLastAsset.maxTxCount !== tickResult.maxTxCount) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `maxTxCount ${roundLastAsset.maxTxCount}`,
        be_compare_prop: `maxTxCount ${tickResult.maxTxCount}`,
        to_target: "block asset",
        be_target: "calculate",
      });
    }
    return true;
  }
}
