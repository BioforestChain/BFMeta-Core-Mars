import { TransferAssetTransaction, ACCOUNT_STATUS } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";
import { TransactionLogicVerifier } from "../_txbaseLogicVerifier";

const { ConsensusException } = CoreExceptionGenerator("VERIFIER", "TransactionLogicVerifier");

@Injectable()
export class TransferAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: TransferAssetTransaction,
    currentBlockHeight: number,
    accountMap: Map<string, BFChainCore.AccountInfoAndAssets>,
    skipListenEvent: boolean,
    eventEmitter: BFChainCore.ApplyTransactionEventEmitter,
  ) {
    const { sourceChainMagic, assetType, sourceChainName } = transaction.asset.transferAsset;

    await this.helperLogicVerifier.isAssetExist(sourceChainName, sourceChainMagic, assetType);

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
}
