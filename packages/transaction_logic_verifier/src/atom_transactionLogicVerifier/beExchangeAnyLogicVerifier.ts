import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeAnyTransaction, RANGE_TYPE, PARENT_ASSET_TYPE } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import { CoreExceptionGenerator, ERROR_LIST } from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "BeExchangeAnyLogicVerifier",
);

@Injectable()
export class BeExchangeAnyLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: BeExchangeAnyTransaction,
    currentBlockHeight: number,
    accountsInfo: {
      sender: BFChainCore.AccountInfoAndAssets;
      recipient?: BFChainCore.AccountInfoAndAssets;
    },
    accountGetterHelper: BFChainCore.AccountGetterHelperInterface,
    transactionGetterHelper: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const beExchangeAny = transaction.asset.beExchangeAny;
    const { transactionSignature } = beExchangeAny;
    const toExchangeAnyJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
      this.transactionHelper.calcTransactionQueryRange(currentBlockHeight),
    )) as BFChainCore.ToExchangeAnyTransactionJSON | undefined;
    if (!toExchangeAnyJson) {
      throw new NoFoundException(ERROR_LIST.NOT_EXIST_OR_EXPIRED, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
      });
    }

    if (toExchangeAnyJson.type !== this.transactionHelper.TO_EXCHANGE_ANY) {
      throw new ConsensusException(ERROR_LIST.NOT_EXPECTED_RELATED_TRANSACTION, {
        signature: `${transactionSignature}`,
      });
    }

    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAnyJson.senderId) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `BeExchangeAnyTransaction.recipientId ${transaction.recipientId}`,
        be_compare_prop: `ToExchangeAnyTransaction.senderId ${toExchangeAnyJson.senderId}`,
        to_target: "BeExchangeAnyTransaction",
        be_target: "ToExchangeAnyTransaction",
      });
    }

    this.isDependentTransactionMatch(transaction, toExchangeAnyJson);

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

    const { toExchangeParentAssetType, beExchangeParentAssetType, taxInformation } =
      beExchangeAny.exchangeAny;

    if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
      eventLogicVerifier.listenEventUnfrozenAsset(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
      eventLogicVerifier.listenEventUnfrozenDAppid(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
      eventLogicVerifier.listenEventUnfrozenLocationName(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );
    } else if (toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
      eventLogicVerifier.listenEventUnfrozenEntity(
        currentBlockHeight,
        accountGetterHelper,
        eventEmitter,
      );

      if (taxInformation && taxInformation.taxAssetPrealnum !== "0") {
        eventLogicVerifier.listenEventUnfrozenAsset(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      }
    } else {
      throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
        prop: `toExchangeParentAssetType ${toExchangeParentAssetType}`,
        target: "transaction.asset.beExchangeAny.exchangeAny",
      });
    }

    if (beExchangeAny.beExchangeAssetPrealnum !== "0") {
      if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ASSETS) {
        eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
      } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP) {
        eventLogicVerifier.listenEventChangeDAppidPossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME) {
        eventLogicVerifier.listenEventChangeLocationNamePossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );
      } else if (beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY) {
        eventLogicVerifier.listenEventChangeEntityPossessor(
          currentBlockHeight,
          accountGetterHelper,
          eventEmitter,
        );

        eventLogicVerifier.listenEventPayTax(currentBlockHeight, accountGetterHelper, eventEmitter);

        if (beExchangeAny.taxInformation && beExchangeAny.taxInformation.taxAssetPrealnum !== "0") {
          eventLogicVerifier.listenEventAsset(cloneAccountsAssets, eventEmitter);
        }
      } else {
        throw new ConsensusException(ERROR_LIST.PROP_IS_INVALID, {
          prop: `beExchangeParentAssetType ${beExchangeParentAssetType}`,
          target: "transaction.asset.beExchangeAny.exchangeAny",
        });
      }
    }

    await eventLogicVerifier.awaitEventResult(transaction, eventEmitter);

    return true;
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeAnyJson
   */
  private isDependentTransactionMatch(
    transaction: BeExchangeAnyTransaction,
    toExchangeAnyJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAnyAssetJSON>,
  ) {
    const beExchangeAny = transaction.asset.beExchangeAny;
    const { exchangeAny } = beExchangeAny;
    const {
      toExchangeSource,
      toExchangeAssetType,
      toExchangeParentAssetType,
      beExchangeSource,
      beExchangeAssetType,
      beExchangeParentAssetType,
    } = exchangeAny;
    const trsAsset = toExchangeAnyJson.asset.toExchangeAny;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeParentAssetType !== toExchangeParentAssetType ||
      trsAsset.beExchangeParentAssetType !== beExchangeParentAssetType ||
      trsAsset.toExchangeAssetType !== toExchangeAssetType ||
      trsAsset.beExchangeAssetType !== beExchangeAssetType
    ) {
      throw new ConsensusException(ERROR_LIST.NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeAny: ${JSON.stringify(exchangeAny.toJSON())}`,
        to_target: "BeExchangeAnyTransaction",
        be_target: "ToExchangeAnyTransaction",
      });
    }

    const { rangeType, range } = toExchangeAnyJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      range.push(toExchangeAnyJson.senderId);
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeAnyTransaction",
          be_compare_prop: "beExchangeAnyTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.senderId}`,
          to_target: "beExchangeAnyTransaction",
          be_compare_prop: "beExchangeAnyTransaction.range",
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(ERROR_LIST.SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeAnyTransaction",
          be_compare_prop: "beExchangeAnyTransaction.range",
        });
      }
    }
  }

  /**
   * 获取需要被加锁的数据
   *
   * @param transaction
   */
  getLockData(transaction: BeExchangeAnyTransaction) {
    const { transactionSignature, exchangeAny } = transaction.asset.beExchangeAny;
    const { toExchangeParentAssetType, beExchangeParentAssetType } = exchangeAny;
    const locks: string[] = [transactionSignature];
    if (
      toExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
      toExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      toExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(exchangeAny.toExchangeAssetType);
    }
    if (
      beExchangeParentAssetType === PARENT_ASSET_TYPE.DAPP ||
      beExchangeParentAssetType === PARENT_ASSET_TYPE.LOCATION_NAME ||
      beExchangeParentAssetType === PARENT_ASSET_TYPE.ENTITY
    ) {
      locks.push(exchangeAny.beExchangeAssetType);
    }
    return locks;
  }
}
