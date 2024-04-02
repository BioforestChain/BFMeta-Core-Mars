import { ACCOUNT_STATUS, IncreaseAssetTransaction } from "@bfchain/core-model";
import { Injectable, Inject } from "@bfchain/util";
import { AccountBaseHelper, TransactionHelper } from "@bfchain/core-helper";
import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class IncreaseAssetLogicVerifier extends TransactionLogicVerifier {
  constructor(
    @Inject(AccountBaseHelper) public accountBaseHelper: AccountBaseHelper,
    @Inject(TransactionHelper) public transactionHelper: TransactionHelper,
  ) {
    super();
  }

  async verify(
    transaction: IncreaseAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfo>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.increaseAsset;

    await this.helperLogicVerifier.isAssetExist(sourceChainName, sourceChainMagic, assetType);

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
          operationName: `Increase asset ${assetType} to ${accountInfo.address}, because ${accountInfo.address} was frozen`,
        });
      }
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: IncreaseAssetTransaction) {
    return [transaction.type];
  }
}
