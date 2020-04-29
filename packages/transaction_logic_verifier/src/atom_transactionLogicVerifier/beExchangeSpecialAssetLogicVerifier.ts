import { TransactionLogicVerifier } from "./_txbaseLogicVerifier";
import { BeExchangeSpecialAssetTransaction, RANGE_TYPE } from "@bfchain/core-model";
import { Injectable } from "@bfchain/util";
import {
  CoreExceptionGenerator,
  NOT_EXIST,
  NOT_MATCH,
  CAN_NOT_SECONDARY_TRANSACTION,
  SHOULD_BE,
} from "@bfchain/core-util-exception";

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
    const sender = await this.logicVerify(
      transaction,
      currentBlockHeight,
      accountGetterHelper,
      transactionGetterHelper,
    );

    const beExchangeSpecialAsset = transaction.asset.beExchangeSpecialAsset;
    const { transactionSignature } = beExchangeSpecialAsset;
    const toExchangeSpecialAssetJson = (await transactionGetterHelper.getTransactionBySignature(
      transactionSignature,
    )) as BFChainCore.TransactionJSON<BFChainCore.ToExchangeSpecialAssetAssetJSON> | undefined;
    if (!toExchangeSpecialAssetJson) {
      throw new NoFoundException(NOT_EXIST, {
        prop: `Transaction with signature ${transactionSignature}`,
        target: "blockChain",
        ...Function_Exception_Detail,
      });
    }

    this.isValidRecipientId(transaction, toExchangeSpecialAssetJson);
    this.isDependentTransactionMatch(transaction, toExchangeSpecialAssetJson);

    return true;
  }

  /**
   * 接收账户是否合法
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  isValidRecipientId(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON
    >,
  ) {
    // be交易的接收账户必须是to交易的发起账户
    if (transaction.recipientId !== toExchangeSpecialAssetJson.senderId) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "recipientId",
        be_compare_prop: "senderId",
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
        function: "isValidRecipientId",
      });
    }
  }

  /**
   * 依赖的交易是否匹配
   *
   * @param transaction
   * @param toExchangeSpecialAssetJson
   */
  isDependentTransactionMatch(
    transaction: BeExchangeSpecialAssetTransaction,
    toExchangeSpecialAssetJson: BFChainCore.TransactionJSON<
      BFChainCore.ToExchangeSpecialAssetAssetJSON
    >,
  ) {
    const Function_Exception_Detail = {
      function: "isDependentTransactionMatch",
    } as const;
    const beExchangeAssetAsset = transaction.asset.beExchangeSpecialAsset;
    const { exchangeSpecialAsset } = beExchangeAssetAsset;
    const {
      toExchangeSource,
      toExchangeAsset,
      beExchangeSource,
      beExchangeAsset,
    } = exchangeSpecialAsset;
    const trsAsset = toExchangeSpecialAssetJson.asset.toExchangeSpecialAsset;
    if (
      trsAsset.toExchangeSource !== toExchangeSource ||
      trsAsset.beExchangeSource !== beExchangeSource ||
      trsAsset.toExchangeAsset !== toExchangeAsset ||
      trsAsset.beExchangeAsset !== beExchangeAsset
    ) {
      throw new ConsensusException(NOT_MATCH, {
        to_compare_prop: "exchangeSpecialAssetInfo",
        be_compare_prop: "exchangeSpecialAssetInfo",
        to_target: "BeExchangeSpecialAssetTransaction",
        be_target: "ToExchangeSpecialAssetTransaction",
        ...Function_Exception_Detail,
      });
    }

    const { rangeType, range } = toExchangeSpecialAssetJson;

    if (rangeType & RANGE_TYPE.MULTI_ADDRESS) {
      if (!range.includes(transaction.senderId)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "senderId",
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_DAPPID) {
      if (!transaction.dappid || !range.includes(transaction.dappid)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "dappid",
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    } else if (rangeType & RANGE_TYPE.MULTI_LOCATION_NAME) {
      if (!transaction.lns || !range.includes(transaction.lns)) {
        throw new ConsensusException(SHOULD_BE, {
          to_compare_prop: "lns",
          to_target: "beExchangeSpecialAssetTransaction",
          be_compare_prop: "teExchangeSpecialAssetTransaction.range",
          ...Function_Exception_Detail,
        });
      }
    }
  }

  /**
   * 不能二次操作同一笔交易(资产交换)
   *
   * @param tr
   */
  async checkSecondaryTransaction(
    transaction: BeExchangeSpecialAssetTransaction,
    transactionGetterHelper?: BFChainCore.TransactionGetterHelperInterface,
  ) {
    const Function_Exception_Detail = {
      function: "checkSecondaryTransaction",
    } as const;

    if (!transactionGetterHelper) {
      throw new NoFoundException(NOT_EXIST, {
        prop: "transactionGetterHelper",
        target: "moduleStroge",
        ...Function_Exception_Detail,
      });
    }

    const isSecondary = await transactionGetterHelper.checkSecondaryTransaction({
      senderId: transaction.senderId,
      storageValue: transaction.storageValue as string,
    });
    if (isSecondary) {
      throw new ConsensusException(CAN_NOT_SECONDARY_TRANSACTION, {
        reason: `Can not secondary exchange special asset, sender ${transaction.senderId} exchange transaction signature ${transaction.storageValue}`,
        ...Function_Exception_Detail,
      });
    }
  }
}
