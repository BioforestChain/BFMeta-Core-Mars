import { BlockLogicVerifier, PROCESSBLOCK_TYPE } from "./_blockbaseLogicVerifier";
import type { RoundLastBlock } from "@bfchain/core-model-block";
import {
  CoreExceptionGenerator,
  NOT_MATCH,
  NOT_EXIST,
  PROP_IS_INVALID,
} from "@bfchain/core-util-exception";
const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BlockLogicVerifier",
);

export class RoundLastBlockLogicVerifier extends BlockLogicVerifier {
  async verify(
    block: RoundLastBlock,
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
    await this.checkPreviousBlock(block, blockGetterHelper);
    await this.isValidBlockSlot(block, blockGetterHelper);
    // 由于 remark 部分数据涉及交易流程，所以在外部手动调用校验
    // remark check
    // await this.verifyBlockRemark(block, blockGetterHelper, transactionGetterHelper);

    return true;
  }

  async verifyBlockAsset(
    block: RoundLastBlock,
    transactionGetterHelper = this.transactionGetterHelper,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    // 校验链上链 hash
    const { height, asset } = block;
    const { newDelegates, hash } = asset.roundLastAsset;
    await this.checkRemarkHash(height, hash, blockGetterHelper);
    await this.isValidNewDelegates(height, newDelegates, transactionGetterHelper);
    await this.checkNewForgingDelegates(block, blockGetterHelper);
  }

  /**
   * 新注册的受托人是否合法
   *
   * @param height
   * @param newDelegates
   */
  async isValidNewDelegates(
    height: number,
    newDelegates: string[],
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "isValidNewDelegates",
    } as const;
    // 校验新注册的受托人
    const realNewDelegates = await this.checkNewDelegates(height, transactionGetterHelper);
    if (newDelegates.length !== realNewDelegates.length) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `newDelegates length ${newDelegates.length}`,
        be_compare_prop: `newDelegates length ${realNewDelegates.length}`,
        to_target: "block",
        be_target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
    // 校验新注册的受托人是否与区块携带的一致
    for (const address of newDelegates) {
      if (!realNewDelegates.includes(address)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `newDelegates ${JSON.stringify(realNewDelegates)}`,
          be_compare_prop: `newDelegates ${address}`,
          to_target: "block",
          be_target: "blockChain",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 校验链上链 hash
   *
   * @param height
   * @param hash
   * @param blockGetterHelper
   */
  async checkRemarkHash(height: number, hash: string, blockGetterHelper = this.blockGetterHelper) {
    const hashString = await this.blockHelper.calcChainOnChainHash(height, blockGetterHelper);
    if (hashString !== hash) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `hashString ${hashString}`,
        be_compare_prop: `hash ${hash}`,
        to_target: "block",
        be_target: "calculate",
        function: "checkRemarkHash",
      });
    }
  }

  /**
   * 校验新一轮的打块账户是否合法
   *
   * @param block
   * @param blockGetterHelper
   */
  async checkNewForgingDelegates(
    block: RoundLastBlock,
    blockGetterHelper = this.blockGetterHelper,
  ) {
    const Function_Exception_Detail = {
      function: "checkNewForgingDelegates",
    } as const;
    if (!blockGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "blockGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (typeof blockGetterHelper.getNewForgingDelegates !== "function") {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "getNewForgingDelegates",
        target: "blockGetterHelper",
        ...Function_Exception_Detail,
      });
    }
    const delegates = await blockGetterHelper.getNewForgingDelegates(
      await blockGetterHelper.getLastBlock(),
      block.generatorPublicKey,
    );
    const nextRoundDelegates = block.asset.roundLastAsset.nextRoundDelegates;
    if (delegates.length !== nextRoundDelegates.length) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `delegates length ${delegates.length}`,
        be_compare_prop: `delegates length ${nextRoundDelegates.length}`,
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }

    for (let i = 0; i < delegates.length; i++) {
      const address = delegates[i].address;
      const nextRoundDelegate = nextRoundDelegates[i];
      if (nextRoundDelegate.address !== address) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address}`,
          to_target: "block remark",
          be_target: "calculate",
          ...Function_Exception_Detail,
        });
      }
      const calcEquity = delegates[i].vote.toString();
      if (nextRoundDelegate.equity !== calcEquity) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `nextRoundDelegates index ${i} address ${nextRoundDelegate.address} equity ${nextRoundDelegate.equity}`,
          be_compare_prop: `nextRoundDelegates index ${i} address ${address} equity ${calcEquity}`,
          to_target: "block remark",
          be_target: "calculate",
          ...Function_Exception_Detail,
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
    const Function_Exception_Detail = {
      function: "checkMaxBeginBalanceAndMaxTxCount",
    } as const;
    const roundLastAsset = block.asset.roundLastAsset;
    if (roundLastAsset.maxBeginBalance !== tickResult.maxBeginBalance) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `maxBeginBalance ${roundLastAsset.maxBeginBalance}`,
        be_compare_prop: `maxBeginBalance ${tickResult.maxBeginBalance}`,
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
    if (roundLastAsset.maxTxCount !== tickResult.maxTxCount) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `maxTxCount ${roundLastAsset.maxTxCount}`,
        be_compare_prop: `maxTxCount ${tickResult.maxTxCount}`,
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
  }
}
