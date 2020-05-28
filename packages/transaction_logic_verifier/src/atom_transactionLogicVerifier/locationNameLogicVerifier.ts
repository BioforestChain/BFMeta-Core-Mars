import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { LocationNameTransaction, LOCATION_NAME_OPERATION_TYPE } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import { CoreExceptionGenerator, NOT_EXIST } from "@bfchain/core-util-exception";
const { NoFoundException } = CoreExceptionGenerator("VERIFIER", "ImmigrateAssetLogicVerifier");

@Injectable()
export class LocationNameLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: LocationNameTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper?: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "verify",
    } as const;
    if (!accountGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "accountGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }
    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

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

    this.eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction);

    const operationType = transaction.asset.locationName.operationType;
    if (operationType === LOCATION_NAME_OPERATION_TYPE.REGISTRATION) {
      this.eventLogicVerifier.listenEventRegisterLocationName(
        currentBlockHeight,
        accountGetterHelper,
      );
    } else {
      this.eventLogicVerifier.listenEventCancelLocationName(
        transaction,
        currentBlockHeight,
        accountGetterHelper,
      );
    }

    await this.eventLogicVerifier.awaitEventResult(transaction);

    return true;
  }
}
