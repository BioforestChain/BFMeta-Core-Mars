import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  TrustAssetTransaction,
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
} from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  ACCOUNT_FROZEN,
  TRUST_MAIN_ASSET_ONLY,
} from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TrustAssetLogicVerifier");

@Injectable()
export class TrustAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: TrustAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.trustAsset;
    if (
      !(sourceChainMagic === this.configHelper.magic && assetType === this.configHelper.assetType)
    ) {
      throw new ConsensusException(TRUST_MAIN_ASSET_ONLY, {
        assetType,
        mainAsset: this.configHelper.assetType,
        errorId: NewTransactionRefuseReason.TRUST_MAIN_ASSET_ONLY,
        function: "verify",
      });
    }
    await this.isTrusteesFrozen(transaction.asset.trustAsset.trustees, accountGetterHelper);
    await this.helperLogicVerifier.isAssetExist(
      sourceChainName,
      sourceChainMagic,
      assetType,
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

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    this.eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction, eventEmitter);

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 委托账户是否处于冻结状态
   *
   * @param trustees
   */
  private async isTrusteesFrozen(
    trustees: string[],
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
  ) {
    // 委托资产的委托账户不能是冻结账户
    for (const trustee of trustees) {
      const trusteeAccountInfo = await accountGetterHelper.getAccountInfo(trustee);
      if (trusteeAccountInfo) {
        if (trusteeAccountInfo.accountStatus !== ACCOUNT_STATUS.NORMAL) {
          throw new ConsensusException(ACCOUNT_FROZEN, {
            address: trusteeAccountInfo.address,
            errorId: NewTransactionRefuseReason.TRANSACTION_SENDER_ASSET_FROZEN,
            function: "isTrusteesFrozen",
          });
        }
      }
    }
  }
}
