import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { MarkTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  DAPPID_IS_NOT_EXIST,
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
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
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
    const { sourceChainMagic, dappid } = mark.dapp;
    await this.isDAppidAlreadyExist(
      sourceChainMagic,
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
   * @param dappid
   * @param currentBlockHeight
   */
  async isDAppidAlreadyExist(
    magic: string,
    dappid: string,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
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
  }
}
