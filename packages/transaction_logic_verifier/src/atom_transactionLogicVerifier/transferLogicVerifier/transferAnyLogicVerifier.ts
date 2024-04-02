import { TransferAnyTransaction, ACCOUNT_STATUS, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class TransferAnyLogicVerifier extends TransactionLogicVerifier<TransferAnyTransaction> {
  constructor() {
    super();
  }

  async verify(
    transaction: TransferAnyTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { sourceChainName, sourceChainMagic, parentAssetType, assetType } =
      transaction.asset.transferAny;

    if (parentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      await this.helperLogicVerifier.isAssetExist(sourceChainName, sourceChainMagic, assetType);
    }

    const account = await this.helperLogicVerifier.getAccountForce(
      accountMap,
      transaction.recipientId,
      currentBlockHeight,
    );

    this.checkRecipientStatus(assetType, account);

    await this.logicVerify(transaction, currentBlockHeight, accountMap);

    const { eventLogicVerifier } = this;

    if (skipListenEvent === false) {
      eventLogicVerifier.listenEvent(accountMap, currentBlockHeight, eventEmitter);
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
