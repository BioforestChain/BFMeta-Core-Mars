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
    block: RoundLastBlock,
    blockGetterHelper = this.blockGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
  ) {
    // 校验链上链 hash
    const { height, remark } = block;
    const { newDelegates, hash } = remark;
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
        to_compare_prop: "number of new delegates",
        be_compare_prop: "number of new delegates",
        to_target: "block",
        be_target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
    // 校验新注册的受托人是否与区块携带的一致
    for (const address of newDelegates) {
      if (!realNewDelegates.includes(address)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: "new delegates",
          be_compare_prop: "new delegates",
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
    const hashString = await this.blockHelper.calcRoundLastBlockRemarkHash(
      height,
      blockGetterHelper,
    );
    if (hashString !== hash) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "remark hash",
        be_compare_prop: "remark hash",
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
    const nextRoundDelegates = block.remark.nextRoundDelegates;
    if (delegates.length !== nextRoundDelegates.length) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "nextRoundDelegates length",
        be_compare_prop: "nextRoundDelegates length",
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
    const blockRemark = block.remark;
    if (blockRemark.maxBeginBalance !== tickResult.maxBeginBalance) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "maxBeginBalance",
        be_compare_prop: "maxBeginBalance",
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
    if (blockRemark.maxTxCount !== tickResult.maxTxCount) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "maxTxCount",
        be_compare_prop: "maxTxCount",
        to_target: "block remark",
        be_target: "calculate",
        ...Function_Exception_Detail,
      });
    }
  }
}
