import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import type { DAppPurchasingTransaction } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  DAPPID_IS_NOT_EXIST,
  NO_NEED_TO_PURCHASE_SPECIAL_ASSET,
  SHOULD_BE,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "DAppPurchasingLogicVerifier",
);

@Injectable()
export class DAppPurchasingLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: DAppPurchasingTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
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
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );
    const dappAsset = transaction.asset.dappPurchasing.dappAsset;
    const memDapp = (await accountGetterHelper.getDApp(
      dappAsset.sourceChainMagic,
      dappAsset.dappid,
      currentBlockHeight,
    )) as BFChainCore.DAppInfo;
    if (!memDapp) {
      throw new ConsensusException(DAPPID_IS_NOT_EXIST, {
        dappid: dappAsset.dappid,
        ...Function_Exception_Detail,
      });
    }

    if (transaction.senderId === memDapp.possessorAddress) {
      throw new ConsensusException(NO_NEED_TO_PURCHASE_SPECIAL_ASSET, {
        type: "dappid",
        asset: dappAsset.dappid,
        ...Function_Exception_Detail,
      });
    }

    if (transaction.recipientId !== memDapp.possessorAddress) {
      throw new ConsensusException(SHOULD_BE, {
        to_compare_prop: "recipientId",
        to_target: "transaction",
        be_compare_prop: "dapp possessor",
        ...Function_Exception_Detail,
      });
    }

    return true;
  }
}
