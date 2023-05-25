import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  TrustAssetTransaction,
  NewTransactionRefuseReason,
  ACCOUNT_STATUS,
} from "@bfchain/core-model";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TrustAssetLogicVerifier");

@Injectable()
export class TrustAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: TrustAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent = false,
  ) {
    const { sourceChainMagic, assetType, sourceChainName, numberOfSignFor } =
      transaction.asset.trustAsset;
    if (
      !(sourceChainMagic === this.configHelper.magic && assetType === this.configHelper.assetType)
    ) {
      throw new ConsensusException(ERROR_LIST.TRUST_MAIN_ASSET_ONLY, {
        assetType,
        mainAsset: this.configHelper.assetType,
        errorId: NewTransactionRefuseReason.TRUST_MAIN_ASSET_ONLY,
      });
    }

    await this.isTrusteesFrozen(transaction.asset.trustAsset.trustees, accountGetterHelper);
    await this.helperLogicVerifier.isAssetExist(
      sourceChainName,
      sourceChainMagic,
      assetType,
      accountGetterHelper,
    );

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(
        accountMap,
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    }

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
          throw new ConsensusException(ERROR_LIST.ACCOUNT_FROZEN, {
            address: trusteeAccountInfo.address,
            errorId: NewTransactionRefuseReason.TRANSACTION_SENDER_ASSET_FROZEN,
          });
        }
      }
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: TrustAssetTransaction, byteLength: number) {
    const times = transaction.asset.trustAsset.numberOfSignFor + 1;
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times) +
        this.transactionHelper.calcTransactionBlobFee(transaction)
      ).toString(),
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
    const times = transaction.asset.trustAsset.numberOfSignFor + 1;
    return this.isFeeEnough(
      transaction.fee,
      (
        this.transactionHelper.calcTransactionMinFeeByMaxBytes(times, miningMachineMinFeePerByte) +
        this.transactionHelper.calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
      ).toString(),
    );
  }
}
