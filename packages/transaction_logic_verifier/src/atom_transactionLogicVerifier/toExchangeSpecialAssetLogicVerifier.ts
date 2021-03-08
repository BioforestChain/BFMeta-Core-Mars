import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  ToExchangeSpecialAssetTransaction,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, PROP_IS_INVALID } from "@bfchain/core-util-exception";

const { ConsensusException } = CoreExceptionGenerator(
  "VERIFIER",
  "ToExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class ToExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: ToExchangeSpecialAssetTransaction,
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

    const toExchangeSpecialAssetAsset = transaction.asset.toExchangeSpecialAsset;
    const {
      toExchangeChainName,
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeChainName,
      beExchangeAsset,
      exchangeDirection,
      exchangeAssetType,
    } = toExchangeSpecialAssetAsset;
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
      await this.helperLogicVerifier.isAssetExist(
        beExchangeChainName,
        beExchangeSource,
        beExchangeAsset,
        accountGetterHelper,
      );
    } else if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      // 特殊资产来自发起账户，则要交换的 数字资产必须存在
      await this.helperLogicVerifier.isAssetExist(
        toExchangeChainName,
        toExchangeSource,
        toExchangeAsset,
        accountGetterHelper,
      );
    } else {
      throw new ConsensusException(PROP_IS_INVALID, {
        prop: "exchangeDirection",
        target: "toExchangeSpecialAssetAsset",
        ...Function_Exception_Detail,
      });
    }

    const { sender } = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountsInfo,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const cloneAccountsAssets = {
      [transaction.senderId]: this.helperLogicVerifier.deepClone(sender.accountAssets),
    };

    const eventEmitter = new QueneEventEmitter() as BFChainCore.ApplyTransactionEventEmitter;

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, transaction, eventEmitter);
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      eventLogicVerifier.listenEventFrozenAsset(cloneAccountsAssets, transaction, eventEmitter);
    } else {
      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        eventLogicVerifier.listenEventSaleDAppid(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else {
        eventLogicVerifier.listenEventSaleLocationName(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }
}
