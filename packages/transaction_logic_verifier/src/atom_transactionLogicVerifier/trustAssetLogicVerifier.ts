import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  TrustAssetTransaction,
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
} from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  ACCOUNT_FROZEN,
  NOT_MATCH,
} from "@bfchain/core-util-exception";

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
  ) {
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    await this.isTrusteesFrozen(transaction.asset.trustAsset.trustees, accountGetterHelper);

    const Function_Exception_Detail = {
      function: "logicVerify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.trustAsset;

    const memAsset = await accountGetterHelper.getAsset(sourceChainMagic, assetType);

    if (!memAsset) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `chain with magic ${sourceChainMagic}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    if (memAsset.sourceChainName !== sourceChainName) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "sourcehChainName",
        be_compare_prop: "chainName",
        to_target: "chain asset",
        be_target: "trustAsset",
        ...Function_Exception_Detail,
      });
    }

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
