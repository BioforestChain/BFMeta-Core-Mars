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
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const mark = transaction.asset.mark;
    const { sourceChainMagic, dappid, sourceChainName } = mark.dapp;
    await this.isDAppidValid(
      sourceChainMagic,
      sourceChainName,
      dappid,
      currentBlockHeight,
      accountGetterHelper,
    );

    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
      cloneAccountsInfo[address] = this.helperLogicVerifier.deepClone(recipient.accountInfo);
    }

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    await this.eventLogicVerifier.awaitEventResult(transaction);

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
  private async isDAppidValid(
    magic: string,
    chainName: string,
    dappid: string,
    currentBlockHeight: number,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "isDAppidAlreadyExist",
    } as const;
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
        ...Function_Exception_Detail,
      });
    }
  }
}
