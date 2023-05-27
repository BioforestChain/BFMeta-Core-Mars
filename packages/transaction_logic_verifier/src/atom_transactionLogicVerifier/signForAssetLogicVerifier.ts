import type { SignForAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper } from "@bfchain/core-helper";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "SignForAssetLogicVerifier");

@Injectable()
export class SignForAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(@Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper) {
    super();
  }

  async verify(
    transaction: SignForAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { transactionSignature } = transaction.asset.signForAsset;

    const trs = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.TrustAssetTransactionJSON;

    if (!trs) {
      throw new ConsensusException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (trs.type !== this.transactionHelper.TRUST_ASSET) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    await this.isDependentTransactionMatch(transaction, trs);

    await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountMap,
      accountGetterHelper,
      transactionGetterHelper,
    );

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
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param trustAssetJson
   */
  private async isDependentTransactionMatch(
    transaction: SignForAssetTransaction,
    trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>,
  ) {
    const { trustAsset, trustSenderId, trustRecipientId } = transaction.asset.signForAsset;
    const trsAsset = trustAssetJson.asset.trustAsset;

    if (trustSenderId !== trustAssetJson.senderId) {
      throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
        to_compare_prop: `trustSenderId ${trustSenderId}`,
        be_compare_prop: `trustSenderId ${trustAssetJson.senderId}`,
        to_target: "SignForAssetTransaction.asset.signForAsset",
        be_target: "TrustAssetTransaction",
      });
    }

    // 签收交易的接收账户必须是委托交易的接收账户
    if (trustRecipientId !== trustAssetJson.recipientId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `recipientId ${transaction.recipientId}`,
        be_compare_prop: `recipientId ${trustAssetJson.recipientId}`,
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
      });
    }

    if (
      trsAsset.sourceChainMagic !== trustAsset.sourceChainMagic ||
      trsAsset.sourceChainName !== trustAsset.sourceChainName ||
      trsAsset.assetType !== trustAsset.assetType ||
      trsAsset.amount !== trustAsset.amount ||
      trsAsset.numberOfSignFor !== trustAsset.numberOfSignFor ||
      trsAsset.trustees.length !== trustAsset.trustees.length
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `trustAsset: ${JSON.stringify(trustAsset.toJSON())}`,
        to_target: "SignForAssetTransaction.asset.signForAsset",
        be_target: "TrustAssetTransaction.asset.trustAsset",
      });
    }

    const trustTrsRange = [...trsAsset.trustees];
    const trustRange = [...trustAsset.trustees];

    for (const address of trustTrsRange) {
      if (!trustRange.includes(address)) {
        throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
          to_compare_prop: `trustees: ${JSON.stringify(trustRange)}`,
          be_compare_prop: `address: ${address}`,
          to_target: "SignForAssetTransaction.asset.signForAsset.trustAsset",
          be_target: "TrustAssetTransaction.asset.trustAsset",
        });
      }
    }
  }

  /**
   * 校验交易的手续费是否大于等于网络手续费
   *
   * @param transaction
   * @param byteLength
   */
  checkTrsFeeAndWebFee(transaction: SignForAssetTransaction, byteLength: number) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper.calcTransactionBlobFee(transaction).toString(),
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
    transaction: SignForAssetTransaction,
    byteLength: number,
    miningMachineMinFeePerByte: BFChainCore.FractionJSON,
  ) {
    return this.isFeeEnough(
      transaction.fee,
      this.transactionHelper
        .calcTransactionBlobFee(transaction, miningMachineMinFeePerByte)
        .toString(),
    );
  }

  /**
   * 不能二次操作同一笔交易(权益委托)
   *
   * @param transaction
   * @param currentBlockHeight
   * @param transactionGetterHelper
   */
  async checkSecondaryTransaction(
    transaction: SignForAssetTransaction,
    currentBlockHeight: number,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(ERROR_LIST.CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary sign for asset, sender ${transaction.senderId} trust transaction signature ${transaction.storageValue}`,
      });
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: SignForAssetTransaction) {
    return [transaction.asset.signForAsset.transactionSignature];
  }
}
