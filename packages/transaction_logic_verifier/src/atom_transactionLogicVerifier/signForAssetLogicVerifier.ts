import type { SignForAssetTransaction, AccountSignatureModel } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, Inject, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
} from "@bfchain/core-util-exception";
import { AccountBaseHelper } from "@bfchain/core-helper";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "SignForAssetLogicVerifier",
);

@Injectable()
export class SignForAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(@Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper) {
    super();
  }

  async verify(
    transaction: SignForAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;

    const { transactionSignature } = transaction.asset.signForAsset;

    const trs = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>;

    if (!trs) {
      throw new ConsensusException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }
    this.isValidRecipientId(transaction, trs);
    await this.isDependentTransactionMatch(transaction, trs);

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

    this.eventLogicVerifier.listenEventSignForAsset(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
      eventEmitter,
    );

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param trustAssetJson
   */
  private isValidRecipientId(
    transaction: SignForAssetTransaction,
    trustAssetJson: BFChainCore.TransactionJSON<BFChainCore.TrustAssetAssetJSON>,
  ) {
    // 签收交易的接收账户必须是委托交易的接收账户
    if (transaction.recipientId !== trustAssetJson.recipientId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `SignForAssetTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `TrustAssetTransaction.recipientId ${trustAssetJson.recipientId}`,
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
        function: "isValidRecipientId",
      });
    }
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
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const { trustAsset } = transaction.asset.signForAsset;
    const trsAsset = trustAssetJson.asset.trustAsset;

    if (
      trsAsset.sourceChainMagic !== trustAsset.sourceChainMagic ||
      trsAsset.assetType !== trustAsset.assetType ||
      trsAsset.amount !== trustAsset.amount ||
      trsAsset.trustees.length !== trustAsset.trustees.length
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `trustAsset: ${JSON.stringify(trustAsset.toJSON())}`,
        to_target: "SignForAssetTransaction",
        be_target: "TrustAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const trustTrsRange = [...trsAsset.trustees];
    const trustRange = [...trustAsset.trustees];

    for (const address of trustTrsRange) {
      if (!trustRange.includes(address)) {
        throw new ConsensusException(NOT_MATCH, {
          to_compare_prop: `trustRange: ${JSON.stringify(trustRange)}`,
          be_compare_prop: `address: ${address}`,
          to_target: "SignForAssetTransaction",
          be_target: "TrustAssetTransaction",
          ...Function_Exception_Detail,
        });
      }
    }
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
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "checkSecondaryTransaction",
    } as const;

    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
      heightRange: this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    });
    if (isSecondary) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary sign for asset, sender ${transaction.senderId} trust transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
