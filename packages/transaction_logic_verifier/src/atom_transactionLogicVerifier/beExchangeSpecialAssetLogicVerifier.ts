import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import {
  BeExchangeSpecialAssetTransaction,
  RANGE_TYPE,
  EXCHANGE_DIRECTION,
  SPECIAL_ASSET_TYPE,
} from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeSpecialAssetLogicVerifier",
);

@Injectable()
export class BeExchangeSpecialAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: BeExchangeSpecialAssetTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const beExchangeSpecialAsset = transaction.asset.beExchangeSpecialAsset;
    const { transactionSignature } = beExchangeSpecialAsset;
    const toExchangeSpecialAssetJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeSpecialAssetTransactionJSON | undefined;
    if (!toExchangeSpecialAssetJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (toExchangeSpecialAssetJson.type !== this.transactionHelper.TO_EXCHANGE_SPECIAL_ASSET) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    this.isValidRecipientId(transaction, toExchangeSpecialAssetJson);
    this.isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson);

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

    const { eventLogicVerifier } = this;

    eventLogicVerifier.listenEventFee(cloneAccountsAssets, eventEmitter);

    const { exchangeDirection, exchangeAssetType } =
      transaction.asset.beExchangeSpecialAsset.exchangeSpecialAsset;
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_RECIPIENT) {
      eventLogicVerifier.listenEventUnfrozenAsset(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );

      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        eventLogicVerifier.listenEventChangeDAppidPossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        eventLogicVerifier.listenEventChangeLocationNamePossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
        eventLogicVerifier.listenEventChangeEntityPossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
    } else {
      eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);

      if (exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID) {
        eventLogicVerifier.listenEventUnfrozenDAppid(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME) {
        eventLogicVerifier.listenEventUnfrozenLocationName(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY) {
        eventLogicVerifier.listenEventUnfrozenEntity(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  private isValidRecipientId(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeSpecialAssetJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `BeExchangeSpecialAssetTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `ToExchangeSpecialAssetTransaction.senderId ${toExchangeSpecialAssetJson.senderId}`,
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  private isDependentTransactionMatch(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON>,
  ) {
    const beExchangeAssetAsset = transaction.asset.beExchangeSpecialAsset;
    const { exchangeSpecialAsset } = beExchangeAssetAsset;
    const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset } =
      exchangeSpecialAsset;
    const trsAsset = toExchangeSpecialAssetJson.asset.toExchangeSpecialAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeSpecialAsset: ${JSON.stringify(exchangeSpecialAsset.toJSON())}`,
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
      });
    }

    const { rangeType, range } = toExchangeSpecialAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.senderId}`,
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(资产交换)
   *
   * @param transaction
   * @param currentBlockHeight
   * @param transactionGetterHelper
   */
  async checkSecondaryTransaction(
    transaction: BeExchangeSpecialAssetTransaction,
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
        reason: `Can not secondary exchange special asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
      });
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: BeExchangeSpecialAssetTransaction) {
    const { transactionSignature, exchangeSpecialAsset } = transaction.asset.beExchangeSpecialAsset;
    const { exchangeAssetType, exchangeDirection, toExchangeAsset, beExchangeAsset } =
      exchangeSpecialAsset;
    const locks: string[] = [transactionSignature];
    if (exchangeDirection === EXCHANGE_DIRECTION.ASSET_FROM_SENDER) {
      if (
        exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY
      ) {
        locks.push(toExchangeAsset);
      }
    } else {
      if (
        exchangeAssetType === SPECIAL_ASSET_TYPE.DAPP_ID ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.LOCATION_NAME ||
        exchangeAssetType === SPECIAL_ASSET_TYPE.ENTITY
      ) {
        locks.push(beExchangeAsset);
      }
    }
    return locks;
  }
}
