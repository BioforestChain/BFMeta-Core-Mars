import { TransferAssetTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, PROP_LOSE, PERMISSION_DENIED } from "@bfchain/core-util-exception";
const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "TransactionLogicVerifier",
);

@Injectable()
export class TransferAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: TransferAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.transferAsset;

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

    this.eventLogicVerifier.listenEventAsset(cloneAccountsAssets, transaction, eventEmitter);

    await this.eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  checkRecipientStatus(assetType: string, accountInfo: BFChainCore.AccountInfo) {
    const Function_Exception_Detail = {
      function: "checkRecipientStatus",
    } as const;

    if (!accountInfo.hasOwnProperty("accountStatus")) {
      throw new ConsensusException(PROP_LOSE, {
        prop: "accountStatus",
        target: "accountInfo",
        ...Function_Exception_Detail,
      });
    }
    if (accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_OUT) {
      if (assetType !== this.configHelper.assetType) {
        throw new ConsensusException(PERMISSION_DENIED, {
          operationName: `Transfer asset ${assetType} to ${accountInfo.address}, because ${accountInfo.address} was frozen`,
          ...Function_Exception_Detail,
        });
      }
    }
  }
}
