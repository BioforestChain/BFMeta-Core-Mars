import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeAssetTransaction, RANGE_TYPE } from "@bfchain/core-model";
import { Injectable, QueneEventEmitter } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
  SHOULD_BE,
} from "@bfchain/core-util-exception";

const { ConsensusException, NoFoundException } = CoreExceptionGenerator(
  "VERIFIER",
  "TransactionLogicVerifier",
);

@Injectable()
export class BeExchangeAssetLogicVerifier extends TransactionLogicVerifier {
  constructor() {
    super();
  }

  async verify(
    transaction: BeExchangeAssetTransaction,
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

    const beExchangeAssetAsset = transaction.asset.beExchangeAsset;
    const { transactionSignature } = beExchangeAssetAsset;
    const trs = (await transactionGetterHelper.getTransactionBySignature(transactionSignature)) as
      | BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>
      | undefined;
    if (!trs) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    this.isValidRecipientId(transaction, trs);
    this.isDependentTransactionMatch(transaction, trs);

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

    this.eventLogicVerifier.listenEventUnfrozenAsset(
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
   * @param toExchangeAssetJson
   */
  private isValidRecipientId(
    transaction: BeExchangeAssetTransaction,
    toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeAssetJson.senderId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `BeExchangeAssetTransaction recipientId ${transaction.recipientId}`,
        be_compare_prop: `ToExchangeAssetTransaction senderId ${toExchangeAssetJson.senderId}`,
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeAssetJson
   */
  private isDependentTransactionMatch(
    transaction: BeExchangeAssetTransaction,
    toExchangeAssetJson: BFChainCore.TransactionJSON<BFChainCore.ToExchangeAssetAssetJSON>,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const beExchangeAssetAsset = transaction.asset.beExchangeAsset;
    const { exchangeAsset } = beExchangeAssetAsset;
    const { toExchangeSource, toExchangeAsset, beExchangeSource, beExchangeAsset } = exchangeAsset;
    const trsAsset = toExchangeAssetJson.asset.toExchangeAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: `trsAsset: ${JSON.stringify(trsAsset)}`,
        be_compare_prop: `exchangeAsset: ${JSON.stringify(exchangeAsset.toJSON())}`,
        to_target: "BeExchangeAssetTransaction",
        be_target: "ToExchangeAssetTransaction",
        ...Function_Exception_Detail,
      });
    }
    const { rangeType, range } = toExchangeAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: `senderId ${transaction.senderId}`,
          to_target: "beExchangeAssetTransaction",
          be_compare_prop: "toExchangeAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: `dappid ${transaction.dappid}`,
          to_target: "beExchangeAssetTransaction",
          be_compare_prop: "toExchangeAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: `lns ${transaction.lns}`,
          to_target: "beExchangeAssetTransaction",
          be_compare_prop: "toExchangeAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  // /**
  //  * 不能二次操作同一笔交易(特殊资产交换)
  //  *
  //  * @param tr
  //  */
  // async checkSecondaryTransaction(
  //   transaction: BeExchangeAssetTransaction,
  //   transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  // ) {
  //   const Function_Exception_Detail = {
  //     function: "checkSecondaryTransaction",
  //   } as const;

  //   if (!transactionGetterHelper) {
  //     throw new NoFoundException(NOT_EXIST, {
  //       prop: "transactionGetterHelper",
  //       target: "moduleStroge",
  //       ...Function_Exception_Detail,
  //     });
  //   }

  //   const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
  //     senderId: transaction.senderId,
  //     storageValue: transaction.storageValue as string,
  //   });
  //   if (isSecondary) {
  //     throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
  //       reason: `Can not secondary exchange asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
  //       ...Function_Exception_Detail,
  //     });
  //   }
  // }
}
