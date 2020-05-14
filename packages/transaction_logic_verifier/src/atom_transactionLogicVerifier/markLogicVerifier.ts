import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { MarkTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  DAPPID_IS_NOT_EXIST,
  NOT_MATCH,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "MarkLogicVerifier",
);

@Injectable()
export class MarkLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: MarkTransaction,
    currentBlockHeight: number,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const sender = this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const mark = transaction.asset.mark;
    const { sourceChainMagic, dappid, sourceChainName } = mark.dapp;
    await this.isDAppidValid(
      sourceChainMagic,
      sourceChainName,
      dappid,
      currentBlockHeight,
      accountGetterHelper,
    );

    return true;
  }

  /**
   * dappid 是否已经存在
   * 
   * @param magic 
   * @param chainName 
   * @param dappid 
   * @param currentBlockHeight 
   * @param accountGetterHelper 
   */
  async isDAppidValid(
    magic: string,
    chainName: string,
    dappid: string,
    currentBlockHeight: number,
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "isDAppidAlreadyExist",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    const memDapp = await accountGetterHelper.getDApp(magic, dappid, currentBlockHeight);
    if (!memDapp) {
      throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
        dappid,
        ...Function_Exception_Detail,
      });
    }

    if (chainName !== memDapp.sourceChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "sourceChainName",
        be_compare_prop: "sourceChainName",
        to_target: "mark",
        be_target: "blockChain dapp",
        ...Function_Exception_Detail
      })
    }
  }
}
