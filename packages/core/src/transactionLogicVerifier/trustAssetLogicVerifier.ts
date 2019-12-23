import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { TrustAssetTransaction, NewTransactionRefuseReason, ACCOUNT_STATUS } from "../../model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST, ACCOUNT_FROZEN } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "TrustAssetLogicVerifier",
);

@Injectable()
export class TrustAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: TrustAssetTransaction,
    currentBlockHeight: number,
    accountGetterHelper = this.accountGetterHelper,
    transactionGetterHelper = this.transactionGetterHelper,
    customTransactionCenter = this.customTransactionCenter,
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    await this.isTrusteesFrozen(transaction.asset.trustAsset.trustees, accountGetterHelper);

    return true;
  }

  /**
   * 委托账户是否处于冻结状态
   *
   * @param trustees
   */
  async isTrusteesFrozen(trustees: string[], accountGetterHelper = this.accountGetterHelper) {
    const Function_Exception_Detail = {
      function: "isTrusteesFrozen",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    // 委托资产的委托账户不能是冻结账户
    for (const trustee of trustees) {
      const trusteeAccountInfo = await accountGetterHelper.getAccountInfo(trustee);
      if (trusteeAccountInfo) {
        if (trusteeAccountInfo.accountStatus !== ACCOUNT_STATUS.NORMAL) {
          throw new ConsensusException(ACCOUNT_FROZEN, {
            address: trusteeAccountInfo.address,
            errorId: NewTransactionRefuseReason.TRANSACTION_SENDER_ASSET_FROZEN,
            ...Function_Exception_Detail,
          });
        }
      }
    }
  }
}
