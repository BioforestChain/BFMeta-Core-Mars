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
  TRANSACTION_FEE_NOT_ENOUGH,
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
    const {
      sourceChainMagic,
      assetType,
      sourceChainName,
      numberOfSignFor,
    } = transaction.asset.trustAsset;
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

    this.__checkTrsFee(transaction.fee, numberOfSignFor);

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

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);

    eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction, eventEmitter);

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

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

  private __checkTrsFee(fee: string, totalGrabableTimes: number) {
    const { maxTransactionSize, minTransactionFeePerByte } = this.configHelper;
    const byteLength = maxTransactionSize * (totalGrabableTimes + 1);
    const feePerByte = {
      numerator: BigInt(fee),
      denominator: byteLength,
    };
    const result = this.jsbiHelper.compareFraction(feePerByte, minTransactionFeePerByte);
    if (result < 0) {
      // 委托交易默认按照最大交易体付手续费
      const minFee = this.jsbiHelper
        .multiplyCeilFraction(feePerByte.denominator, minTransactionFeePerByte)
        .toString();
      throw new ConsensusException(TRANSACTION_FEE_NOT_ENOUGH, {
        errorId: NewTransactionRefuseReason.TRANSACTION_FEE_NOT_ENOUGH,
        minFee: minFee.toString(),
        target: "transaction",
        function: "__checkTrsFee",
      });
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: TrustAssetTransaction, byteLength: number) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionMinFeeByMaxBytes(
        transaction,
        transaction.asset.trustAsset.numberOfSignFor + 1,
      ),
    );
  }

  /**
   * 检验交易的手续费是否大于等于矿机手续费和网络手续费
   *
   * @param transaction
   * @param byteLength
   * @param miningMachineMinFeePerByte
   */
  checkTrsFeeAndMiningMachineFeeAndWebFee(
    transaction: TrustAssetTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionMinFeeByMaxBytes(
        transaction,
        transaction.asset.trustAsset.numberOfSignFor + 1,
        miningMachineMinFeePerByte,
      ),
    );
  }
}
