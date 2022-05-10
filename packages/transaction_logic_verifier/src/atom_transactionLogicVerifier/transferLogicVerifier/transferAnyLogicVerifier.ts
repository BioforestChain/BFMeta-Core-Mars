import { TransferAnyTransaction, ACCOUNT_STATUS, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class TransferAnyLogicVerifier extends TransactionLogicVerifier<TransferAnyTransaction> {
  constructor() {
    super();
  }

  async verify(
    transaction: TransferAnyTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const { sender, recipient } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const { sourceChainName, sourceChainMagic, parentAssetType, assetType } =
      transaction.asset.transferAny;

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };
    const cloneAccountsInfo = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountInfo),
    };
    if (recipient && recipient.accountInfo && recipient.accountAssets) {
      this.checkRecipientStatus(assetType, recipient.accountInfo);
      const address = recipient.accountInfo.address;
      cloneAccountsAssets[address] = this.helperLogicVerifier.deepClone(recipient.accountAssets);
      cloneAccountsInfo[address] = this.helperLogicVerifier.deepClone(recipient.accountInfo);
    }

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(
        sourceChainName,
        sourceChainMagic,
        assetType,
        accountGetterHelper,
      );

      eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
    } else if (parentAssetType === PARENT_ASSET_TYPE.DAPP) {
      eventLogicVerifier.listenEventChangeDAppidPossessor(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      eventLogicVerifier.listenEventChangeLocationNamePossessor(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (parentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      eventLogicVerifier.listenEventChangeEntityPossessor(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );

      eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

      eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  checkRecipientStatus(assetType: string, accountInfo: BFChainCore.AccountInfo) {
    if (!accountInfo.hasOwnProperty("accountStatus")) {
      throw new ConsensusException(ERROR_LIST.PROP_LOSE, {
        prop: "accountStatus",
        target: "accountInfo",
      });
    }
    if (accountInfo.accountStatus === ACCOUNT_STATUS.FROZEN_OUT) {
      if (assetType !== this.configHelper.assetType) {
        throw new ConsensusException(ERROR_LIST.PERMISSION_DENIED, {
          operationName: `Transfer asset ${assetType} to ${accountInfo.address}, because ${accountInfo.address} was frozen`,
        });
      }
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: TransferAnyTransaction) {
    const { parentAssetType, assetType, taxInformation } = transaction.asset.transferAny;
    const locks: string[] = [];
    if (
      parentAssetType === PARENT_ASSET_TYPE.DAPP ||
      parentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      parentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(assetType);
      if (taxInformation) {
        locks.push(taxInformation.taxCollector);
      }
    }
    return locks;
  }
}
